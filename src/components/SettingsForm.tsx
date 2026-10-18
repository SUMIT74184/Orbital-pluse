"use client";

import { useActionState, useState } from "react";
import { saveSettings, type SettingsState } from "@/app/actions/settings";
import { DEFAULT_SCHEDULE, WEEKDAYS } from "@/data/catalog";
import type { CatalogMeta } from "@/lib/catalog";
import { TopicChip, WeekRotation, groupColor } from "./WeekRotation";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

type Initial = {
  dailyTarget: number;
  revisionDays: string;
  timezone: string;
  schedule: string[][];
  tracks: { key: string; name: string; on: boolean }[];
};

export function SettingsForm({
  initial,
  timezones,
  today,
  meta,
}: {
  initial: Initial;
  timezones: string[];
  today: number;
  meta: CatalogMeta;
}) {
  const GROUPS = meta.groups;
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, undefined);
  const [schedule, setSchedule] = useState(initial.schedule);

  const toggle = (day: number, group: string) =>
    setSchedule((s) =>
      s.map((groups, d) =>
        d !== day
          ? groups
          : groups.includes(group)
            ? groups.filter((g) => g !== group)
            : GROUPS.filter((g) => g === group || groups.includes(g)), // keep sheet order
      ),
    );

  const unassigned = GROUPS.filter((g) => !schedule.some((day) => day.includes(g)));
  const input = "rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-pulse";

  return (
    <form action={action} className="space-y-5">
      <section className="card grid gap-5 p-5 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">New questions per day</span>
          <input name="dailyTarget" type="number" min={1} max={15} defaultValue={initial.dailyTarget} className={`${input} w-full`} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Revise after (days)</span>
          <input name="revisionDays" defaultValue={initial.revisionDays} className={`${input} w-full font-mono`} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Timezone</span>
          <select name="timezone" defaultValue={initial.timezone} className={`${input} w-full`}>
            {timezones.map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-5 sm:col-span-3">
          {initial.tracks.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name={`track-${t.key}`} defaultChecked={t.on} className="h-4 w-4 accent-[var(--color-topic)]" />
              Daily {t.name} topic
            </label>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Weekly topic rotation</h2>
            <p className="mt-1 text-xs text-muted">Click a day next to a pattern to add or remove it. The preview updates as you go.</p>
          </div>
          <button
            type="button"
            onClick={() => setSchedule(DEFAULT_SCHEDULE)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-muted hover:text-ink"
          >
            Reset to default
          </button>
        </div>

        <div className="mt-4">
          <WeekRotation schedule={schedule} today={today} meta={meta} />
        </div>

        {/* Hidden inputs carry the schedule into the server action. */}
        {schedule.map((groups, d) => groups.map((g) => <input key={`${d}-${g}`} type="hidden" name={`day-${d}`} value={g} />))}

        <ul className="mt-6 grid gap-x-8 gap-y-1 lg:grid-cols-2">
          {GROUPS.map((g) => {
            const days = ORDER.filter((d) => schedule[d]?.includes(g));
            return (
              <li key={g} className="flex items-center justify-between gap-3 border-b border-line/60 py-2">
                <div className="min-w-0">
                  <TopicChip group={g} meta={meta} />
                </div>
                <div className="flex shrink-0 gap-1" role="group" aria-label={`Days for ${g}`}>
                  {ORDER.map((d) => {
                    const on = days.includes(d);
                    const c = groupColor(g, GROUPS);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggle(d, g)}
                        aria-pressed={on}
                        aria-label={`${g} on ${WEEKDAYS[d]}`}
                        className={`h-7 w-8 rounded-md border font-mono text-[11px] transition ${
                          on ? "font-semibold text-black" : "border-line text-muted hover:border-muted hover:text-ink"
                        } ${d === today && !on ? "border-pulse/40" : ""}`}
                        style={on ? { background: c, borderColor: c } : undefined}
                      >
                        {WEEKDAYS[d].slice(0, 2)}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>

        {unassigned.length > 0 && (
          <p className="mt-4 rounded-lg border border-medium/30 bg-medium/10 px-3 py-2 text-xs text-medium">
            Not on any day: {unassigned.map((g) => `${g} (${meta.counts[g]})`).join(", ")}. These are only used once a day&apos;s own
            patterns run out.
          </p>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-lg bg-pulse px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state?.ok && <span className="text-sm text-pulse">Saved ✓</span>}
        {state?.error && <span className="text-sm text-hard">{state.error}</span>}
      </div>
    </form>
  );
}
