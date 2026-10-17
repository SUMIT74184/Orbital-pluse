"use client";

import { useState } from "react";
import type { DayActivity } from "@/lib/plan";
import { formatDate } from "@/lib/dates";

const SEG = 100; // viewBox width per day
const H = 200;
const BASE = 128;

const total = (d: DayActivity) => d.solved + d.revised + d.topics;

/** One PQRST complex per day; the R-peak height follows that day's activity. A blank day is a flatline. */
function beatPath(days: DayActivity[]) {
  const max = Math.max(4, ...days.map(total));
  let d = `M0 ${BASE}`;
  days.forEach((day, i) => {
    const x = i * SEG;
    const v = total(day);
    if (v === 0) {
      d += ` L${x + 50} ${BASE + 1} L${x + SEG} ${BASE}`;
      return;
    }
    const r = 28 + 92 * Math.min(v / max, 1);
    const s = 10 + r * 0.12;
    d +=
      ` L${x + 12} ${BASE} Q${x + 19} ${BASE - 9} ${x + 26} ${BASE}` + // P wave
      ` L${x + 36} ${BASE} L${x + 40} ${BASE + 7}` + // Q
      ` L${x + 46} ${BASE - r}` + // R
      ` L${x + 52} ${BASE + s} L${x + 57} ${BASE}` + // S
      ` L${x + 66} ${BASE} Q${x + 76} ${BASE - 16} ${x + 86} ${BASE}` + // T wave
      ` L${x + SEG} ${BASE}`;
  });
  return d;
}

export function EcgMonitor({
  days,
  joined,
  percent,
  streak,
}: {
  days: DayActivity[];
  joined: string;
  percent: number;
  streak: number;
}) {
  const [sel, setSel] = useState(days.length - 1);
  const W = days.length * SEG;
  const day = days[sel];
  const beats = days.filter((d) => total(d) > 0).length;
  // Days before signup aren't missed days.
  const flat = days.filter((d) => d.date >= joined && total(d) === 0).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-pulse/20 bg-[#040a07] shadow-[0_0_40px_-12px_rgb(34_229_132/0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pulse/15 px-4 py-3 font-mono text-xs sm:px-5">
        <div className="flex items-center gap-2 text-pulse/80">
          <span className="ecg-blink inline-block h-2 w-2 rounded-full bg-pulse" />
          LEAD II · LAST {days.length} DAYS · ACTIVITY
        </div>
        <div className="flex gap-5 text-pulse">
          <Readout label="TODAY" value={`${percent}%`} />
          <Readout label="STREAK" value={`${streak}d`} />
          <Readout label="BEATS" value={beats} />
          <Readout label="FLAT" value={flat} warn={flat > 0} />
        </div>
      </div>

      <div
        className="relative h-44 sm:h-52"
        style={{
          backgroundImage:
            "linear-gradient(rgb(34 229 132 / 0.10) 1px, transparent 1px), linear-gradient(90deg, rgb(34 229 132 / 0.10) 1px, transparent 1px), linear-gradient(rgb(34 229 132 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(34 229 132 / 0.04) 1px, transparent 1px)",
          backgroundSize: "50px 50px, 50px 50px, 10px 10px, 10px 10px",
        }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" role="img" aria-label="Daily activity trace">
          <rect x={sel * SEG} y={0} width={SEG} height={H} className="fill-pulse/[0.07]" />
          <path
            key={W}
            d={beatPath(days)}
            pathLength={1}
            fill="none"
            className="ecg-trace stroke-pulse"
            strokeWidth={2.2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: "drop-shadow(0 0 4px rgb(34 229 132 / 0.85))" }}
          />
          {days.map((d, i) => (
            <rect
              key={d.date}
              x={i * SEG}
              y={0}
              width={SEG}
              height={H}
              fill="transparent"
              onMouseEnter={() => setSel(i)}
              onClick={() => setSel(i)}
              className="cursor-crosshair"
            />
          ))}
        </svg>
        <div className="ecg-sweep pointer-events-none absolute inset-y-0 left-0 w-[12%] bg-gradient-to-r from-transparent via-[#040a07]/40 to-[#040a07]" />
        <span
          className="ecg-blink pointer-events-none absolute right-1 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-pulse shadow-[0_0_10px_rgb(34_229_132)]"
          style={{ top: `${(BASE / H) * 100}%` }}
        />
      </div>

      <div className="flex border-t border-pulse/10 px-1 font-mono text-[10px] text-pulse/50">
        {days.map((d, i) => (
          <span key={d.date} className="flex-1 text-center">
            {i % 5 === days.length % 5 || i === days.length - 1 ? formatDate(d.date, { day: "numeric" }) : ""}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-pulse/15 px-4 py-2.5 font-mono text-xs sm:px-5">
        <span className="text-pulse">{formatDate(day.date, { weekday: "short", day: "numeric", month: "short" })}</span>
        {day.date < joined ? (
          <span className="text-pulse/40">before you joined</span>
        ) : total(day) === 0 ? (
          <span className="text-hard">flatline — no activity</span>
        ) : (
          <>
            <span className="text-new">{day.solved} solved</span>
            <span className="text-rev">{day.revised} revised</span>
            <span className="text-topic">{day.topics} topics</span>
          </>
        )}
        <span className="ml-auto hidden text-pulse/40 sm:inline">hover a beat for details</span>
      </div>
    </section>
  );
}

function Readout({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="text-right leading-tight">
      <div className="text-[10px] text-pulse/50">{label}</div>
      <div className={`text-base font-semibold ${warn ? "text-hard" : ""}`}>{value}</div>
    </div>
  );
}
