import "server-only";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { ActiveDay, Event, Meta, Plan, Progress, TopicDone, User, type EventDoc, type UserDoc } from "./models";
import { toAppUser, type AppUser } from "./auth";
import { getCatalog, trackOn, type Catalog } from "./catalog";
import { getActivityDays, getProfileStats } from "./plan";
import { addDays, dateIn, diffDays, todayIn } from "./dates";

// Dates below are YYYY-MM-DD in each user's own timezone (that's how activity is stored),
// compared against "today" in the admin's timezone. Near midnight a user can land a day off.

/** ActiveDay only exists from when it was added, so seed it once from the activity already on record. */
async function backfillActiveDays() {
  if (await Meta.exists({ _id: "activedays-backfilled" })) return;
  const [progress, topics] = await Promise.all([
    Progress.find({}, { userId: 1, solvedOn: 1, revisions: 1 }).lean(),
    TopicDone.find({}, { userId: 1, doneOn: 1 }).lean(),
  ]);
  const rows = new Map<string, { userId: Types.ObjectId; date: string }>();
  const add = (userId: Types.ObjectId, date: string | null) => date && rows.set(`${userId}:${date}`, { userId, date });
  for (const p of progress) {
    add(p.userId, p.solvedOn);
    for (const r of p.revisions ?? []) add(p.userId, r.doneOn);
  }
  for (const t of topics) add(t.userId, t.doneOn);
  if (rows.size) {
    await ActiveDay.bulkWrite(
      [...rows.values()].map((r) => ({ updateOne: { filter: r, update: { $setOnInsert: r }, upsert: true } })),
      { ordered: false },
    );
  }
  await Meta.updateOne({ _id: "activedays-backfilled" }, { $set: { at: new Date() } }, { upsert: true });
}

const countBy = <T,>(xs: T[], key: (x: T) => string | null | undefined) => {
  const m = new Map<string, number>();
  for (const x of xs) {
    const k = key(x);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n);
};

type PlanRow = { userId: Types.ObjectId; date: string; newQids: number[] };
type ProgressRow = { userId: Types.ObjectId; qid: number; solvedOn: string };

/** Share of days with a plan where every new question was solved that same day. */
function hitRates(plans: PlanRow[], progress: ProgressRow[]) {
  const solved = new Set(progress.map((p) => `${p.userId}:${p.qid}:${p.solvedOn}`));
  const perUser = new Map<string, { hit: number; total: number }>();
  for (const p of plans) {
    if (!p.newQids.length) continue;
    const u = perUser.get(String(p.userId)) ?? { hit: 0, total: 0 };
    u.total++;
    if (p.newQids.every((q) => solved.has(`${p.userId}:${q}:${p.date}`))) u.hit++;
    perUser.set(String(p.userId), u);
  }
  return perUser;
}

function eventLabel(e: EventDoc, cat: Catalog) {
  if (e.qid != null) return cat.byId.get(e.qid)?.title ?? `Question #${e.qid}`;
  if (e.track) {
    const track = cat.trackByKey.get(e.track);
    return `${track?.allTopics.find((t) => t.id === e.topicId)?.title ?? `Topic ${e.topicId}`} · ${track?.name ?? e.track}`;
  }
  return null;
}

export type FeedItem = { at: Date; type: EventDoc["type"]; userId: string; userName: string; label: string | null };

async function feed(cat: Catalog, filter: Record<string, unknown>, limit: number): Promise<FeedItem[]> {
  const events = await Event.find(filter).sort({ at: -1 }).limit(limit).lean();
  const names = new Map(
    (await User.find({ _id: { $in: [...new Set(events.map((e) => String(e.userId)))] } }, { name: 1 }).lean()).map((u) => [String(u._id), u.name]),
  );
  return events.map((e) => ({
    at: e.at,
    type: e.type,
    userId: String(e.userId),
    userName: names.get(String(e.userId)) ?? "Deleted user",
    label: eventLabel(e, cat),
  }));
}

