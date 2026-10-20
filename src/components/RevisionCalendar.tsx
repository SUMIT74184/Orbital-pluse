"use client";

import { useMemo, useState } from "react";
import type { CalendarItem } from "@/lib/plan";
import type { Difficulty } from "@/data/catalog";
import { addDays, diffDays, formatDate, weekdayOf } from "@/lib/dates";
import { DifficultyBadge } from "@/components/QuestionBits";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];
const DIFF_COLOR: Record<Difficulty, string> = { Easy: "var(--color-easy)", Medium: "var(--color-medium)", Hard: "var(--color-hard)" };
// Rough minutes per revision, only used for the "est." time hints.
const MINUTES: Record<Difficulty, number> = { Easy: 10, Medium: 20, Hard: 30 };
const FORECAST_DAYS = 30;

type Status = "done" | "late" | "missed" | "due" | "upcoming";
const statusOf = (i: CalendarItem, today: string): Status =>
  i.doneOn ? (i.doneOn > i.due ? "late" : "done") : i.due < today ? "missed" : i.due === today ? "due" : "upcoming";

const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  done: { label: "Done", cls: "bg-pulse/15 text-pulse" },
  late: { label: "Done late", cls: "bg-medium/15 text-medium" },
  missed: { label: "Missed", cls: "bg-hard/15 text-hard" },
  due: { label: "Due today", cls: "bg-rev/20 text-rev" },
  upcoming: { label: "Upcoming", cls: "bg-panel-2 text-muted" },
};

