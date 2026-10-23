"use client";

import { useTransition } from "react";
import { reviseQuestion, setTopicDone, solveQuestion, undoRevision, unsolveQuestion } from "@/app/actions/progress";
import type { TrackKind } from "@/data/topics";

function Check({
  checked,
  pending,
  onClick,
  label,
  color,
}: {
  checked: boolean;
  pending: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={checked}
      aria-label={label}
      title={label}
      className="grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition disabled:opacity-50"
      style={{ borderColor: color, background: checked ? color : "transparent" }}
    >
      {pending ? (
        <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : checked ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
          <path d="M3 8.5l3 3 7-7" fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

export function SolveToggle({ qid, solved }: { qid: number; solved: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Check
      checked={solved}
      pending={pending}
      color="var(--color-new)"
      label={solved ? "Mark as not solved" : "Mark as solved"}
      onClick={() => start(() => (solved ? unsolveQuestion(qid) : solveQuestion(qid)))}
    />
  );
}

export function ReviseToggle({ qid, done }: { qid: number; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Check
      checked={done}
      pending={pending}
      color="var(--color-rev)"
      label={done ? "Undo revision" : "Mark as revised"}
      onClick={() => start(() => (done ? undoRevision(qid) : reviseQuestion(qid)))}
    />
  );
}

/** Rates a due revision instead of plain "revised": Forgot restarts its schedule, Easy skips the next round. */
export function ReviseRating({ qid }: { qid: number }) {
  const [pending, start] = useTransition();
  const rate = (rating: "forgot" | "easy") => () => start(() => reviseQuestion(qid, rating));
  const pill = "rounded-md border px-2 py-0.5 text-[11px] font-medium transition hover:bg-panel-2 disabled:opacity-50";
  return (
    <div className="mt-1.5 flex gap-1.5">
      <button type="button" disabled={pending} onClick={rate("forgot")} title="Forgot it: restart this question's schedule from today" className={`${pill} border-hard/40 text-hard`}>
        Forgot
      </button>
      <button type="button" disabled={pending} onClick={rate("easy")} title="Easy: skip the next revision round" className={`${pill} border-easy/40 text-easy`}>
        Easy
      </button>
    </div>
  );
}

export function TopicToggle({ kind, id, done }: { kind: TrackKind; id: number; done: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Check
      checked={done}
      pending={pending}
      color="var(--color-topic)"
      label={done ? "Mark as not done" : "Mark as done"}
      onClick={() => start(() => setTopicDone(kind, id, !done))}
    />
  );
}
