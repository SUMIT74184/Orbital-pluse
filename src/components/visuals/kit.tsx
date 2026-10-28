"use client";

import { useId } from "react";

/*
 * Building blocks for the topic diagrams (see QAVisuals for the registry).
 * Box diagrams are laid out by hand on a small grid; edges are clipped to box borders
 * and use UML arrowheads, so the same legend (see "uml-arrows") reads everywhere.
 * `flow` edges are requests or data moving; `async` edges are the same but queued / later.
 */

export type Kind = "inherit" | "realize" | "assoc" | "depend" | "aggregate" | "compose" | "flow" | "async" | "line";
/** `db` draws a cylinder (a store), `diamond` a flowchart decision, `pill` a start / end or actor. `h` overrides the height. */
export type Node = { id: string; x: number; y: number; w: number; h?: number; title: string; stereo?: string; lines?: string[]; tone?: Tone; shape?: "db" | "diamond" | "pill" };
export type Edge = { from: string; to: string; kind: Kind; label?: string };
export type Tone = "topic" | "new" | "rev" | "pulse" | "hard" | "muted" | "easy";

export const TONE: Record<Tone, string> = {
  topic: "var(--color-topic)",
  new: "var(--color-new)",
  rev: "var(--color-rev)",
  pulse: "var(--color-pulse)",
  hard: "var(--color-hard)",
  muted: "var(--color-muted)",
  easy: "var(--color-easy)",
};

export const HEAD = 22;
export const LINE = 15;
export const boxH = (n: Node) => n.h ?? (n.shape === "db" ? 10 : 0) + HEAD + (n.stereo ? 11 : 0) + (n.lines?.length ? n.lines.length * LINE + 8 : 0);

/** Where the segment from the box centre towards (tx, ty) leaves the box. */
export function clip(n: Node, tx: number, ty: number) {
  const h = boxH(n);
  const cx = n.x + n.w / 2;
  const cy = n.y + h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (!dx && !dy) return { x: cx, y: cy };
  if (n.shape === "diamond") {
    const k = 1 / (Math.abs(dx) / (n.w / 2) + Math.abs(dy) / (h / 2));
    return { x: cx + dx * k, y: cy + dy * k };
  }
  const s = Math.min(dx ? n.w / 2 / Math.abs(dx) : Infinity, dy ? h / 2 / Math.abs(dy) : Infinity);
  return { x: cx + dx * s, y: cy + dy * s };
}

