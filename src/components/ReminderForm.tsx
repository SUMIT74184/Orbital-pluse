"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveReminders, sendTestReminder, type ReminderState } from "@/app/actions/reminders";

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const label = (h: number) => `${String(h).padStart(2, "0")}:00 (${h % 12 || 12} ${h < 12 ? "AM" : "PM"})`;

function Status({ state }: { state: ReminderState }) {
  if (state?.ok) return <span className="text-sm text-pulse">{state.ok} ✓</span>;
  if (state?.error)
    return (
      <span role="alert" className="text-sm text-hard">
        {state.error}
      </span>
    );
  return null;
}

export function ReminderForm({
  initial,
  timezone,
  email,
  next,
  last,
}: {
  initial: { daily: boolean; weekly: boolean; hour: number };
  timezone: string;
  email: string;
  next: { daily: string | null; weekly: string | null };
  last: { when: string; kind: string; status: string; detail: string | null } | null;
}) {
  const [state, action, pending] = useActionState<ReminderState, FormData>(saveReminders, undefined);
  const [tState, testAction, testPending] = useActionState<ReminderState, FormData>(sendTestReminder, undefined);
  const box = "h-4 w-4 accent-[var(--color-pulse)]";

  return (
    <section id="reminders" className="card scroll-mt-24 space-y-4 p-5">
      <div>
        <h2 className="font-semibold">Email reminders</h2>
        <p className="mt-0.5 text-xs text-muted">
          Sent to {email} at the time below, in your timezone ({timezone}).{" "}
          <Link href="/settings" className="underline hover:text-ink">
            Change timezone
          </Link>
        </p>
      </div>

      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <label className="flex items-start gap-2.5 text-sm">
              <input type="checkbox" name="daily" defaultChecked={initial.daily} className={`${box} mt-0.5`} />
              <span>
                Daily plan
                <span className="block text-xs text-muted">Today&apos;s new questions, revisions due, backlog and topics. Skipped if there&apos;s nothing left to do.</span>
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-sm">
              <input type="checkbox" name="weekly" defaultChecked={initial.weekly} className={`${box} mt-0.5`} />
              <span>
                Weekly summary on Sundays
                <span className="block text-xs text-muted">What you solved and revised last week, overdue revisions and the pattern that needs attention.</span>
              </span>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted">Send at</span>
            <select
              name="hour"
              defaultValue={initial.hour}
              className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-pulse sm:w-44"
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {label(h)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(next.daily || next.weekly || last) && (
          <ul className="space-y-0.5 text-xs text-muted">
            {next.daily && <li>Next daily email: {next.daily}</li>}
            {next.weekly && <li>Next weekly summary: {next.weekly}</li>}
            {last && (
              <li className={last.status === "failed" ? "text-hard" : undefined}>
                Last {last.kind} email: {last.status} {last.when}
                {last.detail && last.status !== "sent" ? ` (${last.detail})` : ""}
              </li>
            )}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={pending} className="rounded-lg bg-pulse px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60">
            {pending ? "Saving…" : "Save reminders"}
          </button>
          <button
            formAction={testAction}
            disabled={testPending}
            className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-muted disabled:opacity-60"
          >
            {testPending ? "Sending…" : "Send me a test email"}
          </button>
          <Status state={tState ?? state} />
        </div>
      </form>
    </section>
  );
}
