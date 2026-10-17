import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connectDB } from "./db";
import { User } from "./models";
import { readSession } from "./session";
import { dateIn } from "./dates";
import { DEFAULT_DAILY_TARGET, DEFAULT_REVISION_DAYS, DEFAULT_SCHEDULE } from "@/data/catalog";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  timezone: string;
  dailyTarget: number;
  revisionDays: number[];
  schedule: string[][];
  tracks: { sd: boolean; sql: boolean };
  joined: string; // signup date in the user's timezone
};

// Data access layer: every page and action resolves the user through here.
export const getUser = cache(async (): Promise<AppUser | null> => {
  const userId = await readSession();
  if (!userId) return null;
  await connectDB();
  const u = await User.findById(userId).lean();
  if (!u) return null;
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    timezone: u.timezone ?? "Asia/Kolkata",
    dailyTarget: u.dailyTarget ?? DEFAULT_DAILY_TARGET,
    revisionDays: u.revisionDays?.length ? [...u.revisionDays] : DEFAULT_REVISION_DAYS,
    schedule: u.schedule?.length === 7 ? u.schedule.map((d) => [...d]) : DEFAULT_SCHEDULE,
    tracks: { sd: u.tracks?.sd ?? true, sql: u.tracks?.sql ?? true },
    joined: u.createdAt ? dateIn(u.createdAt, u.timezone ?? "Asia/Kolkata") : "1970-01-01",
  };
});

export async function requireUser(): Promise<AppUser> {
  const user = await getUser();
  if (!user) redirect((await readSession()) ? "/api/logout" : "/login");
  return user;
}
