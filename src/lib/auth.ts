import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { after } from "next/server";
import { connectDB } from "./db";
import { ActiveDay, User, type Goal, type UserDoc } from "./models";
import { readSession } from "./session";
import { dateIn, todayIn } from "./dates";
import { DEFAULT_DAILY_TARGET, DEFAULT_REVISION_DAYS, DEFAULT_SCHEDULE } from "@/data/catalog";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  dailyTarget: number;
  revisionDays: number[];
  schedule: string[][];
  tracks: Record<string, boolean>; // explicit choices only; see trackOn() for defaults
  goal: Goal | null;
  isAdmin: boolean;
  reminders: { daily: boolean; weekly: boolean; hour: number; dailyAt: Date | null; weeklyAt: Date | null; testAt: Date | null };
  joined: string; // signup date in the user's timezone
};

/** Fills in defaults for fields older accounts don't have. Used by the session lookup and the email cron. */
export function toAppUser(u: UserDoc): AppUser {
  const timezone = u.timezone ?? "Asia/Kolkata";
  const r = u.reminders;
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    timezone,
    dailyTarget: u.dailyTarget ?? DEFAULT_DAILY_TARGET,
    revisionDays: u.revisionDays?.length ? [...u.revisionDays] : DEFAULT_REVISION_DAYS,
    schedule: u.schedule?.length === 7 ? u.schedule.map((d) => [...d]) : DEFAULT_SCHEDULE,
    tracks: { ...(u.tracks instanceof Map ? Object.fromEntries(u.tracks) : u.tracks) },
    goal: u.goal ?? null,
    isAdmin: isAdminEmail(u.email),
    reminders: {
      daily: r?.daily ?? false,
      weekly: r?.weekly ?? false,
      hour: r?.hour ?? 11,
      dailyAt: r?.dailyAt ?? null,
      weeklyAt: r?.weeklyAt ?? null,
      testAt: r?.testAt ?? null,
    },
    joined: u.createdAt ? dateIn(u.createdAt, timezone) : "1970-01-01",
  };
}

/** Admins are listed by email in ADMIN_EMAILS (comma separated). */
export function isAdminEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

const SEEN_EVERY_MS = 5 * 60_000;

/** Records that the user opened the app: last-seen time, plus one ActiveDay row per local day (DAU/MAU). */
function markSeen(u: UserDoc, timezone: string) {
  const now = new Date();
  const today = todayIn(timezone);
  const newDay = u.lastSeenOn !== today;
  if (!newDay && u.lastSeenAt && now.getTime() - u.lastSeenAt.getTime() < SEEN_EVERY_MS) return;
  after(async () => {
    await User.updateOne({ _id: u._id }, { $set: { lastSeenAt: now, lastSeenOn: today } });
    if (newDay) await ActiveDay.updateOne({ userId: u._id, date: today }, { $setOnInsert: { userId: u._id, date: today } }, { upsert: true });
  });
}

// Data access layer: every page and action resolves the user through here.
export const getUser = cache(async (): Promise<AppUser | null> => {
  const userId = await readSession();
  if (!userId) return null;
  await connectDB();
  const u = await User.findById(userId).lean();
  if (!u) return null;
  const user = toAppUser(u);
  markSeen(u, user.timezone);
  return user;
});

export async function requireUser(): Promise<AppUser> {
  const user = await getUser();
  if (!user) redirect((await readSession()) ? "/api/logout" : "/login");
  return user;
}

/** For the admin panel: anyone else gets a 404 so the panel's existence isn't advertised. */
export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser();
  if (!user.isAdmin) notFound();
  return user;
}
