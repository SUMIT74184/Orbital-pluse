import { CountUp } from "./Reveal";

// Deterministic pseudo-random so server and client render the same art.
const rand = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const ellipse = (rx: number, ry: number) => `M ${-rx} 0 a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;

/** The logo, blown up: a pulsing core with DSA, System Design and SQL orbiting it. */
export function OrbitHero() {
  const orbits = [
    { rx: 172, ry: 62, tilt: -28, dur: 16, color: "var(--color-new)", label: "DSA", r: 9, begin: 0 },
    { rx: 138, ry: 52, tilt: 30, dur: 12, color: "var(--color-rev)", label: "System Design", r: 7, begin: -4 },
    { rx: 100, ry: 100, tilt: 0, dur: 9, color: "var(--color-topic)", label: "SQL", r: 6, begin: -2 },
  ];
  return (
    <svg viewBox="0 0 400 400" className="w-full max-w-md" aria-hidden>
      <defs>
        <radialGradient id="core-glow">
          <stop offset="0%" stopColor="#22e584" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#22e584" stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: 34 }, (_, i) => (
        <circle
          key={i}
          cx={rand(i) * 400}
          cy={rand(i + 100) * 400}
          r={rand(i + 200) * 1.3 + 0.4}
          className="twinkle fill-ink"
          style={{ animationDelay: `${(rand(i + 300) * 4).toFixed(2)}s` }}
        />
      ))}
      <circle cx="200" cy="200" r="120" fill="url(#core-glow)" />
      {orbits.map((o) => (
        <g key={o.label} transform={`translate(200 200) rotate(${o.tilt})`}>
          <path d={ellipse(o.rx, o.ry)} fill="none" stroke={o.color} strokeOpacity="0.28" strokeWidth="1.5" strokeDasharray={o.ry === o.rx ? "3 6" : undefined} />
          <g>
            <animateMotion dur={`${o.dur}s`} begin={`${o.begin}s`} repeatCount="indefinite" path={ellipse(o.rx, o.ry)} />
            <circle r={o.r * 2.2} fill={o.color} opacity="0.18" />
            <circle r={o.r} fill={o.color} />
            <g transform={`rotate(${-o.tilt})`}>
              <text y={-o.r - 8} textAnchor="middle" className="fill-ink font-mono" fontSize="11" opacity="0.85">
                {o.label}
              </text>
            </g>
          </g>
        </g>
      ))}
      <circle cx="200" cy="200" r="34" className="core-ring fill-none stroke-pulse" strokeWidth="2" />
      <circle cx="200" cy="200" r="34" className="core-ring fill-none stroke-pulse" strokeWidth="2" style={{ animationDelay: "1.4s" }} />
      <circle cx="200" cy="200" r="34" className="fill-pulse" style={{ filter: "drop-shadow(0 0 18px rgb(34 229 132 / 0.8))" }} />
      <path d="M200 182v36M182 200h36" className="stroke-bg" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

const TODAY = [
  { kind: "NEW", cls: "text-new border-new/40 bg-new/10", title: "Two Sum", meta: "Easy", metaCls: "text-easy" },
  { kind: "NEW", cls: "text-new border-new/40 bg-new/10", title: "Longest Substring Without Repeating", meta: "Medium", metaCls: "text-medium" },
  { kind: "NEW", cls: "text-new border-new/40 bg-new/10", title: "Merge Intervals", meta: "Medium", metaCls: "text-medium" },
  { kind: "REVISE", cls: "text-rev border-rev/40 bg-rev/10", title: "Valid Parentheses", meta: "day 4", metaCls: "text-muted" },
  { kind: "TOPIC", cls: "text-topic border-topic/40 bg-topic/10", title: "Consistent hashing", meta: "System Design", metaCls: "text-muted" },
  { kind: "TOPIC", cls: "text-topic border-topic/40 bg-topic/10", title: "Window functions", meta: "MySQL", metaCls: "text-muted" },
];

/** A looping mock of the dashboard's Today list: items tick off one by one, then the day completes. */
export function TodayCard() {
  const at = (i: number) => 8 + i * 10; // % of the cycle when item i gets checked
  const done = at(TODAY.length);
  const css =
    TODAY.map(
      (_, i) =>
        `@keyframes chk-${i}{0%,${at(i)}%{--on:0}${at(i) + 3}%,88%{--on:1}94%,100%{--on:0}}`,
    ).join("") +
    `@keyframes bar{0%,${at(0)}%{width:0}${TODAY.map((_, i) => `${at(i) + 3}%{width:${(((i + 1) / TODAY.length) * 100).toFixed(1)}%}`).join("")}88%{width:100%}94%,100%{width:0}}` +
    `@keyframes done{0%,${done}%{opacity:0;transform:translateY(6px) scale(.95)}${done + 3}%,88%{opacity:1;transform:none}94%,100%{opacity:0}}`;
  return (
    <div className="card relative overflow-hidden p-5 shadow-[0_30px_80px_-40px_rgb(34_229_132/0.45)]">
      <style>{css}</style>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Today · Tue</p>
          <p className="mt-1 font-semibold">Your daily set</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-topic/30 bg-topic/10 px-2.5 py-1 text-xs font-medium text-topic">
          <Flame /> 23-day streak
        </span>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-panel-2">
        <div className="today-anim h-full rounded-full bg-pulse shadow-[0_0_12px_rgb(34_229_132/0.8)]" style={{ animationName: "bar" }} />
      </div>
      <ul className="mt-4 space-y-2">
        {TODAY.map((t, i) => (
          <li key={i} className="today-anim today-item flex items-center gap-3 rounded-lg border border-line bg-panel-2/60 px-3 py-2.5" style={{ animationName: `chk-${i}` }}>
            <span className="today-box grid size-5 shrink-0 place-items-center rounded-md border">
              <svg viewBox="0 0 16 16" className="size-3.5">
                <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="today-tick" />
              </svg>
            </span>
            <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${t.cls}`}>{t.kind}</span>
            <span className="today-title min-w-0 flex-1 truncate text-sm">{t.title}</span>
            <span className={`hidden text-xs sm:inline ${t.metaCls}`}>{t.meta}</span>
          </li>
        ))}
      </ul>
      <div className="today-anim pointer-events-none absolute inset-x-0 bottom-4 flex justify-center" style={{ animationName: "done" }}>
        <span className="rounded-full bg-pulse px-4 py-2 text-sm font-semibold text-black shadow-[0_0_30px_rgb(34_229_132/0.7)]">
          Day complete · streak 24 🔥
        </span>
      </div>
    </div>
  );
}

