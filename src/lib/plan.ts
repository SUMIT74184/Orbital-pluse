import "server-only";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { Plan, Progress, TopicDone, type PlanDoc, type ProgressDoc } from "./models";
import type { AppUser } from "./auth";
import { addDays, diffDays, todayIn, weekdayOf } from "./dates";
import { GROUPS, QUESTIONS, QUESTION_BY_ID, type Question } from "@/data/catalog";
import { TRACKS, type Topic, type TrackKind } from "@/data/topics";

const oid = (id: string) => new Types.ObjectId(id);

/** Round-robin across the day's groups so each day mixes topics instead of draining one. */
function pickNew(user: AppUser, date: string, taken: Set<number>): number[] {
  const todays = user.schedule[weekdayOf(date)] ?? [];
  const queues = todays.map((g) => QUESTIONS.filter((q) => q.group === g && !taken.has(q.id)));
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
      ...QUESTIONS.filter((q) => !scheduled.has(q.group)),
      ...QUESTIONS.filter((q) => scheduled.has(q.group)),
    ];
    for (const q of rest) {
      if (picked.length >= user.dailyTarget) break;
      if (!taken.has(q.id) && !picked.includes(q.id)) picked.push(q.id);
    }
  }
  return picked;
}

function nextTopic(kind: TrackKind, done: Set<string>): number | null {
  const t = TRACKS[kind].topics.find((t) => !done.has(`${kind}:${t.id}`));
  return t ? t.id : null;
}

