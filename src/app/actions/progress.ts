"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Progress, TopicDone } from "@/lib/models";
import { addDays, todayIn } from "@/lib/dates";
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
        revisions: user.revisionDays.map((offset) => ({ offset, due: addDays(today, offset), doneOn: null })),
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

/** Marks every revision that is due (including overdue ones) as done today. */
export async function reviseQuestion(qid: number) {
  await assertQid(qid);
  const { user, userId, today } = await ctx();
  const res = await Progress.updateOne(
    { userId, qid },
    { $set: { "revisions.$[r].doneOn": today } },
    { arrayFilters: [{ "r.doneOn": null, "r.due": { $lte: today } }] },
  );
  if (res.modifiedCount) logEvent(user.id, "revise", { qid });
  revalidatePath("/", "layout");
}

export async function undoRevision(qid: number) {
  await assertQid(qid);
  const { userId, today } = await ctx();
  await Progress.updateOne(
    { userId, qid },
    { $set: { "revisions.$[r].doneOn": null } },
    { arrayFilters: [{ "r.doneOn": today }] },
  );
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
