"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Progress, TopicDone } from "@/lib/models";
import { addDays, todayIn } from "@/lib/dates";
import { QUESTION_BY_ID } from "@/data/catalog";
import { TRACKS, type TrackKind } from "@/data/topics";

async function ctx() {
  const user = await requireUser();
  await connectDB();
  return { user, userId: new Types.ObjectId(user.id), today: todayIn(user.timezone) };
}

function assertQid(qid: unknown): asserts qid is number {
  if (typeof qid !== "number" || !QUESTION_BY_ID.has(qid)) throw new Error("Unknown question");
}

export async function solveQuestion(qid: number) {
  assertQid(qid);
  const { user, userId, today } = await ctx();
  await Progress.updateOne(
    { userId, qid },
    {
      $setOnInsert: {
        solvedOn: today,
        revisions: user.revisionDays.map((offset) => ({ offset, due: addDays(today, offset), doneOn: null })),
      },
    },
    { upsert: true },
  );
  revalidatePath("/", "layout");
}

export async function unsolveQuestion(qid: number) {
  assertQid(qid);
  const { userId } = await ctx();
  await Progress.deleteOne({ userId, qid });
  revalidatePath("/", "layout");
}

/** Marks every revision that is due (including overdue ones) as done today. */
export async function reviseQuestion(qid: number) {
  assertQid(qid);
  const { userId, today } = await ctx();
  await Progress.updateOne(
    { userId, qid },
    { $set: { "revisions.$[r].doneOn": today } },
    { arrayFilters: [{ "r.doneOn": null, "r.due": { $lte: today } }] },
  );
  revalidatePath("/", "layout");
}

export async function undoRevision(qid: number) {
  assertQid(qid);
  const { userId, today } = await ctx();
  await Progress.updateOne(
    { userId, qid },
    { $set: { "revisions.$[r].doneOn": null } },
    { arrayFilters: [{ "r.doneOn": today }] },
  );
  revalidatePath("/", "layout");
}

export async function setTopicDone(kind: TrackKind, topicId: number, done: boolean) {
  if (!(kind in TRACKS) || !TRACKS[kind].topics.some((t) => t.id === topicId)) throw new Error("Unknown topic");
  const { userId, today } = await ctx();
  if (done) {
    await TopicDone.updateOne({ userId, kind, topicId }, { $setOnInsert: { doneOn: today } }, { upsert: true });
  } else {
    await TopicDone.deleteOne({ userId, kind, topicId });
  }
  revalidatePath("/", "layout");
}