const mondayIndex = (date: string) => (weekdayOf(date) + 6) % 7;
const shiftMonth = (key: string, n: number) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7);
};
const minutes = (items: CalendarItem[]) => items.reduce((n, i) => n + MINUTES[i.difficulty], 0);
const fmtMinutes = (m: number) => (m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}`);

function relative(date: string, today: string) {
  const d = diffDays(date, today);
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  if (d === -1) return "Yesterday";
  return d > 0 ? `In ${d} days` : `${-d} days ago`;
}

export function RevisionCalendar({
  today,
  from,
  to,
  items,
  overdue,
  stages,
  mastered,
  revisionDays,
  schedule,
  groupColors,
}: {
  today: string;
  from: string;
  to: string;
  items: CalendarItem[];
  overdue: CalendarItem[];
  stages: number[];
  mastered: number;
  revisionDays: number[];
  schedule: string[][];
  groupColors: Record<string, string>;
}) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [diff, setDiff] = useState<Difficulty | "All">("All");
  const [view, setView] = useState<"month" | "agenda">("month");

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const i of items) {
      if (diff !== "All" && i.difficulty !== diff) continue;
      const list = map.get(i.due) ?? [];
      list.push(i);
      map.set(i.due, list);
    }
    return map;
  }, [items, diff]);
  const on = (date: string) => byDate.get(date) ?? [];

  const stats = useMemo(() => {
    const pending = items.filter((i) => !i.doneOn);
    const inNext = (n: number) => pending.filter((i) => i.due > today && i.due <= addDays(today, n)).length;
    const past = items.filter((i) => i.due < today && i.due >= addDays(today, -28));
    const onTime = past.filter((i) => i.doneOn && i.doneOn <= i.due).length;
    let busiest = { date: today, n: 0 };
    for (let d = today; d <= addDays(today, FORECAST_DAYS - 1); d = addDays(d, 1)) {
      const n = pending.filter((i) => i.due === d).length;
      if (n > busiest.n) busiest = { date: d, n };
    }
    return {
      dueToday: pending.filter((i) => i.due === today).length,
      overdue: new Set(overdue.map((o) => o.qid)).size,
      next7: inNext(7),
      next30: inNext(30),
      onTime: past.length ? Math.round((onTime / past.length) * 100) : null,
      busiest,
    };
  }, [items, overdue, today]);

  const select = (date: string) => {
    setSelected(date);
    setMonth(date.slice(0, 7));
  };

  // One overdue entry per question: a single review clears every round that piled up.
  const overdueList = useMemo(() => {
    const map = new Map<number, CalendarItem>();
    for (const o of overdue) {
      const prev = map.get(o.qid);
      map.set(o.qid, prev ? { ...prev, revNo: Math.max(prev.revNo, o.revNo) } : o);
    }
    return [...map.values()].sort((a, b) => a.due.localeCompare(b.due));
  }, [overdue]);

  return (
    <div className="space-y-6">
      <StatTiles stats={stats} mastered={mastered} today={today} onPick={select} />

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMonth(shiftMonth(month, -1))}
              disabled={month <= from.slice(0, 7)}
              className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:border-muted hover:text-ink disabled:opacity-30"
              aria-label="Previous month"
            >
              ‹
            </button>
            <h2 className="min-w-36 text-center text-lg font-semibold">
              {formatDate(`${month}-01`, { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => setMonth(shiftMonth(month, 1))}
              disabled={month >= to.slice(0, 7)}
              className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:border-muted hover:text-ink disabled:opacity-30"
              aria-label="Next month"
            >
              ›
            </button>
            <button
              onClick={() => select(today)}
              className="ml-1 rounded-lg border border-pulse/40 px-2.5 py-1 text-xs font-medium text-pulse hover:bg-pulse/10"
            >
              Today
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              value={diff}
              options={["All", ...DIFFS] as const}
              onChange={setDiff}
              color={(o) => (o === "All" ? undefined : DIFF_COLOR[o])}
            />
            <Segmented value={view} options={["month", "agenda"] as const} onChange={setView} label={(o) => (o === "month" ? "Month" : "Agenda")} />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px]">
          <div className="p-3 sm:p-5">
            {view === "month" ? (
              <MonthGrid
                month={month}
                today={today}
                from={from}
                to={to}
                selected={selected}
                on={on}
                schedule={schedule}
                groupColors={groupColors}
                onSelect={setSelected}
              />
            ) : (
              <Agenda today={today} on={on} onSelect={setSelected} selected={selected} groupColors={groupColors} />
            )}
            <Legend />
          </div>
          <DayPanel
            date={selected}
            today={today}
            items={on(selected)}
            groups={schedule[weekdayOf(selected)] ?? []}
            groupColors={groupColors}
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Forecast today={today} on={on} selected={selected} onSelect={select} busiest={stats.busiest} />
        <StageLadder stages={stages} mastered={mastered} revisionDays={revisionDays} />
      </div>

      {overdueList.length > 0 && <OverdueList list={overdueList} today={today} groupColors={groupColors} />}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label = (o) => o,
  color,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  label?: (o: T) => string;
  color?: (o: T) => string | undefined;
}) {
  return (
    <div className="flex rounded-lg border border-line bg-panel-2/60 p-0.5 text-xs">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition ${o === value ? "bg-line text-ink" : "text-muted hover:text-ink"}`}
        >
          {color?.(o) && <span className="size-1.5 rounded-full" style={{ background: color(o) }} />}
          {label(o)}
        </button>
      ))}
    </div>
  );
}

function StatTiles({
  stats,
  mastered,
  today,
  onPick,
}: {
  stats: {
    dueToday: number;
    overdue: number;
    next7: number;
    next30: number;
    onTime: number | null;
    busiest: { date: string; n: number };
  };
  mastered: number;
  today: string;
  onPick: (date: string) => void;
}) {
  const tiles = [
    { label: "Due today", value: stats.dueToday, sub: stats.dueToday ? "clear them on the dashboard" : "nothing left today", color: "var(--color-rev)", date: today },
    { label: "Overdue", value: stats.overdue, sub: stats.overdue ? "questions waiting" : "all caught up", color: stats.overdue ? "var(--color-hard)" : "var(--color-pulse)" },
    { label: "Next 7 days", value: stats.next7, sub: `${(stats.next7 / 7).toFixed(1)} per day`, color: "var(--color-new)" },
    { label: "Next 30 days", value: stats.next30, sub: `${(stats.next30 / 30).toFixed(1)} per day`, color: "var(--color-new)" },
    {
      label: "Busiest day",
      value: stats.busiest.n,
      sub: stats.busiest.n ? formatDate(stats.busiest.date, { weekday: "short", day: "numeric", month: "short" }) : "no load ahead",
      color: "var(--color-topic)",
      date: stats.busiest.n ? stats.busiest.date : undefined,
    },
    {
      label: "On time · 28d",
      value: stats.onTime == null ? "—" : `${stats.onTime}%`,
      sub: `${mastered} mastered`,
      color: stats.onTime == null || stats.onTime >= 80 ? "var(--color-pulse)" : stats.onTime >= 50 ? "var(--color-medium)" : "var(--color-hard)",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => {
        const body = (
          <>
            <span className="absolute inset-x-0 top-0 h-0.5" style={{ background: t.color }} />
            <p className="text-[11px] uppercase tracking-wider text-muted">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: t.color }}>
              {t.value}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted">{t.sub}</p>
          </>
        );
        return t.date ? (
          <button key={t.label} onClick={() => onPick(t.date!)} className="card lift relative overflow-hidden p-3.5 text-left">
            {body}
          </button>
        ) : (
          <div key={t.label} className="card relative overflow-hidden p-3.5">
            {body}
          </div>
        );
      })}
    </div>
  );
}