export async function getOrCreatePlan(user: AppUser, date: string): Promise<PlanDoc> {
  await connectDB();
  const userId = oid(user.id);
  const existing = await Plan.findOne({ userId, date }).lean();
  if (existing) return existing;

  const [solved, pastPlans, topics] = await Promise.all([
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
    newQids: pickNew(user, date, taken),
    sdId: user.tracks.sd ? nextTopic("sd", done) : null,
    sqlId: user.tracks.sql ? nextTopic("sql", done) : null,
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

export type DayActivity = { date: string; solved: number; revised: number; topics: number };

export type TopicItem = { kind: TrackKind; topic: Topic; done: boolean; doneToday: boolean };

function revisionItems(progress: ProgressDoc[], today: string): RevisionItem[] {
  const items: RevisionItem[] = [];
  for (const p of progress) {
    const q = QUESTION_BY_ID.get(p.qid);
    if (!q) continue;
    const revs = p.revisions ?? [];
    const pendingIdx = revs.findIndex((r) => !r.doneOn && r.due <= today);
    const doneTodayIdx = revs.findLastIndex((r) => r.doneOn === today);
    if (pendingIdx >= 0) {
      const due = revs[pendingIdx].due;
      // If several revisions piled up, one review today clears all of them.
      const lastDue = revs.findLastIndex((r) => !r.doneOn && r.due <= today);
      items.push({ q, revNo: lastDue + 1, revTotal: revs.length, due, overdueBy: diffDays(today, due), done: false });
    } else if (doneTodayIdx >= 0) {
      items.push({ q, revNo: doneTodayIdx + 1, revTotal: revs.length, due: revs[doneTodayIdx].due, overdueBy: 0, done: true });
    }
  }
  return items.sort((a, b) => Number(a.done) - Number(b.done) || b.overdueBy - a.overdueBy);
}

function activity(progress: ProgressDoc[], topicDays: string[], from: string, to: string): DayActivity[] {
  const map = new Map<string, DayActivity>();
  for (let d = from; d <= to; d = addDays(d, 1)) map.set(d, { date: d, solved: 0, revised: 0, topics: 0 });
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
  return [...map.values()];
}

function streakOf(days: DayActivity[]): number {
  const active = (d: DayActivity) => d.solved + d.revised + d.topics > 0;
  let i = days.length - 1;
  if (i >= 0 && !active(days[i])) i--; // today not started yet doesn't break the streak
  let n = 0;
  while (i >= 0 && active(days[i])) {
    n++;
    i--;
  }
  return n;
}

export async function getDashboard(user: AppUser) {
  const today = todayIn(user.timezone);
  const plan = await getOrCreatePlan(user, today);
  const userId = oid(user.id);
  const [progress, pastPlans, topicsDone] = await Promise.all([
    Progress.find({ userId }).lean(),
    Plan.find({ userId, date: { $lt: today } }, { newQids: 1, date: 1 }).sort({ date: 1 }).lean(),
    TopicDone.find({ userId }).lean(),
  ]);
  const solvedOn = new Map(progress.map((p) => [p.qid, p.solvedOn]));
  const topicDone = new Map(topicsDone.map((t) => [`${t.kind}:${t.topicId}`, t.doneOn]));

  const newItems = plan.newQids.map((id) => ({ q: QUESTION_BY_ID.get(id)!, solvedOn: solvedOn.get(id) ?? null }));

  const missedMap = new Map<number, string>();
  for (const p of pastPlans) for (const id of p.newQids) if (!solvedOn.has(id) && !missedMap.has(id)) missedMap.set(id, p.date);
  const missed = [...missedMap].map(([id, date]) => ({ q: QUESTION_BY_ID.get(id)!, assignedOn: date }));

  const revisions = revisionItems(progress, today);

  const topics: TopicItem[] = [];
  for (const [kind, id] of [["sd", plan.sdId], ["sql", plan.sqlId]] as const) {
    if (id == null) continue;
    const topic = TRACKS[kind].topics.find((t) => t.id === id);
    if (!topic) continue;
    const doneOn = topicDone.get(`${kind}:${id}`);
    topics.push({ kind, topic, done: !!doneOn, doneToday: doneOn === today });
  }

  const total = newItems.length + revisions.length + topics.length;
  const done =
    newItems.filter((i) => i.solvedOn).length + revisions.filter((r) => r.done).length + topics.filter((t) => t.done).length;

  const days = activity(progress, topicsDone.map((t) => t.doneOn), addDays(today, -29), today);

  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of progress) {
    const q = QUESTION_BY_ID.get(p.qid);
    if (q) byDifficulty[q.difficulty]++;
  }
  const byGroup = GROUPS.map((g) => ({
    group: g,
    total: QUESTIONS.filter((q) => q.group === g).length,
    solved: progress.filter((p) => QUESTION_BY_ID.get(p.qid)?.group === g).length,
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
    stats: {
      solved: progress.length,
      totalQuestions: QUESTIONS.length,
      byDifficulty,
      byGroup,
      revisionsDone,
      revisionsTotal,
      sdDone: topicsDone.filter((t) => t.kind === "sd").length,
      sqlDone: topicsDone.filter((t) => t.kind === "sql").length,
    },
  };
}

/** Revisions coming up over the next `days` days, grouped by date (overdue first). */
export async function getUpcoming(user: AppUser, days = 14) {
  await connectDB();
  const today = todayIn(user.timezone);
  const end = addDays(today, days - 1);
  const progress = await Progress.find({ userId: oid(user.id), "revisions.doneOn": null }).lean();
  const overdue: { q: Question; due: string; revNo: number }[] = [];
  const byDate = new Map<string, { q: Question; revNo: number; total: number }[]>();
  for (let d = today; d <= end; d = addDays(d, 1)) byDate.set(d, []);
  for (const p of progress) {
    const q = QUESTION_BY_ID.get(p.qid);
    if (!q) continue;
    const revs = p.revisions ?? [];
    revs.forEach((r, i) => {
      if (r.doneOn) return;
      if (r.due < today) overdue.push({ q, due: r.due, revNo: i + 1 });
      else byDate.get(r.due)?.push({ q, revNo: i + 1, total: revs.length });
    });
  }
  return {
    today,
    overdue: overdue.sort((a, b) => a.due.localeCompare(b.due)),
    days: [...byDate].map(([date, items]) => ({ date, weekday: weekdayOf(date), groups: user.schedule[weekdayOf(date)] ?? [], items })),
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
    states[p.qid] = {
      solvedOn: p.solvedOn,
      nextDue: revs.find((r) => !r.doneOn)?.due ?? null,
      revDone: revs.filter((r) => r.doneOn).length,
      revTotal: revs.length,
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
