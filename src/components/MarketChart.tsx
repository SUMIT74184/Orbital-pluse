"use client";

import { useMemo, useState } from "react";
import type { DayActivity } from "@/lib/plan";
import { formatDate } from "@/lib/dates";

type Candle = DayActivity & { o: number; h: number; l: number; c: number; ret: number; points: number; ma: number | null };

const UP = "#22e584";
const DOWN = "#ff5c6c";
const FLAT = "#8b98a5";

/**
 * Turns daily activity into a price series. Each day's return depends on how the day's
 * points compare with the daily target: nothing done ≈ -6%, target hit ≈ +2%, double the target ≈ +10%.
 */
function toCandles(days: DayActivity[], targetPoints: number): Candle[] {
  const out: Candle[] = [];
  let price = 100;
  days.forEach((d, i) => {
    const points = d.solved * 3 + d.revised + d.topics * 2;
    // Today's session is still open: nothing done yet shouldn't already count as a red day.
    const open = i === days.length - 1 && points === 0;
    const ret = open ? 0 : (Math.min(points / targetPoints, 2) - 0.75) * 0.08;
    const o = price;
    const c = +(o * (1 + ret)).toFixed(2);
    const body = Math.abs(c - o);
    // Wicks: revisions push the intraday high, an idle day drags the low further down.
    const h = Math.max(o, c) + body * 0.25 + o * 0.004 * Math.min(d.revised, 5);
    const l = Math.min(o, c) - body * 0.25 - (points === 0 && !open ? o * 0.012 : o * 0.003);
    const window = out.slice(Math.max(0, i - 4)).map((x) => x.c).concat(c);
    out.push({ ...d, o, h, l, c, ret, points, ma: window.length >= 3 ? window.reduce((a, b) => a + b, 0) / window.length : null });
    price = c;
  });
  return out;
}

