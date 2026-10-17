"use client";

import { useActionState, useMemo } from "react";
import { saveSettings, type SettingsState } from "@/app/actions/settings";
import { GROUPS, QUESTIONS, WEEKDAYS } from "@/data/catalog";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

type Initial = {
  dailyTarget: number;
  revisionDays: string;
  timezone: string;
  schedule: string[][];
  tracks: { sd: boolean; sql: boolean };
};

export function SettingsForm({ initial, timezones }: { initial: Initial; timezones: string[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, undefined);
  const counts = useMemo(
    () => Object.fromEntries(GROUPS.map((g) => [g, QUESTIONS.filter((q) => q.group === g).length])),
    [],
  );

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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="track-sd" defaultChecked={initial.tracks.sd} className="h-4 w-4 accent-[var(--color-topic)]" />
            Daily System Design topic
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="track-sql" defaultChecked={initial.tracks.sql} className="h-4 w-4 accent-[var(--color-topic)]" />
            Daily MySQL topic
          </label>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Weekly topic rotation</h2>
        <p className="mt-1 text-xs text-muted">Pick which patterns feed each weekday&apos;s new questions.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="py-2 pr-3 text-left font-medium">Pattern</th>
                {ORDER.map((d) => (
                  <th key={d} className="px-2 py-2 font-mono font-medium">
                    {WEEKDAYS[d]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {GROUPS.map((g) => (
                <tr key={g}>
                  <td className="py-2 pr-3">
                    {g} <span className="font-mono text-xs text-muted">({counts[g]})</span>
                  </td>
                  {ORDER.map((d) => (
                    <td key={d} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        name={`day-${d}`}
                        value={g}
                        defaultChecked={initial.schedule[d]?.includes(g)}
                        aria-label={`${g} on ${WEEKDAYS[d]}`}
                        className="h-4 w-4 accent-[var(--color-pulse)]"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
