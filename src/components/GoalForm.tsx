"use client";

import { useActionState } from "react";
import { saveGoal, type FormState } from "@/app/actions/profile";
import type { Goal } from "@/lib/models";

const input =
  "w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/20";

const ROLES = ["Intern", "SDE-1", "SDE-2", "Senior SDE", "Staff+", "Data / Analytics", "Switching into tech"];

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{text}</span>
      {children}
    </label>
  );
}

export function GoalForm({ goal, areas }: { goal: Goal | null; areas: { key: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveGoal, undefined);
  const interests = new Set(goal?.interests ?? []);

  return (
    <form id="goal" action={action} className="card scroll-mt-24 space-y-4 p-5">
      <div>
        <h2 className="font-semibold">Your goal</h2>
        <p className="mt-0.5 text-xs text-muted">What you&apos;re preparing for. Every field is optional.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Label text="Target role">
          <input name="role" list="goal-roles" defaultValue={goal?.role ?? ""} maxLength={40} placeholder="e.g. SDE-2" className={input} />
          <datalist id="goal-roles">
            {ROLES.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </Label>
        <Label text="Target date">
          <input name="targetDate" type="date" defaultValue={goal?.targetDate ?? ""} className={input} />
        </Label>
        <Label text="Current level">
          <select name="level" defaultValue={goal?.level ?? ""} className={input}>
            <option value="">—</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </Label>
        <Label text="Hours per week">
          <input name="hoursPerWeek" type="number" min={1} max={100} defaultValue={goal?.hoursPerWeek ?? ""} className={input} />
        </Label>
      </div>
      <Label text="Target companies (comma separated)">
        <input name="companies" defaultValue={goal?.companies.join(", ") ?? ""} maxLength={300} placeholder="Google, Amazon, Atlassian" className={input} />
      </Label>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">Most interested in</legend>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <label
              key={a.key}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm has-[:checked]:border-pulse/60 has-[:checked]:bg-pulse/10 has-[:checked]:text-pulse"
            >
              <input type="checkbox" name="interests" value={a.key} defaultChecked={interests.has(a.key)} className="sr-only" />
              {a.name}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="rounded-lg bg-pulse px-4 py-2 text-sm font-semibold text-on-accent hover:brightness-110 disabled:opacity-60">
          {pending ? "Saving…" : "Save goal"}
        </button>
        {state?.ok && <span className="text-sm text-pulse">{state.ok} ✓</span>}
        {state?.error && (
          <span role="alert" className="text-sm text-hard">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
