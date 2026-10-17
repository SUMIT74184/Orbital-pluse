"use client";

import { useMemo, useState } from "react";
import { GROUPS, QUESTIONS, type Difficulty } from "@/data/catalog";
import { formatDate } from "@/lib/dates";
import { SolveToggle } from "./Toggles";
import { QuestionTitle } from "./QuestionBits";

type State = { solvedOn: string; nextDue: string | null; revDone: number; revTotal: number };

const STATUSES = [
  { v: "all", label: "All" },
  { v: "todo", label: "Unsolved" },
  { v: "solved", label: "Solved" },
  { v: "backlog", label: "Backlog" },
  { v: "due", label: "Revision due" },
];

export function QuestionsTable({
  today,
  states,
  backlog,
  initialStatus,
}: {
  today: string;
  states: Record<number, State>;
  backlog: number[];
  initialStatus: string;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [status, setStatus] = useState(STATUSES.some((s) => s.v === initialStatus) ? initialStatus : "all");
  const backlogSet = useMemo(() => new Set(backlog), [backlog]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return QUESTIONS.filter((x) => {
      const s = states[x.id];
      if (group !== "all" && x.group !== group) return false;
      if (diff !== "all" && x.difficulty !== diff) return false;
      if (status === "todo" && s) return false;
      if (status === "solved" && !s) return false;
      if (status === "backlog" && !backlogSet.has(x.id)) return false;
      if (status === "due" && !(s?.nextDue && s.nextDue <= today)) return false;
      if (q && !`${x.title} ${x.companies.join(" ")} ${x.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, group, diff, status, states, backlogSet, today]);

  const select = "rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-pulse";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, company or #"
          className={`${select} min-w-0 flex-1 basis-56`}
        />
        <select value={group} onChange={(e) => setGroup(e.target.value)} className={select} aria-label="Pattern">
          <option value="all">All patterns</option>
          {GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select value={diff} onChange={(e) => setDiff(e.target.value as typeof diff)} className={select} aria-label="Difficulty">
          <option value="all">All levels</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.v}
            onClick={() => setStatus(s.v)}
            className={`rounded-full px-3 py-1 text-xs transition ${
              status === s.v ? "bg-pulse font-semibold text-black" : "bg-panel-2 text-muted hover:text-ink"
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs text-muted">{rows.length} questions</span>
      </div>

      <div className="card divide-y divide-line overflow-hidden">
        {rows.map((q) => {
          const s = states[q.id];
          return (
            <div key={q.id} className="flex items-start gap-3 px-4 py-3">
              <SolveToggle qid={q.id} solved={!!s} />
              <div className="min-w-0 flex-1">
                <QuestionTitle q={q} />
              </div>
              <div className="shrink-0 text-right text-xs text-muted">
                {s ? (
                  <>
                    <div>Solved {formatDate(s.solvedOn)}</div>
                    <div className={s.nextDue && s.nextDue <= today ? "text-rev" : ""}>
                      {s.nextDue ? `Rev ${s.revDone + 1}/${s.revTotal} · ${formatDate(s.nextDue)}` : "All revisions done ✓"}
                    </div>
                  </>
                ) : backlogSet.has(q.id) ? (
                  <span className="text-hard">Backlog</span>
                ) : null}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No questions match these filters.</p>}
      </div>
    </div>
  );
}
