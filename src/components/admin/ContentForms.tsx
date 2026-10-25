"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import {
  moveTopic,
  saveQuestion,
  saveTopic,
  saveTrack,
  setQuestionArchived,
  setTopicArchived,
  setTrackArchived,
  type AdminState,
} from "@/app/actions/admin";
import { LEVELS, LEVEL_LABEL, type Level } from "@/data/topics";

export const input =
  "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/20";

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">
        {label}
        {hint && <span className="ml-1 font-normal text-muted/70">· {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Submit({ pending, label, state }: { pending: boolean; label: string; state: AdminState }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button disabled={pending} className="rounded-lg bg-pulse px-4 py-2 text-sm font-semibold text-black hover:brightness-110 disabled:opacity-60">
        {pending ? "Saving…" : label}
      </button>
      {state?.ok && <span className="text-sm text-pulse">{state.ok} ✓</span>}
      {state?.error && (
        <span role="alert" className="text-sm text-hard">
          {state.error}
        </span>
      )}
    </div>
  );
}

/** Clears a "create" form after a successful save so the next item can be typed straight away. */
function useResetOnOk(state: AdminState, reset: boolean) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (reset && state?.ok) ref.current?.reset();
  }, [state, reset]);
  return ref;
}

export function ArchiveButton({ archived, onToggle }: { archived: boolean; onToggle: (archived: boolean) => Promise<void> }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => onToggle(!archived))}
      className={`rounded-md border px-2 py-1 text-xs disabled:opacity-50 ${
        archived ? "border-pulse/40 text-pulse hover:bg-pulse/10" : "border-line text-muted hover:border-hard/50 hover:text-hard"
      }`}
    >
      {pending ? "…" : archived ? "Restore" : "Archive"}
    </button>
  );
}

// ---------- Questions ----------

export type QuestionValues = {
  id?: number;
  title: string;
  url: string;
  group: string;
  pattern: string;
  difficulty: "Easy" | "Medium" | "Hard";
  companies: string[];
};

export function QuestionForm({ initial, groups, onDone }: { initial?: QuestionValues; groups: string[]; onDone?: () => void }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveQuestion, undefined);
  const ref = useResetOnOk(state, !initial);
  useEffect(() => {
    if (initial && state?.ok) onDone?.();
  }, [state, initial, onDone]);
  const listId = `groups-${initial?.id ?? "new"}`;
  return (
    <form ref={ref} action={action} className="space-y-3">
      {initial?.id && <input type="hidden" name="qid" value={initial.id} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input name="title" required defaultValue={initial?.title} className={input} placeholder="Two Sum" />
        </Field>
        <Field label="Problem URL">
          <input name="url" type="url" required defaultValue={initial?.url} className={input} placeholder="https://leetcode.com/problems/two-sum/" />
        </Field>
        <Field label="Pattern" hint="pick one, or type a new one">
          <input name="group" list={listId} required defaultValue={initial?.group} className={input} />
          <datalist id={listId}>
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </Field>
        <Field label="Display name" hint="optional, defaults to the pattern">
          <input name="pattern" defaultValue={initial && initial.pattern !== initial.group ? initial.pattern : ""} className={input} />
        </Field>
        <Field label="Difficulty">
          <select name="difficulty" defaultValue={initial?.difficulty ?? "Medium"} className={input}>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </Field>
        <Field label="Companies" hint="comma separated">
          <input name="companies" defaultValue={initial?.companies.join(", ")} className={input} placeholder="Amazon, Google" />
        </Field>
      </div>
      <Submit pending={pending} label={initial ? "Save question" : "Add question"} state={state} />
    </form>
  );
}

export function QuestionArchive({ id, archived }: { id: number; archived: boolean }) {
  return <ArchiveButton archived={archived} onToggle={(a) => setQuestionArchived(id, a)} />;
}

// ---------- Tracks ----------

