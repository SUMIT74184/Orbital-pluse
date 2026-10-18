"use client";

import { useMemo, useState } from "react";
import { DifficultyBadge } from "@/components/QuestionBits";
import { EditableRow, QuestionArchive, QuestionForm, type QuestionValues } from "./ContentForms";

type Row = QuestionValues & { id: number; archived: boolean; users: number };

export function QuestionManager({ questions, groups }: { questions: Row[]; groups: string[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [show, setShow] = useState<"live" | "archived">("live");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions
      .filter((x) => (show === "archived") === x.archived)
      .filter((x) => group === "all" || x.group === group)
      .filter((x) => !q || `${x.id} ${x.title} ${x.companies.join(" ")}`.toLowerCase().includes(q))
      .sort((a, b) => b.id - a.id);
  }, [questions, query, group, show]);

  const control = "rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-pulse";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, company or #" className={`${control} min-w-0 flex-1 basis-56`} />
        <select value={group} onChange={(e) => setGroup(e.target.value)} className={control} aria-label="Pattern">
          <option value="all">All patterns</option>
          {groups.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select value={show} onChange={(e) => setShow(e.target.value as typeof show)} className={control} aria-label="Status">
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
        <span className="self-center text-xs text-muted">{rows.length} questions · newest first</span>
      </div>
      <div className="card divide-y divide-line overflow-hidden">
        {rows.map((q) => (
          <EditableRow
            key={q.id}
            summary={
              <>
                <a href={q.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-pulse">
                  {q.title}
                </a>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <span className="font-mono">#{q.id}</span>·<span>{q.group}</span>
                  <DifficultyBadge d={q.difficulty} />
                  <span>· solved by {q.users}</span>
                  {q.companies.length > 0 && <span className="hidden truncate sm:inline">· {q.companies.join(", ")}</span>}
                </div>
              </>
            }
            actions={<QuestionArchive id={q.id} archived={q.archived} />}
            form={(close) => <QuestionForm initial={q} groups={groups} onDone={close} />}
          />
        ))}
        {!rows.length && <p className="px-4 py-10 text-center text-sm text-muted">No questions match.</p>}
      </div>
    </div>
  );
}