export function Markers({ p }: { p: string }) {
  const stroke = "var(--color-muted)";
  return (
    <defs>
      <marker id={`${p}-tri`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
        <path d="M1 1 L11 6 L1 11 Z" fill="var(--color-panel)" stroke={stroke} strokeWidth="1.2" />
      </marker>
      <marker id={`${p}-open`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
        <path d="M1 1 L11 6 L1 11" fill="none" stroke={stroke} strokeWidth="1.4" />
      </marker>
      <marker id={`${p}-dia`} viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
        <path d="M1 5 L8 1 L15 5 L8 9 Z" fill="var(--color-panel)" stroke={stroke} strokeWidth="1.2" />
      </marker>
      <marker id={`${p}-dia-f`} viewBox="0 0 16 10" refX="15" refY="5" markerWidth="16" markerHeight="10" orient="auto-start-reverse" markerUnits="userSpaceOnUse">
        <path d="M1 5 L8 1 L15 5 L8 9 Z" fill={stroke} stroke={stroke} strokeWidth="1.2" />
      </marker>
    </defs>
  );
}

export function EdgeLine({ p, a, b, kind, label }: { p: string; a: { x: number; y: number }; b: { x: number; y: number }; kind: Kind; label?: string }) {
  // Labels sit above a mostly-horizontal edge and beside a mostly-vertical one.
  const flat = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y);
  const dashed = kind === "realize" || kind === "depend" || kind === "async";
  // Diamonds sit on the owner (the edge's `from` end); arrowheads on the target.
  const start = kind === "aggregate" ? `url(#${p}-dia)` : kind === "compose" ? `url(#${p}-dia-f)` : undefined;
  const end = kind === "inherit" || kind === "realize" ? `url(#${p}-tri)` : kind === "assoc" || kind === "depend" || kind === "flow" || kind === "async" ? `url(#${p}-open)` : undefined;
  return (
    <g>
      <line
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke={kind === "flow" || kind === "async" ? "var(--color-topic)" : "var(--color-muted)"}
        strokeWidth="1.3"
        strokeDasharray={dashed ? "5 4" : undefined}
        markerStart={start}
        markerEnd={end}
      />
      {label && (
        <text
          x={(a.x + b.x) / 2 + (flat ? 0 : 6)}
          y={(a.y + b.y) / 2 + (flat ? -6 : 4)}
          textAnchor={flat ? "middle" : "start"}
          fontSize="10.5" fill="var(--color-muted)" stroke="var(--color-bg)" strokeWidth="3" paintOrder="stroke" className="font-mono">
          {label}
        </text>
      )}
    </g>
  );
}

export function Box({ n }: { n: Node }) {
  const h = boxH(n);
  const color = TONE[n.tone ?? "new"];
  const text = HEAD + (n.lines?.length ? n.lines.length * LINE + (n.shape ? 0 : 8) : 0);
  const top = n.h ? (n.h - text) / 2 : (n.stereo ? 11 : 0) + (n.shape === "db" ? 8 : 0);
  const outline =
    n.shape === "diamond" ? (
      <polygon points={`${n.x + n.w / 2},${n.y} ${n.x + n.w},${n.y + h / 2} ${n.x + n.w / 2},${n.y + h} ${n.x},${n.y + h / 2}`} fill="var(--color-panel)" stroke={color} strokeWidth="1.3" />
    ) : n.shape === "db" ? (
      <>
        <path d={`M${n.x} ${n.y + 6} V${n.y + h - 6} A${n.w / 2} 6 0 0 0 ${n.x + n.w} ${n.y + h - 6} V${n.y + 6}`} fill="var(--color-panel)" stroke={color} strokeWidth="1.3" />
        <ellipse cx={n.x + n.w / 2} cy={n.y + 6} rx={n.w / 2} ry="6" fill="var(--color-panel)" stroke={color} strokeWidth="1.3" />
      </>
    ) : (
      <rect x={n.x} y={n.y} width={n.w} height={h} rx={n.shape === "pill" ? h / 2 : 6} fill="var(--color-panel)" stroke={color} strokeWidth="1.3" />
    );
  return (
    <g>
      {outline}
      {n.stereo && (
        <text x={n.x + n.w / 2} y={n.y + 12} textAnchor="middle" fontSize="9.5" fill="var(--color-muted)" className="font-mono">
          «{n.stereo}»
        </text>
      )}
      <text x={n.x + n.w / 2} y={n.y + top + 15} textAnchor="middle" fontSize="12" fontWeight="600" fill={color}>
        {n.title}
      </text>
      {n.lines?.length ? (
        <>
          {!n.shape && <line x1={n.x} x2={n.x + n.w} y1={n.y + top + HEAD} y2={n.y + top + HEAD} stroke="var(--color-line)" />}
          {n.lines.map((l, i) => (
            <text
              key={i}
              x={n.shape ? n.x + n.w / 2 : n.x + 8}
              y={n.y + top + HEAD + (n.shape ? 8 : 14) + i * LINE}
              textAnchor={n.shape ? "middle" : undefined}
              fontSize="10.5"
              fill="var(--color-ink)"
              className="font-mono"
            >
              {l}
            </text>
          ))}
        </>
      ) : null}
    </g>
  );
}

export function ClassDiagram({ nodes, edges, width, height, caption }: { nodes: Node[]; edges: Edge[]; width: number; height: number; caption?: string }) {
  const p = useId().replace(/:/g, "");
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const centre = (n: Node) => ({ x: n.x + n.w / 2, y: n.y + boxH(n) / 2 });
  return (
    <Figure caption={caption}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={caption}>
        <Markers p={p} />
        {edges.map((e, i) => {
          const f = byId.get(e.from)!;
          const t = byId.get(e.to)!;
          const fc = centre(f);
          const tc = centre(t);
          const a = clip(f, tc.x, tc.y);
          const b = clip(t, fc.x, fc.y);
          // A pair of opposite edges (a → b and b → a) is drawn side by side instead of on top of each other.
          if (edges.some((o) => o.from === e.to && o.to === e.from)) {
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
            const nx = (-(b.y - a.y) / len) * 7;
            const ny = ((b.x - a.x) / len) * 7;
            return <EdgeLine key={i} p={p} a={{ x: a.x + nx, y: a.y + ny }} b={{ x: b.x + nx, y: b.y + ny }} kind={e.kind} label={e.label} />;
          }
          return <EdgeLine key={i} p={p} a={a} b={b} kind={e.kind} label={e.label} />;
        })}
        {nodes.map((n) => (
          <Box key={n.id} n={n} />
        ))}
      </svg>
    </Figure>
  );
}

export function Figure({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <figure className="rounded-lg border border-line bg-bg/60 p-3">
      {children}
      {caption && <figcaption className="mt-2 text-center text-[11px] text-muted">{caption}</figcaption>}
    </figure>
  );
}

/** A row of labelled steps joined by arrows: flows, lifecycles and state machines. */
export function Steps({ steps, caption, loop }: { steps: { label: string; note?: string; tone?: Tone }[]; caption?: string; loop?: string }) {
  return (
    <Figure caption={caption}>
      <ol className="flex flex-wrap items-stretch justify-center gap-y-2 text-xs">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center">
            {i > 0 && <span className="px-1.5 text-muted">→</span>}
            <div className="rounded-md border px-2.5 py-1.5 text-center" style={{ borderColor: TONE[s.tone ?? "topic"] }}>
              <div className="font-medium" style={{ color: TONE[s.tone ?? "topic"] }}>
                {s.label}
              </div>
              {s.note && <div className="mt-0.5 text-[10.5px] text-muted">{s.note}</div>}
            </div>
          </li>
        ))}
      </ol>
      {loop && <p className="mt-2 text-center font-mono text-[10.5px] text-muted">↺ {loop}</p>}
    </Figure>
  );
}