export async function getOverview(admin: AppUser) {
  await connectDB();
  await backfillActiveDays();
  const cat = await getCatalog();
  const today = todayIn(admin.timezone);
  const d30 = addDays(today, -29);
  const d7 = addDays(today, -6);

  const [users, activeRows, progress, topicsDone, plans, recent] = await Promise.all([
    User.find({}, { name: 1, email: 1, createdAt: 1, lastSeenAt: 1, dailyTarget: 1, goal: 1, tracks: 1, timezone: 1 }).lean(),
    ActiveDay.find({ date: { $gte: d30, $lte: today } }, { userId: 1, date: 1 }).lean(),
    Progress.find({ $or: [{ solvedOn: { $gte: d30 } }, { "revisions.doneOn": { $gte: d30 } }] }, { userId: 1, qid: 1, solvedOn: 1, revisions: 1 }).lean(),
    TopicDone.find({ doneOn: { $gte: d30 } }, { userId: 1, kind: 1, topicId: 1, doneOn: 1 }).lean(),
    Plan.find({ date: { $gte: d30, $lt: today } }, { userId: 1, date: 1, newQids: 1 }).lean(),
    feed(cat, {}, 25),
  ]);

  // ---- Engagement ----
  const activeOn = (from: string) => new Set(activeRows.filter((r) => r.date >= from).map((r) => String(r.userId))).size;
  const dau = activeOn(today);
  const wau = activeOn(d7);
  const mau = activeOn(d30);
  const joinedOn = users.map((u) => (u.createdAt ? dateIn(u.createdAt, admin.timezone) : null));
  const dormant = users.filter((u) => !u.lastSeenAt || Date.now() - u.lastSeenAt.getTime() > 14 * 86_400_000).length;

  const days: { date: string; active: number; signups: number; solved: number; revised: number; topics: number }[] = [];
  for (let d = d30; d <= today; d = addDays(d, 1)) days.push({ date: d, active: 0, signups: 0, solved: 0, revised: 0, topics: 0 });
  const day = new Map(days.map((x) => [x.date, x]));
  for (const r of activeRows) day.get(r.date)!.active++;
  for (const j of joinedOn) if (j && day.has(j)) day.get(j)!.signups++;

  // ---- What people study ----
  const solves = progress.filter((p) => p.solvedOn >= d30);
  const revisions = progress.flatMap((p) => (p.revisions ?? []).filter((r) => r.doneOn && r.doneOn >= d30).map((r) => ({ ...p, doneOn: r.doneOn! })));
  for (const p of solves) if (day.has(p.solvedOn)) day.get(p.solvedOn)!.solved++;
  for (const r of revisions) if (day.has(r.doneOn)) day.get(r.doneOn)!.revised++;
  for (const t of topicsDone) if (day.has(t.doneOn)) day.get(t.doneOn)!.topics++;

  const patternStats = new Map<string, { solves: number; revisions: number; users: Set<string> }>();
  const touch = (group: string | undefined, userId: Types.ObjectId, kind: "solves" | "revisions") => {
    if (!group) return;
    const s = patternStats.get(group) ?? { solves: 0, revisions: 0, users: new Set<string>() };
    s[kind]++;
    s.users.add(String(userId));
    patternStats.set(group, s);
  };
  for (const p of solves) touch(cat.byId.get(p.qid)?.group, p.userId, "solves");
  for (const r of revisions) touch(cat.byId.get(r.qid)?.group, r.userId, "revisions");
  const patterns = [...patternStats]
    .map(([group, s]) => ({ group, solves: s.solves, revisions: s.revisions, users: s.users.size, total: cat.counts[group] ?? 0 }))
    .sort((a, b) => b.solves + b.revisions - (a.solves + a.revisions));

  const topQuestions = countBy(solves, (p) => String(p.qid))
    .slice(0, 10)
    .map(({ label, n }) => ({ q: cat.byId.get(Number(label)), n }))
    .filter((x) => x.q);

  const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of solves) {
    const q = cat.byId.get(p.qid);
    if (q) byDifficulty[q.difficulty]++;
  }

  // ---- Areas of interest: what people say (goal) vs what they do (last 30 days) ----
  const appUsers = users.map((u) => toAppUser(u as UserDoc));
  const dsaUsers = new Set([...solves, ...revisions].map((p) => String(p.userId)));
  const areas = [
    {
      key: "dsa",
      name: "DSA",
      declared: appUsers.filter((u) => u.goal?.interests.includes("dsa")).length,
      enabled: appUsers.length,
      activeUsers: dsaUsers.size,
      actions: solves.length + revisions.length,
    },
    ...cat.tracks.map((t) => {
      const done = topicsDone.filter((x) => x.kind === t.key);
      return {
        key: t.key,
        name: t.name,
        declared: appUsers.filter((u) => u.goal?.interests.includes(t.key)).length,
        enabled: appUsers.filter((u) => trackOn(u.tracks, t)).length,
        activeUsers: new Set(done.map((x) => String(x.userId))).size,
        actions: done.length,
      };
    }),
  ];
  const topTopics = countBy(topicsDone, (t) => `${t.kind}:${t.topicId}`)
    .slice(0, 8)
    .map(({ label, n }) => {
      const [key, id] = label.split(":");
      const track = cat.trackByKey.get(key);
      return { track: track?.name ?? key, title: track?.allTopics.find((t) => t.id === Number(id))?.title ?? `Topic ${id}`, n };
    });

  // ---- Goals ----
  const goals = appUsers.map((u) => u.goal).filter((g) => g != null);
  const goalBucket = (date: string | null) => {
    if (!date) return null;
    const left = diffDays(date, today);
    return left < 0 ? "Date passed" : left <= 30 ? "Within 30 days" : left <= 90 ? "1–3 months" : left <= 180 ? "3–6 months" : "6+ months";
  };
  const hours = goals.map((g) => g.hoursPerWeek).filter((h) => h != null);
  const rates = hitRates(plans, solves);
  const rateTotals = [...rates.values()].reduce((a, r) => ({ hit: a.hit + r.hit, total: a.total + r.total }), { hit: 0, total: 0 });

  return {
    today,
    totals: {
      users: users.length,
      new7: joinedOn.filter((j) => j && j >= d7).length,
      new30: joinedOn.filter((j) => j && j >= d30).length,
      dau,
      wau,
      mau,
      stickiness: mau ? dau / mau : 0,
      dormant,
    },
    days,
    patterns,
    topQuestions,
    byDifficulty,
    areas,
    topTopics,
    goals: {
      withGoal: goals.length,
      roles: countBy(goals, (g) => g.role),
      levels: countBy(goals, (g) => g.level),
      companies: countBy(
        goals.flatMap((g) => g.companies.map((c) => c.trim())),
        (c) => c.replace(/\b\w/g, (ch) => ch.toUpperCase()),
      ).slice(0, 12),
      timeline: countBy(goals, (g) => goalBucket(g.targetDate)),
      avgHours: hours.length ? hours.reduce((a, b) => a + b, 0) / hours.length : null,
      dailyTargets: countBy(appUsers, (u) => String(u.dailyTarget)).sort((a, b) => Number(a.label) - Number(b.label)),
      hitRate: rateTotals.total ? rateTotals.hit / rateTotals.total : null,
      planDays: rateTotals.total,
    },
    recent,
  };
}

