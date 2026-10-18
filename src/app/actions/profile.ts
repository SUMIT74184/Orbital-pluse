"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ActiveDay, EmailLog, Event, GOAL_LEVELS, Plan, Progress, TopicDone, User } from "@/lib/models";
import { getCatalog } from "@/lib/catalog";
import { deleteSession } from "@/lib/session";

export type FormState = { ok?: string; error?: string } | undefined;

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.email("Enter a valid email").trim().toLowerCase(),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await connectDB();
  const { name, email } = parsed.data;
  if (email !== user.email && (await User.exists({ email }))) return { error: "That email is already used by another account" };
  try {
    await User.updateOne({ _id: user.id }, { $set: { name, email } });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return { error: "That email is already used by another account" };
    throw err;
  }
  revalidatePath("/", "layout");
  return { ok: "Profile updated" };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(8, "New password must be at least 8 characters").max(100),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "New passwords don't match" });

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await connectDB();
  const doc = await User.findById(user.id, { passwordHash: 1 }).lean();
  if (!doc || !(await bcrypt.compare(parsed.data.current, doc.passwordHash))) return { error: "Current password is incorrect" };
  await User.updateOne({ _id: user.id }, { $set: { passwordHash: await bcrypt.hash(parsed.data.next, 10) } });
  return { ok: "Password changed" };
}

export async function deleteAccount(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (String(formData.get("confirm") ?? "").trim().toLowerCase() !== user.email) {
    return { error: "Type your email exactly to confirm" };
  }
  await connectDB();
  await Promise.all([
    Progress.deleteMany({ userId: user.id }),
    Plan.deleteMany({ userId: user.id }),
    TopicDone.deleteMany({ userId: user.id }),
    EmailLog.deleteMany({ userId: user.id }),
    ActiveDay.deleteMany({ userId: user.id }),
    Event.deleteMany({ userId: user.id }),
  ]);
  await User.deleteOne({ _id: user.id });
  await deleteSession();
  redirect("/signup");
}

const goalSchema = z.object({
  role: z.string().trim().max(40).transform((s) => s || null),
  companies: z
    .string()
    .max(300)
    .transform((s) => [...new Set(s.split(",").map((c) => c.trim()).filter(Boolean))])
    .pipe(z.array(z.string().max(40)).max(8, "List at most 8 companies")),
  targetDate: z
    .string()
    .transform((s) => s || null)
    .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date").nullable()),
  level: z
    .string()
    .transform((s) => s || null)
    .pipe(z.enum(GOAL_LEVELS).nullable()),
  hoursPerWeek: z
    .string()
    .transform((s) => (s ? Number(s) : null))
    .pipe(z.number().int("Hours must be a whole number").min(1).max(100).nullable()),
});

export async function saveGoal(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = goalSchema.safeParse({
    role: String(formData.get("role") ?? ""),
    companies: String(formData.get("companies") ?? ""),
    targetDate: String(formData.get("targetDate") ?? ""),
    level: String(formData.get("level") ?? ""),
    hoursPerWeek: String(formData.get("hoursPerWeek") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const valid = new Set(["dsa", ...(await getCatalog()).tracks.map((t) => t.key)]);
  const interests = formData.getAll("interests").map(String).filter((k) => valid.has(k));
  await connectDB();
  await User.updateOne({ _id: user.id }, { $set: { goal: { ...parsed.data, interests, updatedAt: new Date() } } });
  revalidatePath("/", "layout");
  return { ok: "Goal saved" };
}