function MonthGrid({
  month,
  today,
  from,
  to,
  selected,
  on,
  schedule,
  groupColors,
  onSelect,
}: {
  month: string;
  today: string;
  from: string;
  to: string;
  selected: string;
  on: (date: string) => CalendarItem[];
  schedule: string[][];
  groupColors: Record<string, string>;
  onSelect: (date: string) => void;
}) {
  const first = `${month}-01`;
  const start = addDays(first, -mondayIndex(first));
  const cells: string[] = [];
  for (let d = start; d.slice(0, 7) <= month || mondayIndex(d) !== 0; d = addDays(d, 1)) cells.push(d);
  const peak = Math.max(1, ...cells.map((d) => on(d).length));

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted sm:gap-1.5">
        {DAY_LABELS.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((d) => {
          const list = on(d);
          const inMonth = d.slice(0, 7) === month;
          const inRange = d >= from && d <= to;
          const isToday = d === today;
          const isSel = d === selected;
          const past = d < today;
          const done = list.filter((i) => i.doneOn).length;
          const missed = list.filter((i) => statusOf(i, today) === "missed").length;
          const counts = DIFFS.map((k) => list.filter((i) => i.difficulty === k).length);
          const groups = schedule[weekdayOf(d)] ?? [];
          const heat = list.length ? 0.06 + 0.3 * (list.length / peak) : 0;
          return (
            <button
              key={d}
              onClick={() => onSelect(d)}
              aria-label={`${formatDate(d, { weekday: "long", day: "numeric", month: "long" })}: ${list.length} revisions`}
              aria-pressed={isSel}
              className={`group relative flex aspect-square min-h-14 flex-col rounded-lg border p-1 text-left transition sm:aspect-auto sm:min-h-24 sm:p-2 ${
                isSel
                  ? "border-pulse shadow-[0_0_0_1px_var(--color-pulse),0_0_24px_-8px_rgb(34_229_132/0.7)]"
                  : isToday
                    ? "border-pulse/50"
                    : "border-line/70 hover:border-muted/60"
              } ${inMonth ? "" : "opacity-35"} ${inRange ? "" : "bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(255_255_255/0.025)_6px_12px)]"}`}
              style={{ backgroundColor: heat ? `rgb(177 140 255 / ${heat})` : undefined }}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={`grid size-5 place-items-center rounded-full text-[11px] font-semibold tabular-nums sm:size-6 sm:text-xs ${
                    isToday ? "bg-pulse text-black" : past ? "text-muted" : ""
                  }`}
                >
                  {Number(d.slice(8))}
                </span>
                <span className="hidden gap-0.5 pt-1 sm:flex" title={groups.join(", ") || "Rest day"}>
                  {groups.slice(0, 4).map((g) => (
                    <span key={g} className="size-1.5 rounded-full" style={{ background: groupColors[g] }} />
                  ))}
                </span>
              </div>

              {list.length > 0 && (
                <div className="mt-auto">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-mono text-sm font-semibold leading-none text-ink sm:text-lg">
                      {past ? (
                        <>
                          {done}
                          <span className="text-[10px] text-muted sm:text-xs">/{list.length}</span>
                        </>
                      ) : (
                        list.length
                      )}
                    </span>
                    {missed > 0 && (
                      <span className="hidden items-center gap-0.5 font-mono text-[10px] text-hard sm:flex" title={`${missed} missed`}>
                        <span className="size-1.5 rounded-full bg-hard" />
                        {missed}
                      </span>
                    )}
                    {past && missed === 0 && done === list.length && <span className="hidden text-xs text-pulse sm:inline">✓</span>}
                  </div>
                  <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-black/30">
                    {counts.map((n, k) =>
                      n ? <span key={k} style={{ width: `${(n / list.length) * 100}%`, background: DIFF_COLOR[DIFFS[k]] }} /> : null,
                    )}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Agenda({
  today,
  on,
  selected,
  onSelect,
  groupColors,
}: {
  today: string;
  on: (date: string) => CalendarItem[];
  selected: string;
  onSelect: (date: string) => void;
  groupColors: Record<string, string>;
}) {
  const days = Array.from({ length: 21 }, (_, i) => addDays(today, i));
  return (
    <ol className="relative space-y-1 border-l border-line pl-4">
      {days.map((d) => {
        const list = on(d);
        return (
          <li key={d} className="relative">
            <span
              className={`absolute -left-[21px] top-3.5 size-2.5 rounded-full border-2 border-panel ${
                d === today ? "bg-pulse" : list.length ? "bg-rev" : "bg-line"
              }`}
            />
            <button
              onClick={() => onSelect(d)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${d === selected ? "bg-panel-2" : "hover:bg-panel-2/60"}`}
            >
              <span className="w-24 shrink-0">
                <span className={`block text-sm font-semibold ${d === today ? "text-pulse" : ""}`}>{relative(d, today)}</span>
                <span className="block text-[11px] text-muted">{formatDate(d, { weekday: "short", day: "numeric", month: "short" })}</span>
              </span>
              <span className="flex min-w-0 flex-1 flex-wrap gap-1">
                {list.slice(0, 4).map((i) => (
                  <span key={`${i.qid}-${i.revNo}`} className="flex max-w-48 items-center gap-1.5 truncate rounded-md bg-panel-2 px-2 py-0.5 text-xs">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: groupColors[i.group] }} />
                    <span className="truncate">{i.title}</span>
                  </span>
                ))}
                {list.length > 4 && <span className="px-1 text-xs text-muted">+{list.length - 4} more</span>}
                {!list.length && <span className="text-xs text-muted/70">Free day</span>}
              </span>
              {list.length > 0 && (
                <span className="shrink-0 text-right font-mono text-xs text-rev">
                  {list.length}
                  <span className="block text-[10px] text-muted">~{fmtMinutes(minutes(list))}</span>
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-6 rounded bg-gradient-to-r from-rev/10 to-rev/40" /> Load
      </span>
      {DIFFS.map((d) => (
        <span key={d} className="flex items-center gap-1.5">
          <span className="h-1 w-4 rounded-full" style={{ background: DIFF_COLOR[d] }} /> {d}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-new" />
        <span className="size-1.5 rounded-full bg-topic" /> Day&apos;s topics
      </span>
      <span>Past days show done / due</span>
    </div>
  );
}

function DayPanel({
  date,
  today,
  items,
  groups,
  groupColors,
}: {
  date: string;
  today: string;
  items: CalendarItem[];
  groups: string[];
  groupColors: Record<string, string>;
}) {
  const done = items.filter((i) => i.doneOn).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  return (
    <aside className="border-t border-line bg-panel-2/40 p-5 lg:border-l lg:border-t-0">
      <p className={`text-xs font-semibold uppercase tracking-wider ${date === today ? "text-pulse" : "text-muted"}`}>{relative(date, today)}</p>
      <h3 className="mt-0.5 text-xl font-semibold">{formatDate(date, { weekday: "long", day: "numeric", month: "long" })}</h3>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-panel p-2">
          <p className="font-mono text-lg font-semibold text-rev">{items.length}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">Revisions</p>
        </div>
        <div className="rounded-lg bg-panel p-2">
          <p className="font-mono text-lg font-semibold">{items.length ? `~${fmtMinutes(minutes(items))}` : "—"}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">Est. time</p>
        </div>
        <div className="rounded-lg bg-panel p-2">
          <p className="font-mono text-lg font-semibold text-pulse">{date <= today && items.length ? `${pct}%` : "—"}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted">Done</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-wider text-muted">New questions from</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {groups.length ? (
            groups.map((g) => (
              <span
                key={g}
                className="rounded-md border px-2 py-0.5 text-xs"
                style={{ borderColor: `${groupColors[g]}40`, background: `${groupColors[g]}14`, color: groupColors[g] }}
              >
                {g}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted">Rest day — no new questions</span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[11px] uppercase tracking-wider text-muted">Revisions</p>
        {items.length ? (
          <ul className="mt-2 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {items.map((i) => {
              const s = STATUS_STYLE[statusOf(i, today)];
              return (
                <li key={`${i.qid}-${i.revNo}`} className="rounded-lg border border-line bg-panel p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <a href={i.url} target="_blank" rel="noopener noreferrer" className="min-w-0 text-sm font-medium leading-snug hover:text-pulse">
                      {i.title}
                    </a>
                    <DifficultyBadge d={i.difficulty} />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted">
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: groupColors[i.group] }} />
                      <span className="truncate">{i.group}</span>
                    </span>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${s.cls}`}>{s.label}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2" title={`Revision ${i.revNo} of ${i.revTotal}`}>
                    <span className="font-mono text-[10px] text-rev">
                      R{i.revNo}/{i.revTotal}
                    </span>
                    <span className="flex flex-1 gap-0.5">
                      {Array.from({ length: i.revTotal }, (_, k) => (
                        <span
                          key={k}
                          className={`h-1 flex-1 rounded-full ${k < i.revNo - 1 ? "bg-rev/70" : k === i.revNo - 1 ? "bg-rev" : "bg-line"}`}
                          style={k === i.revNo - 1 ? { boxShadow: "0 0 6px var(--color-rev)" } : undefined}
                        />
                      ))}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-2 rounded-lg border border-dashed border-line p-5 text-center text-sm text-muted">
            Nothing to revise.
            <span className="block text-xs text-muted/70">A free day for new problems.</span>
          </div>
        )}
      </div>
    </aside>
  );
}

function Forecast({
  today,
  on,
  selected,
  onSelect,
  busiest,
}: {
  today: string;
  on: (date: string) => CalendarItem[];
  selected: string;
  onSelect: (date: string) => void;
  busiest: { date: string; n: number };
}) {
  const days = Array.from({ length: FORECAST_DAYS }, (_, i) => addDays(today, i));
  const loads = days.map((d) => on(d));
  const peak = Math.max(1, ...loads.map((l) => l.length));
  const total = loads.reduce((n, l) => n + l.length, 0);
  const avg = total / FORECAST_DAYS;
  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">30-day workload</h2>
        <p className="text-xs text-muted">
          <span className="font-semibold text-ink">{total}</span> revisions · avg <span className="font-semibold text-ink">{avg.toFixed(1)}</span>/day · ~
          {fmtMinutes(Math.round(loads.reduce((n, l) => n + minutes(l), 0) / FORECAST_DAYS))}/day
        </p>
      </div>
      <div className="relative mt-5 h-40">
        {avg > 0 && (
          <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-muted/40" style={{ bottom: `${(avg / peak) * 100}%` }}>
            <span className="absolute -top-4 right-0 font-mono text-[10px] text-muted">avg</span>
          </div>
        )}
        <div className="flex h-full items-end gap-[3px]">
          {days.map((d, idx) => {
            const list = loads[idx];
            const weekend = weekdayOf(d) === 0 || weekdayOf(d) === 6;
            return (
              <button
                key={d}
                onClick={() => onSelect(d)}
                title={`${formatDate(d, { weekday: "short", day: "numeric", month: "short" })}: ${list.length} revisions`}
                className={`group relative flex h-full flex-1 flex-col justify-end rounded-t ${d === selected ? "bg-pulse/10" : weekend ? "bg-white/[0.02]" : ""}`}
              >
                <span className="flex w-full flex-col-reverse overflow-hidden rounded-t-sm transition group-hover:brightness-125" style={{ height: `${(list.length / peak) * 100}%` }}>
                  {DIFFS.map((k) => {
                    const n = list.filter((i) => i.difficulty === k).length;
                    return n ? <span key={k} className="candle w-full origin-bottom" style={{ height: `${(n / list.length) * 100}%`, background: DIFF_COLOR[k], animationDelay: `${idx * 18}ms` }} /> : null;
                  })}
                </span>
                {d === busiest.date && busiest.n > 0 && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 -translate-y-full font-mono text-[10px] text-topic">{busiest.n}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-[3px] font-mono text-[9px] text-muted">
        {days.map((d, idx) => (
          <span key={d} className={`flex-1 text-center ${d === today ? "text-pulse" : ""}`}>
            {idx % 5 === 0 ? (d === today ? "now" : d.slice(8)) : ""}
          </span>
        ))}
      </div>
    </section>
  );
}

function StageLadder({ stages, mastered, revisionDays }: { stages: number[]; mastered: number; revisionDays: number[] }) {
  const steps = [
    ...stages.map((n, i) => ({ label: `R${i + 1}`, sub: revisionDays[i] != null ? `+${revisionDays[i]}d` : "", n, color: "var(--color-rev)" })),
    { label: "★", sub: "mastered", n: mastered, color: "var(--color-pulse)" },
  ];
  const peak = Math.max(1, ...steps.map((s) => s.n));
  const total = steps.reduce((n, s) => n + s.n, 0);
  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Memory pipeline</h2>
        <p className="text-xs text-muted">
          <span className="font-semibold text-ink">{total}</span> questions by next round
        </p>
      </div>
      <div className="mt-5 flex h-40 items-end gap-2">
        {steps.map((s, i) => (
          <div key={s.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="font-mono text-xs font-semibold" style={{ color: s.n ? s.color : undefined }}>
              {s.n}
            </span>
            <span
              className="candle w-full origin-bottom rounded-t-md"
              style={{
                height: `${Math.max(3, (s.n / peak) * 100)}%`,
                background: `linear-gradient(to top, color-mix(in srgb, ${s.color} 25%, transparent), ${s.color})`,
                opacity: s.n ? 0.4 + 0.6 * ((i + 1) / steps.length) : 0.25,
                animationDelay: `${i * 60}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 text-center">
        {steps.map((s) => (
          <div key={s.label} className="flex-1">
            <p className="font-mono text-xs font-semibold">{s.label}</p>
            <p className="text-[10px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">Each bar is how many solved questions are waiting on that revision round. Days are counted from when you solved it.</p>
    </section>
  );
}

const OVERDUE_PREVIEW = 9;

function OverdueList({ list, today, groupColors }: { list: CalendarItem[]; today: string; groupColors: Record<string, string> }) {
  const [all, setAll] = useState(false);
  return (
    <section className="card border-hard/40 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold text-hard">Overdue · {list.length}</h2>
        <p className="text-xs text-muted">Clear these from the dashboard. One review covers every missed round of a question.</p>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {(all ? list : list.slice(0, OVERDUE_PREVIEW)).map((o) => {
          const late = diffDays(today, o.due);
          return (
            <li key={o.qid} className="flex items-center gap-3 rounded-lg border border-line bg-panel-2 px-3 py-2">
              <span
                className="grid size-9 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold"
                style={{ background: `rgb(255 107 107 / ${Math.min(0.12 + late * 0.04, 0.45)})`, color: "var(--color-hard)" }}
                title={`${late} days late`}
              >
                {late}d
              </span>
              <span className="min-w-0 flex-1">
                <a href={o.url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm hover:text-pulse">
                  {o.title}
                </a>
                <span className="flex items-center gap-1.5 text-[11px] text-muted">
                  <span className="size-1.5 rounded-full" style={{ background: groupColors[o.group] }} />
                  <span className="truncate">{o.group}</span>
                  <span>·</span>
                  <span className="font-mono text-rev">R{o.revNo}</span>
                  <span>·</span>
                  <span>since {formatDate(o.due)}</span>
                </span>
              </span>
              <DifficultyBadge d={o.difficulty} />
            </li>
          );
        })}
      </ul>
      {list.length > OVERDUE_PREVIEW && (
        <button onClick={() => setAll(!all)} className="mt-3 text-xs font-medium text-hard hover:underline">
          {all ? "Show fewer" : `Show all ${list.length}`}
        </button>
      )}
    </section>
  );
}
