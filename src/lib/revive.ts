import "server-only";
import { Types } from "mongoose";
import { Plan, Progress, Revive, TopicDone, type ProgressDoc } from "./models";
import type { AppUser } from "./auth";
import { addDays } from "./dates";

// Clearing backlog repairs a broken streak: each missed day costs this many backlog solves, made after the gap.
export const QUESTIONS_PER_REVIVE = 2;
export const REVIVES_PER_MONTH = 3;

export type ReviveStatus = {
  left: number; // revives still available this calendar month
  gap: string[]; // the missed days right before the current run, oldest first; empty when there's nothing to repair
  need: number; // backlog solves still needed to repair the whole gap
  revivedToday: number; // days repaired today, for the "streak revived" note
};

/** Days with any solve, revision or finished topic. */
export function activeDates(progress: Pick<ProgressDoc, "solvedOn" | "revisions">[], topicDays: string[]) {
  const days = new Set<string>(topicDays);
  for (const p of progress) {
    days.add(p.solvedOn);
    for (const r of p.revisions ?? []) if (r.doneOn) days.add(r.doneOn);
  }
  return days;
}

/** Solve dates of questions solved after the day they were first assigned. */
export function backlogSolves(progress: Pick<ProgressDoc, "qid" | "solvedOn">[], plans: { date: string; newQids: number[] }[]) {
  const assigned = new Map<number, string>();
  for (const p of plans) for (const id of p.newQids) if (!assigned.has(id) || p.date < assigned.get(id)!) assigned.set(id, p.date);
  return progress.filter((p) => assigned.has(p.qid) && assigned.get(p.qid)! < p.solvedOn).map((p) => p.solvedOn);
}

export function reviveStatus(
  today: string,
  joined: string,
  active: Set<string>,
  backlog: string[],
  revives: { date: string; on: string }[],
): ReviveStatus {
  const left = Math.max(0, REVIVES_PER_MONTH - revives.filter((r) => r.on.slice(0, 7) === today.slice(0, 7)).length);
  const revivedToday = revives.filter((r) => r.on === today).length;
  const counts = (d: string) => active.has(d) || revives.some((r) => r.date === d);

  // The current run reaches back from today (today counts even before anything is done).
  let start = today;
  while (start > joined && counts(addDays(start, -1))) start = addDays(start, -1);

  // The gap stops at the previous active day; with no active day before it there is no streak to join.
  const gap: string[] = [];
  let d = addDays(start, -1);
  while (d >= joined && !counts(d) && gap.length <= left) {
    gap.unshift(d);
    d = addDays(d, -1);
  }
  if (d < joined || gap.length > left) return { left, gap: [], need: 0, revivedToday };

  // Solves already spent on earlier repairs in this run don't count twice.
  const credits =
    backlog.filter((s) => s >= start).length - QUESTIONS_PER_REVIVE * revives.filter((r) => r.on >= start).length;
  return { left, gap, need: Math.max(0, QUESTIONS_PER_REVIVE * gap.length - credits), revivedToday };
}

/** Called after a solve: fills in the missed days once enough backlog has been cleared. */
export async function tryRevive(user: AppUser, today: string) {
  const userId = new Types.ObjectId(user.id);
  const [progress, topics, plans, revives] = await Promise.all([
    Progress.find({ userId }, { qid: 1, solvedOn: 1, revisions: 1 }).lean(),
    TopicDone.find({ userId }, { doneOn: 1 }).lean(),
    Plan.find({ userId, date: { $lt: today } }, { date: 1, newQids: 1 }).lean(),
    Revive.find({ userId }, { date: 1, on: 1 }).lean(),
  ]);
  const active = activeDates(progress, topics.map((t) => t.doneOn));
  const s = reviveStatus(today, user.joined, active, backlogSolves(progress, plans), revives);
  if (!s.gap.length || s.need > 0) return;
  await Revive.bulkWrite(
    s.gap.map((date) => ({ updateOne: { filter: { userId, date }, update: { $setOnInsert: { userId, date, on: today } }, upsert: true } })),
    { ordered: false },
  );
}
