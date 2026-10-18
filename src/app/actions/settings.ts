"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { resetTodayPlanIfUntouched } from "@/lib/plan";
import { scheduleFor } from "@/lib/reminders";
import { getCatalog } from "@/lib/catalog";

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
