"use client";

import { useEffect, useRef, useState } from "react";
import type { DayActivity } from "@/lib/plan";
import { formatDate, weekdayOf } from "@/lib/dates";

// Light blue for a little activity, deep blue for a lot. Level 0 is an empty cell.
const LEVELS = [
  "var(--color-panel-2)",
  "#bfdbfe",
  "#60a5fa",
  "#2563eb",
  "#1e40af",
];
const level = (n: number) =>
  n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : n <= 7 ? 3 : 4;
const total = (d: DayActivity) => d.solved + d.revised + d.topics;

const CELL = 12;
const GAP = 3;

export function ContributionCalendar({
  days,
  today,
}: {
  days: DayActivity[];
  today: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    d: DayActivity;
    x: number;
    y: number;
  } | null>(null);

  // On narrow screens start scrolled to the most recent weeks.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  const weeks: DayActivity[][] = [];
  days.forEach((d, i) => {
    if (i === 0 || weekdayOf(d.date) === 0) weeks.push([]);
    weeks[weeks.length - 1].push(d);
  });
  const months = weeks.map((w, i) => {
    const first =
      w.find((d) => d.date.endsWith("-01")) ?? (i === 0 ? w[0] : null);
    return first ? formatDate(first.date, { month: "short" }) : null;
  });

  const sum = days.reduce((n, d) => n + total(d), 0);
  const activeDays = days.filter((d) => total(d) > 0).length;

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Activity</h2>
        <p className="text-xs text-muted">
          <span className="font-semibold text-ink">{sum}</span>{" "}
          {sum === 1 ? "activity" : "activities"} on{" "}
          <span className="font-semibold text-ink">{activeDays}</span>{" "}
          {activeDays === 1 ? "day" : "days"} in the last year
        </p>
      </div>

      {/* The tooltip sits outside the scroller so the top row's tooltip isn't clipped. */}
      <div
        ref={wrap}
        className="relative mt-4"
        onMouseLeave={() => setHover(null)}
      >
        <div
          ref={scroller}
          className="overflow-x-auto pb-1"
          onScroll={() => setHover(null)}
        >
          <div className="inline-flex gap-2">
            <div
              className="grid shrink-0 pt-5 text-[10px] text-muted"
              style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP }}
            >
              {["", "Mon", "", "Wed", "", "Fri", ""].map((l, i) => (
                <span key={i} className="leading-3">
                  {l}
                </span>
              ))}
            </div>
            <div>
              <div
                className="flex h-5 text-[10px] text-muted"
                style={{ gap: GAP }}
              >
                {months.map((m, i) => (
                  <span
                    key={i}
                    className="shrink-0 overflow-visible whitespace-nowrap"
                    style={{ width: CELL }}
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div
                className="flex"
                style={{ gap: GAP }}
                role="img"
                aria-label={`${sum} activities on ${activeDays} days in the last year`}
              >
                {weeks.map((w, wi) => (
                  <div
                    key={wi}
                    className="grid"
                    style={{
                      gridTemplateRows: `repeat(7, ${CELL}px)`,
                      rowGap: GAP,
                    }}
                  >
                    {w.map((d) => {
                      const n = total(d);
                      return (
                        <div
                          key={d.date}
                          onMouseEnter={(e) => {
                            const box = wrap.current!.getBoundingClientRect();
                            const cell =
                              e.currentTarget.getBoundingClientRect();
                            // Keep the tooltip inside the card near the left and right edges.
                            const x = Math.min(
                              Math.max(cell.left - box.left + CELL / 2, 110),
                              box.width - 110,
                            );
                            setHover({ d, x, y: cell.top - box.top });
                          }}
                          className={`rounded-[3px] transition-transform hover:scale-125 ${d.date === today ? "ring-1 ring-pulse/70" : ""}`}
                          style={{
                            width: CELL,
                            height: CELL,
                            gridRowStart: weekdayOf(d.date) + 1,
                            background: LEVELS[level(n)],
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {hover && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-line bg-bg px-2.5 py-1.5 text-xs shadow-lg"
            style={{ left: hover.x, top: hover.y - 6 }}
          >
            <p className="font-semibold">
              {total(hover.d)
                ? `${total(hover.d)} ${total(hover.d) === 1 ? "activity" : "activities"}`
                : "No activity"}
              <span className="font-normal text-muted">
                {" "}
                ·{" "}
                {formatDate(hover.d.date, {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </p>
            {total(hover.d) > 0 && (
              <p className="mt-0.5 text-muted">
                {hover.d.solved} solved · {hover.d.revised} revised ·{" "}
                {hover.d.topics} {hover.d.topics === 1 ? "topic" : "topics"}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted">
        <span>Less</span>
        {LEVELS.map((c, i) => (
          <span
            key={i}
            className="rounded-[3px]"
            style={{ width: CELL, height: CELL, background: c }}
            title={["0", "1–2", "3–4", "5–7", "8+"][i]}
          />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
