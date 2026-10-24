import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { Progress } from "@/lib/models";

/** Sends the user to a random question they haven't solved yet, or to the question list once everything is solved. */
export async function GET(req: Request) {
  const user = await requireUser();
  const [cat, solved] = await Promise.all([getCatalog(), Progress.find({ userId: new Types.ObjectId(user.id) }, { qid: 1 }).lean()]);
  const done = new Set(solved.map((p) => p.qid));
  const left = cat.questions.filter((q) => !done.has(q.id));
  const pick = left[Math.floor(Math.random() * left.length)];
  return NextResponse.redirect(pick ? pick.url : new URL("/questions", req.url));
}
