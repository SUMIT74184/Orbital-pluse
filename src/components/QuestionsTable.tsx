"use client";

import { useMemo, useState } from "react";
import type { Difficulty, Question } from "@/data/catalog";
import { formatDate } from "@/lib/dates";
import { OTHER_SECTOR, SECTORS, companyLogos, sectorOf } from "@/lib/companies";
import { SolveToggle } from "./Toggles";
import { QuestionTitle } from "./QuestionBits";
import { CompanyBreakdown, CompanyIcon, CompanyStack } from "./CompanyBadges";

type State = { solvedOn: string; nextDue: string | null; revDone: number; revTotal: number };

const STATUSES = [
  { v: "all", label: "All" },
  { v: "todo", label: "Unsolved" },
  { v: "solved", label: "Solved" },
  { v: "backlog", label: "Backlog" },
  { v: "due", label: "Revision due" },
];

const ALL_SECTORS = [...SECTORS, OTHER_SECTOR];
const GRID_PREVIEW = 12;

export function QuestionsTable({
  questions,
  groups,
  today,
  states,
  backlog,
  initialStatus,
}: {
  questions: Question[];
  groups: string[];
  today: string;
  states: Record<number, State>;
  backlog: number[];
  initialStatus: string;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [sector, setSector] = useState("all");
  const [company, setCompany] = useState("all");
  const [diff, setDiff] = useState<"all" | Difficulty>("all");
  const [status, setStatus] = useState(STATUSES.some((s) => s.v === initialStatus) ? initialStatus : "all");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [gridOpen, setGridOpen] = useState(false);
  const backlogSet = useMemo(() => new Set(backlog), [backlog]);

  // Per company: how many questions it asks and how many of those this user has solved.
  const companyStats = useMemo(() => {
    const stats = new Map<string, { total: number; solved: number }>();
    for (const q of questions)
      for (const c of q.companies) {
        const s = stats.get(c) ?? { total: 0, solved: 0 };
        s.total++;
        if (states[q.id]) s.solved++;
        stats.set(c, s);
      }
    return [...stats].sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0]));
  }, [questions, states]);

  const sectorCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const q of questions) for (const key of new Set(q.companies.map((c) => sectorOf(c).key))) counts.set(key, (counts.get(key) ?? 0) + 1);
    return counts;
  }, [questions]);

  const sectorCompanies = sector === "all" ? companyStats : companyStats.filter(([c]) => sectorOf(c).key === sector);
  const inSector = (c: string) => sector === "all" || sectorOf(c).key === sector;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((x) => {
      const s = states[x.id];
      if (company !== "all" && !x.companies.includes(company)) return false;
      if (sector !== "all" && !x.companies.some((c) => sectorOf(c).key === sector)) return false;
      if (diff !== "all" && x.difficulty !== diff) return false;
      if (status === "todo" && s) return false;
      if (status === "solved" && !s) return false;
      if (status === "backlog" && !backlogSet.has(x.id)) return false;
      if (status === "due" && !(s?.nextDue && s.nextDue <= today)) return false;
      if (q && !`${x.title} ${x.companies.join(" ")} ${x.id}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [questions, query, company, sector, diff, status, states, backlogSet, today]);

  // Group in sheet order; patterns only on archived questions go last.
  const sections = useMemo(() => {
    const byGroup = new Map<string, Question[]>();
    for (const g of groups) byGroup.set(g, []);
    for (const q of rows) {
      if (!byGroup.has(q.group)) byGroup.set(q.group, []);
      byGroup.get(q.group)!.push(q);
    }
    return [...byGroup].filter(([, qs]) => qs.length > 0);
  }, [rows, groups]);

  const visible = group === "all" ? sections : sections.filter(([g]) => g === group);
  const shownCount = visible.reduce((n, [, qs]) => n + qs.length, 0);
  const allCollapsed = visible.length > 0 && visible.every(([g]) => collapsed.has(g));
  const sectorLabel = ALL_SECTORS.find((s) => s.key === sector)?.label;

  // The picked company first, then the picked sector's companies, then Big Tech, then names with a logo
  // (the recognisable ones), then the rest. Ties keep the frequency order from the data.
  const rank = (c: string) =>
    c === company ? 0 : sector !== "all" && inSector(c) ? 1 : sectorOf(c).key === "big-tech" ? 2 : companyLogos(c).length ? 3 : 4;
  const ordered = (cs: string[]) => [...cs].sort((a, b) => rank(a) - rank(b));

  const pickSector = (key: string) => {
    setSector(key);
    setGridOpen(false);
    if (company !== "all" && key !== "all" && sectorOf(company).key !== key) setCompany("all");
  };

  const toggle = (g: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  const select = "rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-pulse";
  const chip = (on: boolean) =>
    `shrink-0 rounded-full px-3 py-1 text-xs transition ${on ? "bg-pulse font-semibold text-black" : "bg-panel-2 text-muted hover:text-ink"}`;
  const grid = gridOpen ? sectorCompanies : sectorCompanies.slice(0, GRID_PREVIEW);

  return (
    <div className="space-y-4">
      <section className="card space-y-4 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-semibold">Companies by sector</h2>
          {(sector !== "all" || company !== "all") && (
            <button
              onClick={() => {
                setSector("all");
                setCompany("all");
              }}
              className="text-xs text-muted hover:text-ink"
            >
              Clear
            </button>
          )}
        </div>

        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible">
          <button onClick={() => pickSector("all")} className={chip(sector === "all")}>
            All sectors
          </button>
          {ALL_SECTORS.filter((s) => sectorCounts.get(s.key)).map((s) => (
            <button key={s.key} onClick={() => pickSector(s.key)} className={chip(sector === s.key)}>
              {s.label} <span className="opacity-60">{sectorCounts.get(s.key)}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {grid.map(([c, s]) => {
            const on = company === c;
            return (
              <button
                key={c}
                onClick={() => setCompany(on ? "all" : c)}
                aria-pressed={on}
                className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                  on ? "border-pulse bg-pulse/10" : "border-line bg-panel-2 hover:border-muted/50"
                }`}
              >
                <CompanyIcon name={c} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c}</span>
                  <span className="block text-[11px] text-muted">
                    {s.solved}/{s.total} solved
                  </span>
                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full bg-pulse" style={{ width: `${(s.solved / s.total) * 100}%` }} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {sectorCompanies.length > GRID_PREVIEW && (
          <button onClick={() => setGridOpen(!gridOpen)} className="text-xs text-muted hover:text-ink">
            {gridOpen ? "Show fewer" : `Show all ${sectorCompanies.length} companies`}
          </button>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, company or #"
          className={`${select} min-w-0 flex-1 basis-56`}
        />
        <select value={company} onChange={(e) => setCompany(e.target.value)} className={`${select} max-w-56`} aria-label="Company">
          <option value="all">{sector === "all" ? "All companies" : `All in ${sectorLabel}`}</option>
          {sectorCompanies.map(([c, s]) => (
            <option key={c} value={c}>
              {c} ({s.total})
            </option>
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
          <button key={s.v} onClick={() => setStatus(s.v)} className={chip(status === s.v)}>
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-line pt-3">
        <button onClick={() => setGroup("all")} className={chip(group === "all")}>
          All patterns
        </button>
        {sections.map(([g, qs]) => (
          <button key={g} onClick={() => setGroup(group === g ? "all" : g)} className={chip(group === g)}>
            {g} <span className="opacity-60">{qs.length}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-muted">
        <span className="flex flex-wrap items-center gap-1.5">
          {shownCount} questions in {visible.length} {visible.length === 1 ? "pattern" : "patterns"}
          {company !== "all" ? (
            <span className="flex items-center gap-1.5">
              · asked at <CompanyIcon name={company} size={16} /> <span className="text-ink">{company}</span>
            </span>
          ) : (
            sector !== "all" && (
              <span>
                · asked in <span className="text-ink">{sectorLabel}</span>
              </span>
            )
          )}
        </span>
        {visible.length > 1 && (
          <button
            onClick={() => setCollapsed(allCollapsed ? new Set() : new Set(visible.map(([g]) => g)))}
            className="shrink-0 hover:text-ink"
          >
            {allCollapsed ? "Expand all" : "Collapse all"}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {visible.map(([g, qs]) => {
          const solved = qs.filter((q) => states[q.id]).length;
          const open = !collapsed.has(g);
          return (
            <section key={g} className="card overflow-hidden">
              <button
                onClick={() => toggle(g)}
                aria-expanded={open}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-panel-2"
              >
                <svg
                  viewBox="0 0 16 16"
                  className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`}
                  aria-hidden
                >
                  <path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2 className="font-semibold">{g}</h2>
                <span className="ml-auto text-xs text-muted">
                  {solved}/{qs.length} solved
                </span>
                <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-panel-2 sm:block">
                  <span className="block h-full bg-pulse" style={{ width: `${(solved / qs.length) * 100}%` }} />
                </span>
              </button>
              {open && (
                <div className="divide-y divide-line border-t border-line">
                  {qs.map((q) => (
                    <QuestionRow
                      key={q.id}
                      q={q}
                      companies={ordered(q.companies)}
                      highlight={(c) => c === company || (sector !== "all" && inSector(c))}
                      state={states[q.id]}
                      inBacklog={backlogSet.has(q.id)}
                      today={today}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {visible.length === 0 && <p className="card px-4 py-10 text-center text-sm text-muted">No questions match these filters.</p>}
      </div>
    </div>
  );
}

function QuestionRow({
  q,
  companies,
  highlight,
  state: s,
  inBacklog,
  today,
}: {
  q: Question;
  companies: string[];
  highlight: (c: string) => boolean;
  state: State | undefined;
  inBacklog: boolean;
  today: string;
}) {
  const [open, setOpen] = useState(false);
  const logos =
    companies.length > 0 ? (
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={`Asked at ${companies.length} companies`}
        title={open ? "Hide companies" : `${companies.slice(0, 8).join(", ")}${companies.length > 8 ? "…" : ""}`}
        className={`rounded-full p-1 pr-2 transition ${open ? "bg-panel-2" : "hover:bg-panel-2"}`}
      >
        <CompanyStack companies={companies} />
      </button>
    ) : null;

  return (
    <div className="px-4 py-3">
      <div className="flex items-start gap-3">
        <SolveToggle qid={q.id} solved={!!s} />
        <div className="min-w-0 flex-1">
          <QuestionTitle q={q} hideGroup hideCompanies />
          <div className="mt-1.5 sm:hidden">{logos}</div>
        </div>
        <div className="hidden shrink-0 sm:block">{logos}</div>
        <div className="w-32 shrink-0 text-right text-xs text-muted max-sm:w-auto">
          {s ? (
            <>
              <div>Solved {formatDate(s.solvedOn)}</div>
              <div className={s.nextDue && s.nextDue <= today ? "text-rev" : ""}>
                {s.nextDue ? `Rev ${s.revDone + 1}/${s.revTotal} · ${formatDate(s.nextDue)}` : "All revisions done ✓"}
              </div>
            </>
          ) : inBacklog ? (
            <span className="text-hard">Backlog</span>
          ) : null}
        </div>
      </div>
      {open && (
        <div className="mt-3 rounded-xl border border-line bg-bg/40 p-3 sm:ml-9">
          <p className="mb-2 text-xs text-muted">
            Asked at <span className="text-ink">{companies.length}</span> companies, grouped by sector
          </p>
          <CompanyBreakdown companies={companies} highlight={highlight} />
        </div>
      )}
    </div>
  );
}