export function TrackForm({ initial }: { initial?: { key: string; name: string; description: string; defaultOn: boolean } }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveTrack, undefined);
  return (
    <form action={action} className="space-y-3">
      {initial && <input type="hidden" name="key" value={initial.key} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <Field label="Name">
          <input name="name" required defaultValue={initial?.name} className={input} placeholder="Operating Systems" />
        </Field>
        <Field label="Description">
          <input name="description" defaultValue={initial?.description} className={input} placeholder="Processes, memory, scheduling, concurrency" />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="defaultOn" defaultChecked={initial?.defaultOn ?? false} className="h-4 w-4 accent-[var(--color-topic)]" />
        On by default <span className="text-xs text-muted">(users who haven&apos;t chosen get a daily topic from it; they can switch it off in Settings)</span>
      </label>
      <Submit pending={pending} label={initial ? "Save track" : "Create track"} state={state} />
    </form>
  );
}

export function TrackArchive({ trackKey, archived }: { trackKey: string; archived: boolean }) {
  return <ArchiveButton archived={archived} onToggle={(a) => setTrackArchived(trackKey, a)} />;
}

// ---------- Topics ----------

export type TopicValues = {
  id?: number;
  section: string;
  title: string;
  points: string[];
  practice?: { title: string; url: string }[];
  levels?: Level[];
};

export function TopicForm({ track, sections, initial, onDone }: { track: string; sections: string[]; initial?: TopicValues; onDone?: () => void }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveTopic, undefined);
  const ref = useResetOnOk(state, !initial);
  useEffect(() => {
    if (initial && state?.ok) onDone?.();
  }, [state, initial, onDone]);
  const listId = `sections-${track}-${initial?.id ?? "new"}`;
  return (
    <form ref={ref} action={action} className="space-y-3">
      <input type="hidden" name="track" value={track} />
      {initial?.id && <input type="hidden" name="topicId" value={initial.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <Field label="Section" hint="pick one, or type a new one">
          <input name="section" list={listId} required defaultValue={initial?.section} className={input} />
          <datalist id={listId}>
            {sections.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Title">
          <input name="title" required defaultValue={initial?.title} className={input} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Key points" hint="one per line">
          <textarea name="points" rows={4} defaultValue={initial?.points.join("\n")} className={`${input} font-mono text-xs`} />
        </Field>
        <Field label="Practice links" hint="one per line: Title | https://…">
          <textarea
            name="practice"
            rows={4}
            defaultValue={initial?.practice?.map((p) => `${p.title} | ${p.url}`).join("\n")}
            className={`${input} font-mono text-xs`}
          />
        </Field>
      </div>
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <legend className="mb-1.5 text-xs font-medium text-muted">
          Asked at <span className="font-normal text-muted/70">· none ticked = every level</span>
        </legend>
        {LEVELS.map((l) => (
          <label key={l} className="flex items-center gap-2">
            <input type="checkbox" name="levels" value={l} defaultChecked={initial?.levels?.includes(l)} className="accent-pulse" />
            {LEVEL_LABEL[l]}
          </label>
        ))}
      </fieldset>
      <Submit pending={pending} label={initial ? "Save topic" : "Add topic"} state={state} />
    </form>
  );
}

export function TopicControls({ track, id, archived, first, last }: { track: string; id: number; archived: boolean; first: boolean; last: boolean }) {
  const [pending, start] = useTransition();
  const btn = "grid h-7 w-7 place-items-center rounded-md border border-line text-xs text-muted hover:border-muted hover:text-ink disabled:opacity-30";
  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={pending || first} onClick={() => start(() => moveTopic(track, id, -1))} className={btn} aria-label="Move up">
        ↑
      </button>
      <button type="button" disabled={pending || last} onClick={() => start(() => moveTopic(track, id, 1))} className={btn} aria-label="Move down">
        ↓
      </button>
      <ArchiveButton archived={archived} onToggle={(a) => setTopicArchived(track, id, a)} />
    </div>
  );
}

/** A row that swaps between its summary and an edit form. */
export function EditableRow({ summary, actions, form }: { summary: React.ReactNode; actions?: React.ReactNode; form: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">{summary}</div>
        <div className="flex shrink-0 items-center gap-1">
          {actions}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-md border border-line px-2 py-1 text-xs text-muted hover:border-muted hover:text-ink"
          >
            {open ? "Close" : "Edit"}
          </button>
        </div>
      </div>
      {open && <div className="mt-3 rounded-lg border border-line bg-panel-2/50 p-4">{form(() => setOpen(false))}</div>}
    </div>
  );
}