export type UserRow = {
  id: string;
  name: string;
  email: string;
  joined: string;
  lastSeenAt: Date | null;
  solved: number;
  topics: number;
  active30: number;
  hitRate: number | null;
  topPattern: string | null;
  goal: string | null;
};

export async function getUserRows(admin: AppUser): Promise<UserRow[]> {
  await connectDB();
  await backfillActiveDays();
  const cat = await getCatalog();
  const today = todayIn(admin.timezone);
  const d30 = addDays(today, -29);
  const [users, progress, topics, active, plans] = await Promise.all([
    User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 }).lean(),
    Progress.find({}, { userId: 1, qid: 1, solvedOn: 1 }).lean(),
    TopicDone.aggregate<{ _id: Types.ObjectId; n: number }>([{ $group: { _id: "$userId", n: { $sum: 1 } } }]),
    ActiveDay.aggregate<{ _id: Types.ObjectId; n: number }>([{ $match: { date: { $gte: d30 } } }, { $group: { _id: "$userId", n: { $sum: 1 } } }]),
    Plan.find({ date: { $gte: d30, $lt: today } }, { userId: 1, date: 1, newQids: 1 }).lean(),
  ]);
  const topicsBy = new Map(topics.map((t) => [String(t._id), t.n]));
  const activeBy = new Map(active.map((t) => [String(t._id), t.n]));
  const rates = hitRates(plans, progress);
  const progressBy = new Map<string, ProgressRow[]>();
  for (const p of progress) progressBy.set(String(p.userId), [...(progressBy.get(String(p.userId)) ?? []), p]);

  return users.map((doc) => {
    const u = toAppUser({ ...doc, passwordHash: "" });
    const mine = progressBy.get(u.id) ?? [];
    const rate = rates.get(u.id);
    const g = u.goal;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      joined: u.joined,
      lastSeenAt: doc.lastSeenAt ?? null,
      solved: mine.length,
      topics: topicsBy.get(u.id) ?? 0,
      active30: activeBy.get(u.id) ?? 0,
      hitRate: rate ? rate.hit / rate.total : null,
      topPattern: countBy(mine, (p) => cat.byId.get(p.qid)?.group)[0]?.label ?? null,
      goal: g ? [g.role, g.companies.slice(0, 2).join(", "), g.targetDate].filter(Boolean).join(" · ") || null : null,
    };
  });
}

