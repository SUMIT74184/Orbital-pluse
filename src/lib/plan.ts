import "server-only";
import { cache } from "react";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { Plan, Progress, Revive, TopicDone, type PlanDoc, type ProgressDoc, type Revision } from "./models";
import type { AppUser } from "./auth";
import { addDays, diffDays, todayIn, weekdayOf } from "./dates";
import { activeDates, backlogSolves, reviveStatus } from "./revive";
import { getCatalog, trackOn, type Catalog, type CatalogTrack } from "./catalog";
import type { Difficulty, Question } from "@/data/catalog";
import type { Topic, TrackKind } from "@/data/topics";

const oid = (id: string) => new Types.ObjectId(id);

/** Round-robin across the day's groups so each day mixes topics instead of draining one. */
function pickNew(user: AppUser, date: string, taken: Set<number>, questions: Question[]): number[] {
  const todays = user.schedule[weekdayOf(date)] ?? [];
  const queues = todays.map((g) => questions.filter((q) => q.group === g && !taken.has(q.id)));
  const picked: number[] = [];
  while (picked.length < user.dailyTarget && queues.some((q) => q.length)) {
    for (const q of queues) {
      const next = q.shift();
      if (next && picked.length < user.dailyTarget) picked.push(next.id);
    }
  }
  if (picked.length < user.dailyTarget) {
    // Today's topics are exhausted: pull from groups not on any weekday first, then anything left.
    const scheduled = new Set(user.schedule.flat());
    const rest = [
      ...questions.filter((q) => !scheduled.has(q.group)),
      ...questions.filter((q) => scheduled.has(q.group)),
    ];
    for (const q of rest) {
      if (picked.length >= user.dailyTarget) break;
      if (!taken.has(q.id) && !picked.includes(q.id)) picked.push(q.id);
    }
  }
  return picked;
}

function nextTopic(track: CatalogTrack, done: Set<string>): number | null {
  const t = track.topics.find((t) => !done.has(`${track.key}:${t.id}`));
  return t ? t.id : null;
}

/** The plan's track topics; plans from before configurable tracks kept them in sdId / sqlId. */
export function planTopics(plan: PlanDoc): { track: string; topicId: number }[] {
  if (plan.topics) return plan.topics;
  return [
    ...(plan.sdId != null ? [{ track: "sd", topicId: plan.sdId }] : []),
    ...(plan.sqlId != null ? [{ track: "sql", topicId: plan.sqlId }] : []),
  ];
}

export async function getOrCreatePlan(user: AppUser, date: string): Promise<PlanDoc> {
  await connectDB();
  const userId = oid(user.id);
  const existing = await Plan.findOne({ userId, date }).lean();
  if (existing) return existing;

  const [cat, solved, pastPlans, topics] = await Promise.all([
    getCatalog(),
    Progress.find({ userId }, { qid: 1 }).lean(),
    Plan.find({ userId, date: { $lt: date } }, { newQids: 1 }).lean(),
    TopicDone.find({ userId }, { kind: 1, topicId: 1 }).lean(),
  ]);
  // Questions handed out on earlier days stay in the "missed" list rather than being re-assigned.
  const taken = new Set<number>([...solved.map((p) => p.qid), ...pastPlans.flatMap((p) => p.newQids)]);
  const done = new Set(topics.map((t) => `${t.kind}:${t.topicId}`));

  const doc = {
    userId,
    date,
    newQids: pickNew(user, date, taken, cat.questions),
    topics: cat.tracks
      .filter((t) => trackOn(user.tracks, t))
      .flatMap((t) => {
        const topicId = nextTopic(t, done);
        return topicId == null ? [] : [{ track: t.key, topicId }];
      }),
  };
  try {
    await Plan.create(doc);
  } catch (err) {
    if ((err as { code?: number }).code !== 11000) throw err; // another request created it first
  }
  return (await Plan.findOne({ userId, date }).lean())!;
}

/** Drops today's plan so it's rebuilt with new settings, unless work was already logged against it. */
export async function resetTodayPlanIfUntouched(user: AppUser) {
  await connectDB();
  const userId = oid(user.id);
  const today = todayIn(user.timezone);
  const plan = await Plan.findOne({ userId, date: today }).lean();
  if (!plan) return;
  const touched =
    (await Progress.exists({ userId, qid: { $in: plan.newQids }, solvedOn: today })) ||
    (await TopicDone.exists({ userId, doneOn: today }));
  if (!touched) await Plan.deleteOne({ _id: plan._id });
}

export type RevisionItem = {
  q: Question;
  revNo: number;
  revTotal: number;
  due: string;
  overdueBy: number;
  done: boolean;
};

