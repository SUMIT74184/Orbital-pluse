import { formatDate } from "@/lib/dates";

export function StatTile({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 truncate text-2xl font-semibold tabular-nums" style={color ? { color } : undefined}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}

/** One series per day; each bar has a hover tooltip and the busiest day is labelled. */
export function DayBars({
  title,
  days,
  unit,
  color = "var(--color-pulse)",
}: {
  title: string;
  days: { date: string; n: number }[];
  unit: string;
  color?: string;
}) {
  const values = days.map((d) => d.n);
  const max = Math.max(1, ...values);
  const peak = values.indexOf(Math.max(...values));
  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        <span className="font-mono text-xs text-muted">peak {max}</span>
      </div>
      <div className="mt-4 flex h-36 items-end gap-[2px]">
        {days.map((d, i) => (
          <div key={d.date} className="group relative flex h-full min-w-0 flex-1 items-end" title={`${formatDate(d.date)}: ${values[i]} ${unit}`}>
            <div
              className="w-full rounded-t-[4px] transition-opacity group-hover:opacity-80"
              style={{ height: values[i] ? `${(values[i] / max) * 100}%` : "2px", background: values[i] ? color : "var(--color-line)" }}
            />
            {i === peak && values[i] > 0 && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] text-ink">{values[i]}</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted">
        <span>{formatDate(days[0].date)}</span>
        <span>{formatDate(days[days.length - 1].date)}</span>
      </div>
    </section>
  );
}

/** Ranked horizontal bars for "how many of each". */
export function RankBars({
  rows,
  color = "var(--color-new)",
  empty = "No data yet",
}: {
  rows: { label: string; n: number; note?: string }[];
  color?: string;
  empty?: string;
}) {
  if (!rows.length) return <p className="py-4 text-center text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-sm" title={`${r.label}: ${r.n}${r.note ? ` · ${r.note}` : ""}`}>
          <span className="truncate text-muted">{r.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-panel-2">
            <div className="h-full rounded-full" style={{ width: `${(r.n / max) * 100}%`, background: color }} />
          </div>
          <span className="text-right font-mono text-xs tabular-nums text-ink">
            {r.n}
            {r.note && <span className="ml-1.5 text-muted">{r.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Card({ title, sub, children, className = "" }: { title: string; sub?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <h2 className="font-semibold">{title}</h2>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export const pct = (x: number | null) => (x == null ? "—" : `${Math.round(x * 100)}%`);

export function timeAgo(at: Date | null) {
  if (!at) return "never";
  const s = (Date.now() - at.getTime()) / 1000;
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86_400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86_400)} d ago`;
}
