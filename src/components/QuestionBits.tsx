import type { Difficulty, Question } from "@/data/catalog";
import { CompanyBadges } from "./CompanyBadges";

const DIFF: Record<Difficulty, string> = {
  Easy: "text-easy bg-easy/10",
  Medium: "text-medium bg-medium/10",
  Hard: "text-hard bg-hard/10",
};

export function DifficultyBadge({ d }: { d: Difficulty }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${DIFF[d]}`}>{d}</span>;
}

export function QuestionTitle({
  q,
  muted,
  hideGroup,
  hideCompanies,
}: {
  q: Question;
  muted?: boolean;
  hideGroup?: boolean;
  hideCompanies?: boolean;
}) {
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
        {!hideGroup && (
          <>
            <span>·</span>
            <span>{q.group}</span>
          </>
        )}
        <DifficultyBadge d={q.difficulty} />
      </div>
      {!hideCompanies && <CompanyBadges companies={q.companies} />}
    </div>
  );
}