export type DayActivity = { date: string; solved: number; revised: number; topics: number; revived: boolean };

export type TopicItem = {
  kind: TrackKind;
  trackName: string;
  trackTotal: number;
  position: number; // 1-based place of this topic in the track
  topic: Topic;
  done: boolean;
  doneToday: boolean;
};

/** A revision's round within its cycle ("Forgot" restarts at round 1) and the last round that cycle reaches. */
function roundOf(revs: Revision[], i: number) {
  const no = (k: number) => revs[k].round ?? k + 1;
  let end = i;
  while (end + 1 < revs.length && no(end + 1) > no(end)) end++;
  return { revNo: no(i), revTotal: no(end) };
}

function revisionItems(progress: ProgressDoc[], today: string, cat: Catalog): RevisionItem[] {
  const items: RevisionItem[] = [];
  for (const p of progress) {
    const q = cat.byId.get(p.qid);
    if (!q) continue;
    const revs = p.revisions ?? [];
    const pendingIdx = revs.findIndex((r) => !r.doneOn && r.due <= today);
    const doneTodayIdx = revs.findLastIndex((r) => r.doneOn === today);
    if (pendingIdx >= 0) {
      const due = revs[pendingIdx].due;
      // If several revisions piled up, one review today clears all of them.
      const lastDue = revs.findLastIndex((r) => !r.doneOn && r.due <= today);
      items.push({ q, ...roundOf(revs, lastDue), due, overdueBy: diffDays(today, due), done: false });
    } else if (doneTodayIdx >= 0) {
      items.push({ q, ...roundOf(revs, doneTodayIdx), due: revs[doneTodayIdx].due, overdueBy: 0, done: true });
    }
  }
  return items.sort((a, b) => Number(a.done) - Number(b.done) || b.overdueBy - a.overdueBy);
}

function activity(progress: ProgressDoc[], topicDays: string[], revivedDays: string[], from: string, to: string): DayActivity[] {
  const map = new Map<string, DayActivity>();
  for (let d = from; d <= to; d = addDays(d, 1)) map.set(d, { date: d, solved: 0, revised: 0, topics: 0, revived: false });
  for (const p of progress) {
    const s = map.get(p.solvedOn);
    if (s) s.solved++;
    for (const day of new Set((p.revisions ?? []).map((r) => r.doneOn).filter(Boolean) as string[])) {
      const a = map.get(day);
      if (a) a.revised++;
    }
  }
  for (const day of topicDays) {
    const a = map.get(day);
    if (a) a.topics++;
  }
  for (const day of revivedDays) {
    const a = map.get(day);
    if (a) a.revived = true;
  }
  return [...map.values()];
}

function streakOf(days: DayActivity[]): number {
  const active = (d: DayActivity) => d.revived || d.solved + d.revised + d.topics > 0;
  let i = days.length - 1;
  if (i >= 0 && !active(days[i])) i--; // today not started yet doesn't break the streak
  let n = 0;
  while (i >= 0 && active(days[i])) {
    n++;
    i--;
  }
  return n;
}

/** Topics done per live track, for tracks the user has on or has made progress in. */
function trackTotals(cat: Catalog, user: AppUser, done: { kind: string; topicId: number }[]) {
  return cat.tracks
    .map((t) => {
      const live = new Set(t.topics.map((x) => x.id));
      return { key: t.key, name: t.name, done: done.filter((d) => d.kind === t.key && live.has(d.topicId)).length, total: t.topics.length, on: trackOn(user.tracks, t) };
    })
    .filter((t) => t.on || t.done > 0);
}

