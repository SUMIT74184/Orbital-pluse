import { WEEKDAYS } from "@/data/catalog";
import type { CatalogMeta } from "@/lib/catalog";

const ORDER = [1, 2, 3, 4, 5, 6, 0];
const FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// A stable colour per pattern so the same topic looks the same everywhere.
const HUES = ["#4c9aff", "#fb923c", "#b18cff", "#ffb547", "#ff7eb6", "#e879f9", "#f87171", "#f43f5e", "#fbbf24"];
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

/** Drag state and handlers, supplied by WeekRotationEditor. Without them the grid is read-only. */
export type DragHandlers = {
  active: { group: string; from: number } | null;
  over: number | null;
  start: (group: string, from: number) => void;
  end: () => void;
  enter: (day: number) => void;
  drop: (day: number) => void;
};

/**
 * Seven day cards, Monday first. `today` (0–6) gets highlighted; `solvedByGroup` adds per-day progress.
 */
export function WeekRotation({
  schedule,
  meta,
  today,
  solvedByGroup,
  drag,
}: {
  schedule: string[][];
  meta: CatalogMeta;
  today?: number;
  solvedByGroup?: Record<string, number>;
  drag?: DragHandlers;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
      {ORDER.map((d) => {
        const groups = schedule[d] ?? [];
        const total = groups.reduce((n, g) => n + (meta.counts[g] ?? 0), 0);
        const solved = solvedByGroup ? groups.reduce((n, g) => n + (solvedByGroup[g] ?? 0), 0) : null;
        const isToday = d === today;
        const target = drag?.active && drag.active.from !== d;
        const over = target && drag.over === d;
        return (
          <div
            key={d}
            onDragOver={
              target
                ? (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (drag.over !== d) drag.enter(d);
                  }
                : undefined
            }
            onDrop={
              target
                ? (e) => {
                    e.preventDefault();
                    drag.drop(d);
                  }
                : undefined
            }
            // Tap-to-move fallback for touch screens: pick a chip, then tap another day.
            onClick={target ? () => drag.drop(d) : undefined}
            className={`relative flex flex-col rounded-xl border p-3 transition ${
              over
                ? "border-pulse bg-pulse/[0.12] ring-1 ring-pulse"
                : target
                  ? "cursor-pointer border-dashed border-pulse/40 bg-panel-2/60"
                  : isToday
                    ? "border-pulse/60 bg-pulse/[0.06] shadow-[0_0_24px_-10px_rgb(255_106_61/0.6)]"
                    : "border-line bg-panel-2/60"
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
                groups.map((g) =>
                  drag ? (
                    <button
                      key={g}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", g); // Firefox won't start a drag without data
                        drag.start(g, d);
                      }}
                      onDragEnd={drag.end}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (drag.active?.group === g && drag.active.from === d) drag.end();
                        else drag.start(g, d);
                      }}
                      title="Drag to another day (or tap, then tap a day)"
                      aria-pressed={drag.active?.group === g && drag.active.from === d}
                      className={`max-w-full cursor-grab rounded-md text-left transition active:cursor-grabbing ${
                        drag.active?.group === g && drag.active.from === d ? "opacity-50 ring-1 ring-pulse" : ""
                      }`}
                    >
                      <TopicChip group={g} solved={solvedByGroup?.[g]} meta={meta} />
                    </button>
                  ) : (
                    <TopicChip key={g} group={g} solved={solvedByGroup?.[g]} meta={meta} />
                  ),
                )
              ) : (
                <span className="text-xs text-muted">{over ? "Drop here" : "Rest day"}</span>
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
