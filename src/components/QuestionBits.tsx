import type { Difficulty, Question } from "@/data/catalog";

const DIFF: Record<Difficulty, string> = {
  Easy: "text-easy bg-easy/10",
  Medium: "text-medium bg-medium/10",
  Hard: "text-hard bg-hard/10",
};

export function DifficultyBadge({ d }: { d: Difficulty }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${DIFF[d]}`}>{d}</span>;
}

export function QuestionTitle({ q, muted }: { q: Question; muted?: boolean }) {
  return (
    <div className="min-w-0">
      <a
        href={q.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-medium hover:text-pulse hover:underline ${muted ? "text-muted line-through decoration-muted/50" : ""}`}
      >
        {q.title}
      </a>
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <span className="font-mono">#{q.id}</span>
        <span>·</span>
        <span>{q.group}</span>
        <DifficultyBadge d={q.difficulty} />
        <span className="hidden truncate sm:inline">{q.companies.join(", ")}</span>
      </div>
    </div>
  );
}