export function Flame({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} flame`} fill="currentColor" aria-hidden>
      <path d="M12 2c1 3.5 5 5.6 5 10.5A5 5 0 0 1 12 18a5 5 0 0 1-5-5.2c0-2 .9-3.4 2-4.5.2 1.6 1 2.6 2 3-.4-3.3.3-6.2 1-9.3Z" />
      <path d="M12 22a3.5 3.5 0 0 1-3.5-3.5c0-1.6 1.2-2.6 2.2-3.6.3 1 .8 1.6 1.6 1.9.1-1.2.5-2 1.1-2.8.9 1 2.1 2.3 2.1 4.5A3.5 3.5 0 0 1 12 22Z" opacity=".55" />
    </svg>
  );
}

/** A contribution-style grid that gets denser to the right: the habit forming. Cells pop in when scrolled into view. */
export function StreakGrid() {
  const cols = 26;
  const levels = ["bg-panel-2", "bg-pulse/25", "bg-pulse/45", "bg-pulse/70", "bg-pulse"];
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-[3px] sm:gap-1">
        {Array.from({ length: cols * 7 }, (_, i) => {
          const col = Math.floor(i / 7);
          const row = i % 7;
          const momentum = col / cols; // later weeks are busier
          const r = rand(i + 7);
          const isToday = col === cols - 1 && row === 3;
          const future = col === cols - 1 && row > 3;
          let lvl = r < 0.55 - momentum * 0.6 ? 0 : Math.min(4, Math.floor(r * 2 + momentum * 3));
          if (col >= cols - 4 && !future) lvl = Math.max(lvl, 2); // the current streak
          return (
            <span
              key={i}
              className={`heat-cell on-reveal aspect-square rounded-[3px] ${future ? "border border-dashed border-line" : levels[lvl]} ${isToday ? "today-cell" : ""}`}
              style={{ animationDelay: `${col * 35 + row * 12}ms` }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-muted">
        <span>6 months ago</span>
        <span className="flex items-center gap-1">
          less {levels.map((l) => <span key={l} className={`size-2.5 rounded-[2px] ${l}`} />)} more
        </span>
      </div>
    </div>
  );
}

const CANDLES = (() => {
  let price = 40;
  return Array.from({ length: 18 }, (_, i) => {
    const up = rand(i + 50) > (i < 5 ? 0.5 : 0.22);
    const move = 3 + rand(i + 80) * 6;
    const o = price;
    const c = up ? o + move : o - move * 0.7;
    price = c;
    return { o, c, h: Math.max(o, c) + 2 + rand(i) * 3, l: Math.min(o, c) - 2 - rand(i + 9) * 3, up };
  });
})();

/** A tiny $DSAX chart: candles grow in, mostly green, because showing up compounds. */
export function MiniMarket() {
  const candles = CANDLES;
  const max = Math.max(...candles.map((c) => c.h));
  const min = Math.min(...candles.map((c) => c.l));
  const y = (v: number) => 90 - ((v - min) / (max - min)) * 80;
  const gain = ((candles.at(-1)!.c - candles[0].o) / candles[0].o) * 100;
  return (
    <div className="card p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-xs text-muted">$DSAX · your prep index</span>
        <span className="font-mono text-sm font-semibold text-pulse">▲ <CountUp to={Math.round(gain)} suffix="%" /></span>
      </div>
      <svg viewBox="0 0 180 100" className="mt-2 w-full" aria-hidden>
        {candles.map((c, i) => (
          <g key={i} className="candle on-reveal" style={{ animationDelay: `${i * 70}ms`, transformOrigin: `${i * 10 + 5}px ${y(c.o)}px` }}>
            <line x1={i * 10 + 5} x2={i * 10 + 5} y1={y(c.h)} y2={y(c.l)} stroke={c.up ? "#22e584" : "#ff5c6c"} strokeWidth="1" />
            <rect x={i * 10 + 2} width="6" y={y(Math.max(c.o, c.c))} height={Math.max(1.5, Math.abs(y(c.o) - y(c.c)))} rx="1" fill={c.up ? "#22e584" : "#ff5c6c"} />
          </g>
        ))}
      </svg>
      <p className="mt-1 text-xs text-muted">Hit your target, the candle closes green. Skip a day, it bleeds red.</p>
    </div>
  );
}

/**
 * Forgetting curves: without revision memory decays fast; each scheduled revisit resets it and the next decay is slower.
 */
export function RevisionCurve({ days }: { days: number[] }) {
  const span = days.at(-1)! + 4;
  const W = 600;
  const H = 190;
  const x = (d: number) => 20 + (d / span) * (W - 40);
  const y = (r: number) => 30 + (1 - r) * (H - 60);
  const reviews = [0, ...days];
  const pts: string[] = [];
  reviews.forEach((d, k) => {
    const next = reviews[k + 1] ?? span;
    const s = 1.1 * Math.pow(1.9, k); // stability grows with every revisit
    for (let t = d; t <= next; t += 0.2) pts.push(`${x(t).toFixed(1)},${y(Math.exp(-(t - d) / s) * 0.9 + 0.1).toFixed(1)}`);
  });
  const naive = Array.from({ length: Math.ceil(span / 0.2) + 1 }, (_, i) => i * 0.2).map(
    (t) => `${x(t).toFixed(1)},${y(Math.exp(-t / 1.1) * 0.9 + 0.1).toFixed(1)}`,
  );
  const drawSec = 3.2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <line key={r} x1="20" x2={W - 20} y1={y(r)} y2={y(r)} className="stroke-line" strokeDasharray="2 6" />
      ))}
      <polyline points={naive.join(" ")} fill="none" stroke="#ff6b6b" strokeOpacity="0.55" strokeWidth="1.8" strokeDasharray="5 5" />
      <text x={x(3.2)} y={y(0.12) - 8} className="fill-hard font-mono" fontSize="11" opacity="0.8">
        solve once & forget
      </text>
      <polyline
        points={pts.join(" ")}
        pathLength={1}
        fill="none"
        className="draw-line on-reveal stroke-pulse"
        strokeWidth="2.5"
        strokeLinejoin="round"
        style={{ animationDuration: `${drawSec}s`, filter: "drop-shadow(0 0 6px rgb(34 229 132 / 0.6))" }}
      />
      {days.map((d) => (
        <g key={d}>
          <circle cx={x(d)} cy={y(1)} r="4" className="node-pop on-reveal fill-pulse" style={{ animationDelay: `${((d / span) * drawSec).toFixed(2)}s` }} />
          <text x={x(d)} y={H - 6} textAnchor="middle" className="fill-muted font-mono" fontSize="11">
            D{d}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Stock-ticker style marquee of every pattern and its question count. */
export function Ticker({ items }: { items: { label: string; value: string }[] }) {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center gap-8 pr-8" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs">
          <span className="text-ink/80 uppercase">{it.label}</span>
          <span className="text-pulse">▲ {it.value}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee-mask relative overflow-hidden border-y border-line bg-panel/60 py-3">
      <div className="marquee flex w-max">
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