export async function getUserDetail(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  const doc = await User.findById(id, { passwordHash: 0 }).lean();
  if (!doc) return null;
  const user = toAppUser({ ...doc, passwordHash: "" });
  const cat = await getCatalog();
  const today = todayIn(user.timezone);
  const [stats, days, events, plans, progress, activeDays] = await Promise.all([
    getProfileStats(user),
    getActivityDays(user, 30),
    feed(cat, { userId: doc._id }, 30),
    Plan.find({ userId: doc._id, date: { $gte: addDays(today, -29), $lt: today } }, { userId: 1, date: 1, newQids: 1 }).lean(),
    Progress.find({ userId: doc._id }, { userId: 1, qid: 1, solvedOn: 1 }).lean(),
    ActiveDay.countDocuments({ userId: doc._id, date: { $gte: addDays(today, -29) } }),
  ]);
  const rate = hitRates(plans, progress).get(user.id);
  const patterns = countBy(progress, (p) => cat.byId.get(p.qid)?.group).map(({ label, n }) => ({ group: label, solved: n, total: cat.counts[label] ?? 0 }));
  return {
    user,
    lastSeenAt: doc.lastSeenAt ?? null,
    stats,
    days,
    events,
    patterns,
    active30: activeDays,
    hitRate: rate ? { ...rate, pct: rate.hit / rate.total } : null,
    diffTotals: cat.diffTotals,
    areaNames: Object.fromEntries([["dsa", "DSA"], ...cat.allTracks.map((t) => [t.key, t.name])]) as Record<string, string>,
  };
}

/** How many users have solved each question / finished each track topic, for the content pages. */
export async function getContentUsage() {
  await connectDB();
  const [questions, topics] = await Promise.all([
    Progress.aggregate<{ _id: number; n: number }>([{ $group: { _id: "$qid", n: { $sum: 1 } } }]),
    TopicDone.aggregate<{ _id: { kind: string; topicId: number }; n: number }>([
      { $group: { _id: { kind: "$kind", topicId: "$topicId" }, n: { $sum: 1 } } },
    ]),
  ]);
  return {
    questions: Object.fromEntries(questions.map((q) => [q._id, q.n])) as Record<number, number>,
    topics: Object.fromEntries(topics.map((t) => [`${t._id.kind}:${t._id.topicId}`, t.n])) as Record<string, number>,
  };
}
