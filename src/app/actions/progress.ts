"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Progress, TopicDone } from "@/lib/models";
import { addDays, diffDays, todayIn } from "@/lib/dates";
import { getCatalog } from "@/lib/catalog";
import { logEvent } from "@/lib/events";
import type { TrackKind } from "@/data/topics";

async function ctx() {
  const user = await requireUser();
  await connectDB();
  return { user, userId: new Types.ObjectId(user.id), today: todayIn(user.timezone) };
}

async function assertQid(qid: unknown) {
  if (typeof qid !== "number" || !(await getCatalog()).byId.has(qid)) throw new Error("Unknown question");
}

export async function solveQuestion(qid: number) {
  await assertQid(qid);
  const { user, userId, today } = await ctx();
  const res = await Progress.updateOne(
    { userId, qid },
    {
      $setOnInsert: {
        solvedOn: today,
        revisions: user.revisionDays.map((offset, i) => ({ round: i + 1, offset, due: addDays(today, offset), doneOn: null })),
      },
    },
    { upsert: true },
  );
  if (res.upsertedCount) logEvent(user.id, "solve", { qid });
  revalidatePath("/", "layout");
}

export async function unsolveQuestion(qid: number) {
  await assertQid(qid);
  const { userId } = await ctx();
  await Progress.deleteOne({ userId, qid });
  revalidatePath("/", "layout");
}

const RATINGS = ["forgot", "good", "easy"] as const;

/**
 * Marks every revision that is due (including overdue ones) as done today. "Easy" also drops the next round
 * (never the last), so the gap grows; "Forgot" replaces the rounds still ahead with a fresh schedule from today.
 */
export async function reviseQuestion(qid: number, rating: (typeof RATINGS)[number] = "good") {
  await assertQid(qid);
  if (!RATINGS.includes(rating)) throw new Error("Unknown rating");
  const { user, userId, today } = await ctx();
  const p = await Progress.findOne({ userId, qid }).lean();
  const revs = p?.revisions ?? [];
  if (!p || !revs.some((r) => !r.doneOn && r.due <= today)) return;

  let next = revs.map((r, i) => ({ ...r, round: r.round ?? i + 1, doneOn: r.doneOn ?? (r.due <= today ? today : null) }));
  if (rating === "easy") {
    const skip = next.findIndex((r) => !r.doneOn);
    if (skip >= 0 && skip < next.length - 1) next.splice(skip, 1);
  } else if (rating === "forgot") {
    next = [
      ...next.filter((r) => r.doneOn),
      ...user.revisionDays.map((d, i) => ({ round: i + 1, offset: diffDays(addDays(today, d), p.solvedOn), due: addDays(today, d), doneOn: null })),
    ];
  }
  await Progress.updateOne({ _id: p._id }, { $set: { revisions: next, undo: { on: today, revisions: revs } } });
  logEvent(user.id, "revise", { qid });
  revalidatePath("/", "layout");
}

export async function undoRevision(qid: number) {
  await assertQid(qid);
  const { userId, today } = await ctx();
  const p = await Progress.findOne({ userId, qid }, { undo: 1 }).lean();
  if (p?.undo?.on === today) {
    await Progress.updateOne({ _id: p._id }, { $set: { revisions: p.undo.revisions }, $unset: { undo: 1 } });
  } else {
    // Reviews logged before ratings existed have no snapshot; they only ever set doneOn.
    await Progress.updateOne(
      { userId, qid },
      { $set: { "revisions.$[r].doneOn": null } },
      { arrayFilters: [{ "r.doneOn": today }] },
    );
  }
  revalidatePath("/", "layout");
}

export async function setTopicDone(kind: TrackKind, topicId: number, done: boolean) {
  const track = typeof kind === "string" ? (await getCatalog()).trackByKey.get(kind) : undefined;
  if (!track?.allTopics.some((t) => t.id === topicId)) throw new Error("Unknown topic");
  const { user, userId, today } = await ctx();
  if (done) {
    const res = await TopicDone.updateOne({ userId, kind, topicId }, { $setOnInsert: { doneOn: today } }, { upsert: true });
    if (res.upsertedCount) logEvent(user.id, "topic", { track: kind, topicId });
  } else {
    await TopicDone.deleteOne({ userId, kind, topicId });
  }
  revalidatePath("/", "layout");
}
