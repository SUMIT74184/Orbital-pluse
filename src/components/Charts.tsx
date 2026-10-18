import type { DayActivity } from "@/lib/plan";
import { formatDate } from "@/lib/dates";

export function TodayProgress({
  percent,
  done,
  total,
  parts,
}: {
  percent: number;
  done: number;
  total: number;
  parts: { label: string; done: number; total: number; color: string }[];
}) {
  const complete = percent >= 100;
  return (
    <section className="card p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-muted">Today&apos;s progress</h2>
          <p className="mt-1 text-4xl font-semibold tabular-nums">
            {percent}
            <span className="text-xl text-muted">%</span>
          </p>
        </div>
        <p className="text-right text-sm text-muted">
          <span className="font-semibold text-ink">{done}</span> / {total} tasks
          {complete && <span className="mt-1 block text-pulse">Target hit — great work!</span>}
        </p>
      </div>
      <div
        className="mt-4 h-4 overflow-hidden rounded-full bg-panel-2"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-new via-rev to-pulse transition-[width] duration-700"
          style={{ width: `${percent}%`, boxShadow: complete ? "0 0 14px rgb(34 229 132 / 0.6)" : undefined }}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {parts.map((p) => (
          <div key={p.label}>
            <div className="flex justify-between text-xs">
              <span className="text-muted">{p.label}</span>
              <span className="tabular-nums">
                {p.done}/{p.total}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel-2">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%`, background: p.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const SERIES = [
  { key: "solved", label: "Solved", color: "var(--color-new)" },
  { key: "revised", label: "Revised", color: "var(--color-rev)" },
  { key: "topics", label: "Topics", color: "var(--color-topic)" },
] as const;

export function ActivityBars({ days }: { days: DayActivity[] }) {
  const max = Math.max(4, ...days.map((d) => d.solved + d.revised + d.topics));
  const ticks = [max, Math.round(max / 2), 0];
  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Last {days.length} days</h2>
        <div className="flex gap-3 text-xs text-muted">
          {SERIES.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <div className="flex h-44 flex-col justify-between pb-5 text-right font-mono text-[10px] text-muted">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="flex flex-1 items-end gap-1 sm:gap-1.5">
          {days.map((d) => {
            const sum = d.solved + d.revised + d.topics;
            return (
              <div key={d.date} className="group flex min-w-0 flex-1 flex-col items-center">
                <div
                  className="relative flex h-39 w-full flex-col-reverse overflow-hidden rounded-t-md"
                  title={`${formatDate(d.date)}: ${d.solved} solved, ${d.revised} revised, ${d.topics} topics`}
                >
                  {SERIES.map((s) =>
                    d[s.key] ? (
                      <div
                        key={s.key}
                        className="w-full border-t border-panel transition-opacity group-hover:opacity-85"
                        style={{ height: `${(d[s.key] / max) * 100}%`, background: s.color }}
                      />
                    ) : null,
                  )}
                  {sum === 0 && <div className="h-0.5 w-full bg-line" />}
                </div>
                <span className="mt-1.5 h-3.5 font-mono text-[10px] text-muted">{formatDate(d.date, { day: "numeric" })}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function GroupBars({ groups }: { groups: { group: string; solved: number; total: number }[] }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold">Pattern progress</h2>
      <ul className="mt-4 space-y-2.5">
        {groups.map((g) => {
          const pct = g.total ? Math.round((g.solved / g.total) * 100) : 0;
          return (
            <li key={g.group} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_4rem]">
              <span className="truncate text-muted" title={g.group}>
                {g.group}
              </span>
              <div className="h-2.5 overflow-hidden rounded-full bg-panel-2">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${pct}%`, background: pct === 100 ? "var(--color-pulse)" : "var(--color-new)" }}
                />
              </div>
              <span className="text-right font-mono text-xs tabular-nums text-muted">
                {g.solved}/{g.total}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Spider-web view of pattern progress: one spoke per pattern, the filled shape is % solved.
 * Lopsided shape = the patterns you've been avoiding.
 */
export function PatternRadar({ groups }: { groups: { group: string; solved: number; total: number }[] }) {
  if (groups.length < 3) return <GroupBars groups={groups} />; // a radar needs at least a triangle
  const W = 580;
  const H = 460;
  const cx = W / 2;
  const cy = H / 2;
  const R = 135;
  const n = groups.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const at = (i: number, r: number) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r] as const;
  const pts = groups.map((g, i) => {
    const pct = g.total ? g.solved / g.total : 0;
    return { ...g, pct, xy: at(i, Math.max(pct, 0.02) * R) };
  });
  const shape = pts.map((p) => p.xy.join(",")).join(" ");
  const solved = groups.reduce((a, g) => a + g.solved, 0);
  const total = groups.reduce((a, g) => a + g.total, 0);
  const weakest = [...pts].filter((p) => p.total).sort((a, b) => a.pct - b.pct)[0];
  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-semibold">Pattern radar</h2>
        <span className="font-mono text-xs text-muted">
          {solved}/{total} · {total ? Math.round((solved / total) * 100) : 0}%
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto mt-2 w-full" role="img" aria-label="Pattern progress radar chart">
        {[0.25, 0.5, 0.75, 1].map((r) => (
          <polygon
            key={r}
            points={groups.map((_, i) => at(i, r * R).join(",")).join(" ")}
            fill={r === 1 ? "var(--color-panel-2)" : "none"}
            fillOpacity={0.5}
            stroke="var(--color-line)"
            strokeWidth="1"
          />
        ))}
        {groups.map((_, i) => {
          const [x, y] = at(i, R);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-line)" strokeWidth="1" />;
        })}
        {[25, 50, 75].map((v) => (
          <text key={v} x={cx + 3} y={cy - (v / 100) * R - 3} fontSize="10" className="fill-muted font-mono" opacity="0.7">
            {v}%
          </text>
        ))}
        <g className="radar-shape">
          <polygon points={shape} fill="var(--color-pulse)" fillOpacity="0.18" stroke="var(--color-pulse)" strokeWidth="2" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgb(34 229 132 / 0.45))" }} />
          {pts.map((p) => (
            <circle key={p.group} cx={p.xy[0]} cy={p.xy[1]} r="3.5" fill={p.pct === 1 ? "var(--color-pulse)" : "var(--color-new)"} stroke="var(--color-panel)" strokeWidth="1.5">
              <title>{`${p.group}: ${p.solved}/${p.total} (${Math.round(p.pct * 100)}%)`}</title>
            </circle>
          ))}
        </g>
        {pts.map((p, i) => {
          const [x, y] = at(i, R + 14);
          const cos = Math.cos(angle(i));
          const vertical = Math.abs(cos) < 0.05;
          const anchor = vertical ? "middle" : cos > 0 ? "start" : "end";
          const sin = Math.sin(angle(i));
          // Labels hugging the top/bottom of the web sit further out so they clear their neighbours.
          const dy = sin < -0.5 ? (vertical ? -26 : -16) : sin > 0.9 ? 30 : sin > 0.5 ? 10 : -4;
          return (
            <text key={p.group} x={x} y={y + dy} textAnchor={anchor} fontSize="15" className="fill-ink">
              <title>{`${p.group}: ${p.solved}/${p.total}`}</title>
              {p.group.length > 17 ? `${p.group.slice(0, 16)}…` : p.group}
              <tspan x={x} dy="16" fontSize="12.5" className={`font-mono ${p.pct === 1 ? "fill-pulse" : "fill-muted"}`}>
                {p.solved}/{p.total}
              </tspan>
            </text>
          );
        })}
      </svg>
      {weakest && weakest.pct < 1 && (
        <p className="mt-2 text-center text-xs text-muted">
          Weakest spoke: <span className="text-ink">{weakest.group}</span> — {weakest.solved}/{weakest.total} solved.
        </p>
      )}
    </section>
  );
}

export function DifficultyBars({ byDifficulty, totals }: { byDifficulty: Record<string, number>; totals: Record<string, number> }) {
  const rows = [
    { k: "Easy", c: "var(--color-easy)" },
    { k: "Medium", c: "var(--color-medium)" },
    { k: "Hard", c: "var(--color-hard)" },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.k} className="flex items-center gap-2 text-xs">
          <span className="w-14" style={{ color: r.c }}>
            {r.k}
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-panel-2">
            <div className="h-full rounded-full" style={{ width: `${totals[r.k] ? (byDifficulty[r.k] / totals[r.k]) * 100 : 0}%`, background: r.c }} />
          </div>
          <span className="w-12 text-right font-mono tabular-nums text-muted">
            {byDifficulty[r.k]}/{totals[r.k]}
          </span>
        </div>
      ))}
    </div>
  );
}
