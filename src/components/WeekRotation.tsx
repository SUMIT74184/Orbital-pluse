import { WEEKDAYS } from "@/data/catalog";
import type { CatalogMeta } from "@/lib/catalog";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// A stable colour per pattern so the same topic looks the same everywhere.
const HUES = ["#4c9aff", "#2dd4a0", "#b18cff", "#ffb547", "#ff7eb6", "#5eead4", "#f87171", "#a3e635", "#fbbf24"];
export const groupColor = (g: string, groups: string[]) => HUES[Math.max(0, groups.indexOf(g)) % HUES.length];

export function TopicChip({ group, solved, meta }: { group: string; solved?: number; meta: CatalogMeta }) {
  const c = groupColor(group, meta.groups);
  return (
    <span
      className="inline-flex max-w-full items-baseline justify-between gap-1.5 rounded-md border px-2 py-1 text-xs leading-snug"
      style={{ borderColor: `${c}40`, background: `${c}14`, color: c }}
    >
      <span>{group}</span>
      <span className="font-mono text-[10px] opacity-70">
        {solved != null ? `${solved}/` : ""}
        {meta.counts[group] ?? 0}
      </span>
    </span>
  );
}

/**
 * Seven day cards, Monday first. `today` (0–6) gets highlighted; `solvedByGroup` adds per-day progress.
 */
export function WeekRotation({
  schedule,
  meta,
  today,
  solvedByGroup,
}: {
  schedule: string[][];
  meta: CatalogMeta;
  today?: number;
  solvedByGroup?: Record<string, number>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {ORDER.map((d) => {
        const groups = schedule[d] ?? [];
        const total = groups.reduce((n, g) => n + (meta.counts[g] ?? 0), 0);
        const solved = solvedByGroup ? groups.reduce((n, g) => n + (solvedByGroup[g] ?? 0), 0) : null;
        const isToday = d === today;
        return (
          <div
            key={d}
            className={`relative flex flex-col rounded-xl border p-3 transition ${
              isToday ? "border-pulse/60 bg-pulse/[0.06] shadow-[0_0_24px_-10px_rgb(34_229_132/0.6)]" : "border-line bg-panel-2/60"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm font-semibold ${isToday ? "text-pulse" : ""}`}>
                <span className="lg:hidden">{FULL[d]}</span>
                <span className="hidden lg:inline">{WEEKDAYS[d]}</span>
              </span>
              {isToday && (
                <span className="rounded-full bg-pulse px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
                  Today
                </span>
              )}
            </div>
            <div className="mt-2.5 flex flex-1 flex-wrap content-start gap-1.5 lg:flex-col lg:flex-nowrap">
              {groups.length ? (
                groups.map((g) => <TopicChip key={g} group={g} solved={solvedByGroup?.[g]} meta={meta} />)
              ) : (
                <span className="text-xs text-muted">Rest day</span>
              )}
            </div>
            {total > 0 && (
              <div className="mt-3 border-t border-line/70 pt-2">
                {solved != null ? (
                  <>
                    <div className="flex justify-between font-mono text-[10px] text-muted">
                      <span>done</span>
                      <span>
                        {solved}/{total}
                      </span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-line">
                      <div className="h-full rounded-full bg-pulse" style={{ width: `${(solved / total) * 100}%` }} />
                    </div>
                  </>
                ) : (
                  <span className="font-mono text-[10px] text-muted">{total} questions</span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
