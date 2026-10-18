"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { sendEmail } from "@/lib/email";
import { buildDaily, scheduleFor } from "@/lib/reminders";

export type ReminderState = { ok?: string; error?: string } | undefined;

const TEST_COOLDOWN_MS = 60_000;

const schema = z.object({
  daily: z.boolean(),
  weekly: z.boolean(),
  hour: z.coerce.number().int().min(0).max(23),
});

export async function saveReminders(_: ReminderState, formData: FormData): Promise<ReminderState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    daily: formData.get("daily") === "on",
    weekly: formData.get("weekly") === "on",
    hour: formData.get("hour"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await connectDB();
  const prefs = parsed.data;
  await User.updateOne(
    { _id: user.id },
    {
      $set: {
        "reminders.daily": prefs.daily,
        "reminders.weekly": prefs.weekly,
        "reminders.hour": prefs.hour,
        ...Object.fromEntries(Object.entries(scheduleFor(prefs, user.timezone)).map(([k, v]) => [`reminders.${k}`, v])),
      },
    },
  );
  revalidatePath("/profile");
  return { ok: prefs.daily || prefs.weekly ? "Reminders saved" : "Reminders turned off" };
}

export async function sendTestReminder(): Promise<ReminderState> {
  const user = await requireUser();
  await connectDB();
  // Claim the cooldown atomically so double-clicks can't send twice.
  const cutoff = new Date(Date.now() - TEST_COOLDOWN_MS);
  const claimed = await User.updateOne(
    { _id: user.id, $or: [{ "reminders.testAt": null }, { "reminders.testAt": { $exists: false } }, { "reminders.testAt": { $lt: cutoff } }] },
    { $set: { "reminders.testAt": new Date() } },
  );
  if (!claimed.modifiedCount) return { error: "Wait a minute before sending another test" };
  try {
    const email = await buildDaily(user, true);
    await sendEmail({ to: user.email, ...email! });
  } catch (err) {
    console.error("test reminder failed", err);
    return { error: "Couldn't send the email. Check the server's RESEND_API_KEY and EMAIL_FROM." };
  }
  return { ok: `Test email sent to ${user.email}` };
}