// Cached per request: the page and the sidebar both read it.
export const getDashboard = cache(async (user: AppUser) => {
  const today = todayIn(user.timezone);
  const [plan, cat] = await Promise.all([getOrCreatePlan(user, today), getCatalog()]);
  const userId = oid(user.id);
  const [progress, pastPlans, topicsDone, revives] = await Promise.all([
    Progress.find({ userId }).lean(),
    Plan.find({ userId, date: { $lt: today } }, { newQids: 1, date: 1 }).sort({ date: 1 }).lean(),
    TopicDone.find({ userId }).lean(),
    Revive.find({ userId }, { date: 1, on: 1 }).lean(),
  ]);
  const solvedOn = new Map(progress.map((p) => [p.qid, p.solvedOn]));
  const topicDone = new Map(topicsDone.map((t) => [`${t.kind}:${t.topicId}`, t.doneOn]));

  const newItems = plan.newQids
    .filter((id) => cat.byId.has(id))
    .map((id) => ({ q: cat.byId.get(id)!, solvedOn: solvedOn.get(id) ?? null }));

  // Archived questions drop out of the backlog; ones already solved stay in revisions.
  const missedMap = new Map<number, string>();
  for (const p of pastPlans)
    for (const id of p.newQids) if (!solvedOn.has(id) && !missedMap.has(id) && cat.byId.get(id)?.archived === false) missedMap.set(id, p.date);
  const missed = [...missedMap].map(([id, date]) => ({ q: cat.byId.get(id)!, assignedOn: date }));

  const revisions = revisionItems(progress, today, cat);

  const topics: TopicItem[] = [];
  for (const { track: kind, topicId: id } of planTopics(plan)) {
    const track = cat.trackByKey.get(kind);
    const topic = track?.allTopics.find((t) => t.id === id);
    if (!track || !topic) continue;
    const doneOn = topicDone.get(`${kind}:${id}`);
    const position = track.topics.findIndex((t) => t.id === id) + 1;
    topics.push({ kind, trackName: track.name, trackTotal: track.topics.length, position, topic, done: !!doneOn, doneToday: doneOn === today });
  }

  const total = newItems.length + revisions.length + topics.length;
  const done =
    newItems.filter((i) => i.solvedOn).length + revisions.filter((r) => r.done).length + topics.filter((t) => t.done).length;

  const topicDays = topicsDone.map((t) => t.doneOn);
  const days = activity(progress, topicDays, revives.map((r) => r.date), addDays(today, -29), today);
  const revive = reviveStatus(today, user.joined, activeDates(progress, topicDays), backlogSolves(progress, pastPlans), revives);

  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of progress) {
    const q = cat.byId.get(p.qid);
    if (q) byDifficulty[q.difficulty]++;
  }
  const byGroup = cat.groups.map((g) => ({
    group: g,
    total: cat.counts[g],
    solved: progress.filter((p) => cat.byId.get(p.qid)?.group === g).length,
  }));
  const revisionsDone = progress.reduce((n, p) => n + (p.revisions ?? []).filter((r) => r.doneOn).length, 0);
  const revisionsTotal = progress.reduce((n, p) => n + (p.revisions ?? []).length, 0);

  return {
    today,
    weekdayGroups: user.schedule[weekdayOf(today)] ?? [],
    newItems,
    missed,
    revisions,
    topics,
    percent: total ? Math.round((done / total) * 100) : 100,
    done,
    total,
    days,
    streak: streakOf(days),
    revive,
    stats: {
      solved: progress.length,
      totalQuestions: cat.questions.length,
      byDifficulty,
      byGroup,
      revisionsDone,
      revisionsTotal,
      tracks: trackTotals(cat, user, topicsDone),
    },
  };
});

export type CalendarItem = {
  qid: number;
  title: string;
  url: string;
  group: string;
  difficulty: Difficulty;
  revNo: number;
  revTotal: number;
  due: string;
  doneOn: string | null;
};

/**
 * Every revision due from `back` days ago to `ahead` days out (done or not), plus everything still overdue,
 * and how many questions are waiting on each revision round.
 */
export async function getRevisionCalendar(user: AppUser, back = 42, ahead = 70) {
  await connectDB();
  const { byId } = await getCatalog();
  const today = todayIn(user.timezone);
  const from = addDays(today, -back);
  const to = addDays(today, ahead);
  const progress = await Progress.find({ userId: oid(user.id) }).lean();

  const solvedByGroup: Record<string, number> = {};
  const items: CalendarItem[] = [];
  const overdue: CalendarItem[] = [];
  const stages: number[] = user.revisionDays.map(() => 0); // questions whose next revision is round i + 1
  let mastered = 0;
  for (const p of progress) {
    const q = byId.get(p.qid);
    if (!q) continue;
    solvedByGroup[q.group] = (solvedByGroup[q.group] ?? 0) + 1;
    const revs = p.revisions ?? [];
    const next = revs.findIndex((r) => !r.doneOn);
    if (revs.length && next < 0) mastered++;
    else if (next >= 0) {
      const stage = roundOf(revs, next).revNo - 1;
      stages[stage] = (stages[stage] ?? 0) + 1;
    }
    revs.forEach((r, i) => {
      const item: CalendarItem = {
        qid: q.id,
        title: q.title,
        url: q.url,
        group: q.group,
        difficulty: q.difficulty,
        ...roundOf(revs, i),
        due: r.due,
        doneOn: r.doneOn ?? null,
      };
      if (!r.doneOn && r.due < today) overdue.push(item);
      if (r.due >= from && r.due <= to) items.push(item);
    });
  }
  return {
    today,
    from,
    to,
    items: items.sort((a, b) => a.due.localeCompare(b.due) || b.revNo - a.revNo),
    overdue: overdue.sort((a, b) => a.due.localeCompare(b.due)),
    solvedByGroup,
    stages: stages.map((n) => n ?? 0),
    mastered,
  };
}

