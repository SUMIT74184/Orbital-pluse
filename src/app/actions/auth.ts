"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { createSession, deleteSession } from "@/lib/session";

export type AuthState = { error?: string; fields?: Record<string, string> } | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  timezone: z.string().max(64).optional(),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

function validTimezone(tz?: string) {
  if (!tz) return "Asia/Kolkata";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "Asia/Kolkata";
  }
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  const fields = { name: String(formData.get("name") ?? ""), email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  const { name, email, password, timezone } = parsed.data;
  await connectDB();
  if (await User.exists({ email })) return { error: "An account with this email already exists", fields };

  let user;
  try {
    user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), timezone: validTimezone(timezone) });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return { error: "An account with this email already exists", fields };
    throw err;
  }
  await createSession(String(user._id));
  redirect("/dashboard");
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const fields = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { error: parsed.error.issues[0].message, fields };

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email }).lean();
  const ok = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!ok) return { error: "Invalid email or password", fields };

  await createSession(String(user._id));
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
