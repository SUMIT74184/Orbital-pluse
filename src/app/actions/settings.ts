"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { resetTodayPlanIfUntouched } from "@/lib/plan";
import { scheduleFor } from "@/lib/reminders";
import { getCatalog } from "@/lib/catalog";
import { moveTopic } from "@/data/catalog";
import { THEMES, type Theme } from "@/data/theme";

export type SettingsState = { ok?: boolean; error?: string } | undefined;

const schema = z.object({
  dailyTarget: z.coerce.number().int().min(1).max(15),
  revisionDays: z
    .string()
    .transform((s) => [...new Set(s.split(/[\s,]+/).filter(Boolean).map(Number))].sort((a, b) => a - b))
    .pipe(z.array(z.number().int().min(1).max(365)).min(1, "Add at least one revision day").max(12)),
  timezone: z.string().refine((tz) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Unknown timezone"),
});

export async function saveSettings(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    dailyTarget: formData.get("dailyTarget"),
    revisionDays: formData.get("revisionDays"),
    timezone: formData.get("timezone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const cat = await getCatalog();
  const valid = new Set(cat.groups);
  const schedule = Array.from({ length: 7 }, (_, d) =>
    formData.getAll(`day-${d}`).map(String).filter((g) => valid.has(g)),
  );

  await connectDB();
  await User.updateOne(
    { _id: user.id },
    {
      $set: {
        ...parsed.data,
        schedule,
        // Keep choices for archived tracks so they come back as they were if restored.
        tracks: { ...user.tracks, ...Object.fromEntries(cat.tracks.map((t) => [t.key, formData.get(`track-${t.key}`) === "on"])) },
        // Reminder times are stored in UTC, so a new timezone moves them.
        ...(parsed.data.timezone !== user.timezone && {
          ...Object.fromEntries(Object.entries(scheduleFor(user.reminders, parsed.data.timezone)).map(([k, v]) => [`reminders.${k}`, v])),
        }),
      },
    },
  );
  // Rebuild today's plan with the new settings if nothing has been done on it yet.
  await resetTodayPlanIfUntouched({ ...user, ...parsed.data });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Drag-and-drop on the weekly rotation: moves one topic to another weekday and saves right away. */
export async function moveScheduleTopic(group: string, from: number, to: number): Promise<{ error?: string }> {
  const user = await requireUser();
  const day = z.number().int().min(0).max(6);
  if (!day.safeParse(from).success || !day.safeParse(to).success) return { error: "Unknown day" };
  const cat = await getCatalog();
  if (!cat.groups.includes(group)) return { error: "Unknown topic" };

  const schedule = moveTopic(user.schedule, group, from, to, cat.groups);
  if (schedule === user.schedule) return {};
  await connectDB();
  await User.updateOne({ _id: user.id }, { $set: { schedule } });
  // Today's new questions come from today's topics, so rebuild the plan if it hasn't been started.
  await resetTodayPlanIfUntouched({ ...user, schedule });
  revalidatePath("/", "layout");
  return {};
}

/** Settings → Appearance: saved right away; the page has already switched colours in the browser. */
export async function saveTheme(theme: Theme): Promise<{ error?: string }> {
  const user = await requireUser();
  if (!THEMES.includes(theme)) return { error: "Unknown theme" };
  await connectDB();
  try {
    // strict "throw": if the running server's User schema doesn't know `theme`, fail loudly instead of
    // reporting "Saved" while Mongoose quietly drops the field.
    await User.updateOne({ _id: user.id }, { $set: { theme } }, { strict: "throw" });
  } catch {
    return { error: "Couldn't save the theme" };
  }
  revalidatePath("/", "layout");
  return {};
}