/** Small relational tables side by side, e.g. a table before and after normalization. `mark` highlights cells as "r,c". */
export function Tables({
  tables,
  caption,
  between,
}: {
  tables: { name: string; head: string[]; rows: string[][]; tone?: Tone; mark?: string[]; note?: string; key?: number[] }[];
  caption?: string;
  /** Text shown between consecutive tables, e.g. "⋈" or "→ split →". */
  between?: string;
}) {
  return (
    <Figure caption={caption}>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tables.map((t, ti) => (
          <div key={ti} className="flex items-center gap-3">
            {ti > 0 && between && <span className="font-mono text-xs text-muted">{between}</span>}
            <div>
              <div className="mb-1 text-[11px] font-semibold" style={{ color: TONE[t.tone ?? "new"] }}>
                {t.name}
              </div>
              <table className="border-collapse font-mono text-[10.5px]">
                <thead>
                  <tr>
                    {t.head.map((h, i) => (
                      <th
                        key={i}
                        className={`border border-line bg-panel-2 px-2 py-1 text-left font-medium ${t.key?.includes(i) ? "underline decoration-topic underline-offset-2" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r, ri) => (
                    <tr key={ri}>
                      {r.map((c, ci) => {
                        const hit = t.mark?.includes(`${ri},${ci}`) || t.mark?.includes(`${ri},*`);
                        return (
                          <td key={ci} className={`border border-line px-2 py-1 ${hit ? "bg-hard/15 text-hard" : "text-ink/90"}`}>
                            {c}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {t.note && <div className="mt-1 max-w-[15rem] text-[10.5px] text-muted">{t.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </Figure>
  );
}

/** Operations over time, one column per actor (transactions, nodes, threads). A cell with ✗ is a problem, ✓ a success. */
export function Timeline({ cols, rows, caption, time = "time" }: { cols: { name: string; tone?: Tone }[]; rows: string[][]; caption?: string; time?: string }) {
  return (
    <Figure caption={caption}>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-1 text-xs">
          <thead>
            <tr className="text-muted">
              <th className="w-10 text-left font-normal">{time}</th>
              {cols.map((c) => (
                <th key={c.name} className="text-left font-medium" style={{ color: TONE[c.tone ?? "new"] }}>
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="font-mono text-muted">t{i + 1}</td>
                {cols.map((c, ci) => {
                  const v = r[ci] ?? "";
                  const tone = v.includes("✗") ? "var(--color-hard)" : v.includes("✓") ? "var(--color-easy)" : `color-mix(in oklab, ${TONE[c.tone ?? "new"]} 50%, transparent)`;
                  return (
                    <td key={ci} className={v ? "rounded border px-2 py-1 font-mono" : ""} style={v ? { borderColor: tone, color: v.includes("✗") ? "var(--color-hard)" : undefined } : undefined}>
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}

/** Stacked layers, top to bottom: architectures, levels of abstraction, the path of a request. */
export function Layers({ layers, caption }: { layers: { label: string; note?: string; tone?: Tone; side?: string }[]; caption?: string }) {
  const sides = layers.some((l) => l.side);
  return (
    <Figure caption={caption}>
      <div className="mx-auto max-w-xl space-y-1.5">
        {layers.map((l, i) => (
          <div key={i} className="flex items-stretch gap-2">
            <div className="flex-1 rounded-md border px-3 py-1.5" style={{ borderColor: TONE[l.tone ?? "topic"] }}>
              <div className="text-xs font-semibold" style={{ color: TONE[l.tone ?? "topic"] }}>
                {l.label}
              </div>
              {l.note && <div className="text-[11px] text-muted">{l.note}</div>}
            </div>
            {sides && <div className="flex w-28 shrink-0 items-center text-[10.5px] text-muted sm:w-40">{l.side}</div>}
          </div>
        ))}
      </div>
    </Figure>
  );
}

/** Horizontal bars for one measure. `log` spaces the bars by order of magnitude (latencies). */
export function Bars({ rows, caption, log }: { rows: { label: string; value: number; shown: string; tone?: Tone }[]; caption?: string; log?: boolean }) {
  const f = (v: number) => (log ? Math.log10(v) : v);
  const lo = log ? Math.min(...rows.map((r) => f(r.value))) - 0.6 : 0;
  const hi = Math.max(...rows.map((r) => f(r.value)));
  return (
    <Figure caption={caption}>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[minmax(7rem,11rem)_1fr_4.5rem] items-center gap-2 text-[11px]" title={`${r.label}: ${r.shown}`}>
            <span className="truncate text-ink/90">{r.label}</span>
            <div className="h-2.5 rounded-r bg-panel-2">
              <div className="h-full rounded-r" style={{ width: `${Math.max(2, ((f(r.value) - lo) / (hi - lo)) * 100)}%`, background: TONE[r.tone ?? "topic"] }} />
            </div>
            <span className="text-right font-mono text-muted">{r.shown}</span>
          </div>
        ))}
      </div>
    </Figure>
  );
}

/** A grid of small labelled cards: kinds of something, each with a one-line idea and an optional snippet. */
export function Cards({ items, caption, cols = 2 }: { items: { title: string; idea: string; code?: string; tone?: Tone }[]; caption?: string; cols?: 2 | 3 | 4 }) {
  const grid = cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <Figure caption={caption}>
      <div className={`grid grid-cols-1 gap-2 ${grid}`}>
        {items.map((it) => (
          <div key={it.title} className="rounded-md border p-2.5" style={{ borderColor: TONE[it.tone ?? "topic"] }}>
            <div className="text-xs font-semibold" style={{ color: TONE[it.tone ?? "topic"] }}>
              {it.title}
            </div>
            <div className="mt-0.5 text-[11px] text-muted">{it.idea}</div>
            {it.code && <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[10.5px] text-ink/85">{it.code}</pre>}
          </div>
        ))}
      </div>
    </Figure>
  );
}