export async function getQuestionStates(user: AppUser) {
  await connectDB();
  const today = todayIn(user.timezone);
  const userId = oid(user.id);
  const [progress, pastPlans] = await Promise.all([
    Progress.find({ userId }).lean(),
    Plan.find({ userId, date: { $lt: today } }, { newQids: 1 }).lean(),
  ]);
  const states: Record<number, { solvedOn: string; nextDue: string | null; revDone: number; revTotal: number }> = {};
  for (const p of progress) {
    const revs = p.revisions ?? [];
    const next = revs.findIndex((r) => !r.doneOn);
    const round = next >= 0 ? roundOf(revs, next) : null;
    states[p.qid] = {
      solvedOn: p.solvedOn,
      nextDue: next >= 0 ? revs[next].due : null,
      revDone: round ? round.revNo - 1 : revs.length,
      revTotal: round ? round.revTotal : revs.length,
    };
  }
  const backlog = [...new Set(pastPlans.flatMap((p) => p.newQids))].filter((id) => !states[id]);
  return { today, states, backlog };
}

export async function getTrackStates(user: AppUser) {
  await connectDB();
  const done = await TopicDone.find({ userId: oid(user.id) }).lean();
  return Object.fromEntries(done.map((t) => [`${t.kind}:${t.topicId}`, t.doneOn])) as Record<string, string>;
}

export async function getProfileStats(user: AppUser) {
  await connectDB();
  const cat = await getCatalog();
  const userId = oid(user.id);
  const today = todayIn(user.timezone);
  const [progress, topics, revives] = await Promise.all([
    Progress.find({ userId }).lean(),
    TopicDone.find({ userId }).lean(),
    Revive.find({ userId }, { date: 1 }).lean(),
  ]);

  const activeDays = activeDates(progress, topics.map((t) => t.doneOn));
  // Revived days keep a streak going but aren't active days.
  const streakDays = new Set([...activeDays, ...revives.map((r) => r.date)]);

  // Longest run of consecutive streak days, and the current one (today may still be pending).
  const sorted = [...streakDays].sort();
  let longest = 0;
  let run = 0;
  sorted.forEach((d, i) => {
    run = i > 0 && diffDays(d, sorted[i - 1]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  });
  let current = 0;
  for (let d = streakDays.has(today) ? today : addDays(today, -1); streakDays.has(d); d = addDays(d, -1)) current++;

  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  const byGroup: Record<string, number> = {};
  for (const p of progress) {
    const q = cat.byId.get(p.qid);
    if (!q) continue;
    byDifficulty[q.difficulty]++;
    byGroup[q.group] = (byGroup[q.group] ?? 0) + 1;
  }
  const groupTotals = cat.counts;
  const strongest = Object.entries(byGroup)
    .filter(([g]) => groupTotals[g])
    .map(([g, n]) => ({ group: g, solved: n, pct: n / groupTotals[g] }))
    .sort((a, b) => b.pct - a.pct || b.solved - a.solved)[0];

  const revs = progress.flatMap((p) => p.revisions ?? []);
  const mastered = progress.filter((p) => (p.revisions ?? []).length > 0 && p.revisions.every((r) => r.doneOn)).length;

  return {
    memberDays: diffDays(today, user.joined) + 1,
    solved: progress.length,
    totalQuestions: cat.questions.length,
    byDifficulty,
    revisionsDone: revs.filter((r) => r.doneOn).length,
    revisionsPending: revs.filter((r) => !r.doneOn && r.due <= today).length,
    mastered,
    tracks: trackTotals(cat, user, topics),
    activeDays: activeDays.size,
    longestStreak: longest,
    currentStreak: current,
    strongest: strongest ?? null,
  };
}

/** Per-day activity over the last `days` days, without creating a plan (safe for the admin view of another user). */
export async function getActivityDays(user: AppUser, days = 30) {
  await connectDB();
  const userId = oid(user.id);
  const today = todayIn(user.timezone);
  const [progress, topics, revives] = await Promise.all([
    Progress.find({ userId }).lean(),
    TopicDone.find({ userId }, { doneOn: 1 }).lean(),
    Revive.find({ userId }, { date: 1 }).lean(),
  ]);
  return activity(progress, topics.map((t) => t.doneOn), revives.map((r) => r.date), addDays(today, -(days - 1)), today);
}

/** The last `weeks` weeks of activity for the contribution calendar, starting on a Sunday so columns are whole weeks. */
export async function getContributions(user: AppUser, weeks = 53) {
  const today = todayIn(user.timezone);
  return { today, days: await getActivityDays(user, weekdayOf(today) + 1 + (weeks - 1) * 7) };
}