export function MarketChart({
  days,
  joined,
  targetPoints,
  streak,
}: {
  days: DayActivity[];
  joined: string;
  targetPoints: number;
  streak: number;
}) {
  // Trading starts on the signup date; earlier days simply aren't listed.
  const visible = useMemo(() => days.filter((d) => d.date >= joined), [days, joined]);
  const candles = useMemo(() => toCandles(visible.length ? visible : days.slice(-1), targetPoints), [visible, days, targetPoints]);
  const [sel, setSel] = useState<number | null>(null);

  const last = candles[candles.length - 1];
  const cur = candles[sel ?? candles.length - 1];
  const sessionOpen = last.points === 0;
  const change = last.c - last.o;
  const pct = (change / last.o) * 100;
  const hi = Math.max(...candles.map((c) => c.h));
  const lo = Math.min(...candles.map((c) => c.l));
  const greens = candles.filter((c) => c.c >= c.o).length;

  // Price scale with a little headroom.
  const pad = Math.max((hi - lo) * 0.12, 1.5);
  const top = hi + pad;
  const bottom = lo - pad;
  const H = 100;
  const y = (v: number) => ((top - v) / (top - bottom)) * H;
  const n = Math.max(candles.length, 14); // keep candles from getting absurdly wide early on
  const slot = 100 / n;
  const x0 = (i: number) => i * slot;
  const maxVol = Math.max(1, ...candles.map((c) => c.solved + c.revised + c.topics));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => top - (top - bottom) * t);
  // Hide axis labels that would sit under the current-price tag.
  const axisTicks = ticks.filter((t) => Math.abs(y(t) - y(last.c)) > 9);
  const maPath = candles
    .map((c, i) => (c.ma == null ? null : `${x0(i) + slot / 2},${y(c.ma)}`))
    .filter(Boolean)
    .join(" ");

  const up = change >= 0;
  const tone = change === 0 ? FLAT : up ? UP : DOWN;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-[#0b1016]">
      {/* Ticker header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-4 py-3 sm:px-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="rounded bg-panel-2 px-1.5 py-0.5 font-semibold text-ink">$DSAX</span>
            DSA Prep Index · daily
            <span className="flex items-center gap-1">
              <span className="ecg-blink inline-block h-1.5 w-1.5 rounded-full" style={{ background: UP }} />
              LIVE
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-semibold tabular-nums">{last.c.toFixed(2)}</span>
            <span className="font-mono text-sm font-semibold tabular-nums" style={{ color: tone }}>
              {change === 0 ? "■" : up ? "▲" : "▼"} {up ? "+" : ""}
              {change.toFixed(2)} ({up ? "+" : ""}
              {pct.toFixed(2)}%)
            </span>
            <span className="text-xs text-muted">{sessionOpen ? "today · session open, start solving to move it" : "today"}</span>
          </div>
        </div>
        <dl className="grid grid-cols-4 gap-x-5 font-mono text-xs">
          <Stat k="HIGH" v={hi.toFixed(2)} />
          <Stat k="LOW" v={lo.toFixed(2)} />
          <Stat k="GREEN" v={`${greens}/${candles.length}`} />
          <Stat k="STREAK" v={`${streak}d`} />
        </dl>
      </div>

      {/* OHLC readout for the hovered day */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 pt-3 font-mono text-[11px] text-muted sm:px-5">
        <span className="text-ink">{formatDate(cur.date, { weekday: "short", day: "numeric", month: "short" })}</span>
        <span>
          O <b className="font-medium text-ink">{cur.o.toFixed(2)}</b>
        </span>
        <span>
          H <b className="font-medium text-ink">{cur.h.toFixed(2)}</b>
        </span>
        <span>
          L <b className="font-medium text-ink">{cur.l.toFixed(2)}</b>
        </span>
        <span>
          C{" "}
          <b className="font-medium" style={{ color: cur.c === cur.o ? FLAT : cur.c > cur.o ? UP : DOWN }}>
            {cur.c.toFixed(2)}
          </b>
        </span>
        <span className="text-new">{cur.solved} solved</span>
        <span className="text-rev">{cur.revised} revised</span>
        <span className="text-topic">{cur.topics} topics</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 bg-topic" /> MA5
        </span>
      </div>

      <div className="flex px-2 pb-2 pt-2 sm:px-3">
        <div className="relative min-w-0 flex-1" onMouseLeave={() => setSel(null)}>
          {/* Price pane */}
          <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="block h-48 w-full sm:h-56" role="img" aria-label="Prep index candlestick chart">
            {ticks.map((t) => (
              <line key={t} x1={0} x2={100} y1={y(t)} y2={y(t)} stroke="#1f2a36" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
            ))}
            <line x1={0} x2={100} y1={y(last.c)} y2={y(last.c)} stroke={tone} strokeOpacity={0.5} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
            {sel != null && (
              <line x1={x0(sel) + slot / 2} x2={x0(sel) + slot / 2} y1={0} y2={H} stroke="#8b98a5" strokeOpacity={0.4} vectorEffect="non-scaling-stroke" />
            )}
            {candles.map((c, i) => {
              const color = c.c === c.o ? FLAT : c.c > c.o ? UP : DOWN;
              const cx = x0(i) + slot / 2;
              const bodyTop = y(Math.max(c.o, c.c));
              const bodyH = Math.max(y(Math.min(c.o, c.c)) - bodyTop, 0.6);
              return (
                <g key={c.date}>
                  <line x1={cx} x2={cx} y1={y(c.h)} y2={y(c.l)} stroke={color} vectorEffect="non-scaling-stroke" />
                  <rect x={cx - slot * 0.32} width={slot * 0.64} y={bodyTop} height={bodyH} fill={color} rx={0.3} />
                </g>
              );
            })}
            {maPath && <polyline points={maPath} fill="none" stroke="var(--color-topic)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
            {candles.map((c, i) => (
              <rect key={c.date} x={x0(i)} y={0} width={slot} height={H} fill="transparent" onMouseEnter={() => setSel(i)} onClick={() => setSel(i)} />
            ))}
          </svg>

          {/* Volume pane */}
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mt-1 block h-12 w-full" aria-hidden>
            {candles.map((c, i) => {
              const v = c.solved + c.revised + c.topics;
              const h = (v / maxVol) * 28;
              return (
                <rect
                  key={c.date}
                  x={x0(i) + slot * 0.18}
                  width={slot * 0.64}
                  y={30 - h}
                  height={h}
                  fill={c.c === c.o ? FLAT : c.c > c.o ? UP : DOWN}
                  opacity={sel === i ? 0.9 : 0.4}
                />
              );
            })}
          </svg>

          <div className="mt-1 flex font-mono text-[10px] text-muted">
            {Array.from({ length: n }, (_, i) => {
              const c = candles[i];
              const show = c && (i === candles.length - 1 || (i % 7 === 0 && candles.length - 1 - i >= 4));
              return (
                <span key={i} className="flex min-w-0 flex-1 justify-center overflow-visible whitespace-nowrap">
                  {show ? formatDate(c.date, { day: "numeric", month: "short" }) : ""}
                </span>
              );
            })}
          </div>
        </div>

        {/* Price axis */}
        <div className="relative h-48 w-12 shrink-0 font-mono text-[10px] text-muted sm:h-56">
          {axisTicks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: `${(y(t) / H) * 100}%` }}>
              {t.toFixed(1)}
            </span>
          ))}
          <span
            className="absolute right-0 -translate-y-1/2 rounded px-1 py-0.5 font-semibold text-black"
            style={{ top: `${(y(last.c) / H) * 100}%`, background: tone }}
          >
            {last.c.toFixed(1)}
          </span>
        </div>
      </div>

      <p className="border-t border-line px-4 py-2 text-[11px] text-muted sm:px-5">
        Hit your daily target and the index closes green; skip a day and it bleeds red. Volume = questions solved + revised + topics.
      </p>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="text-right">
      <dt className="text-[10px] text-muted">{k}</dt>
      <dd className="font-semibold tabular-nums">{v}</dd>
    </div>
  );
}
