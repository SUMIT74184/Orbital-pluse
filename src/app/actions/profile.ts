"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Plan, Progress, TopicDone, User } from "@/lib/models";
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
  ]);
  await User.deleteOne({ _id: user.id });
  await deleteSession();
  redirect("/signup");
}
