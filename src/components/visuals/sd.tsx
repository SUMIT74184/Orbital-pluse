"use client";

import { Bars, Cards, ClassDiagram, Figure, Layers, Steps, Tables, Timeline } from "./kit";

/* Diagrams for the System Design track, named from src/data/guides/sd.ts. */

/** Servers and keys placed on a hash ring; each key belongs to the next server clockwise. */
function HashRing() {
  const cx = 150;
  const cy = 100;
  const r = 72;
  const at = (deg: number, rr = r) => ({ x: cx + rr * Math.sin((deg * Math.PI) / 180), y: cy - rr * Math.cos((deg * Math.PI) / 180) });
  const servers = [
    { name: "A", deg: 20 },
    { name: "B", deg: 140 },
    { name: "C", deg: 250 },
  ];
  const keys = [
    { name: "k1", deg: 340, owner: "A" },
    { name: "k2", deg: 80, owner: "B" },
    { name: "k3", deg: 200, owner: "C" },
    { name: "k4", deg: 120, owner: "B" },
  ];
  return (
    <Figure caption="Consistent hashing: hash servers and keys onto the same ring; a key belongs to the first server clockwise. Adding server D between B and C only moves the keys in that one arc">
      <svg viewBox="0 0 520 200" className="h-auto w-full" role="img" aria-label="Consistent hash ring">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-line)" strokeWidth="6" />
        <path d={`M ${at(140).x} ${at(140).y} A ${r} ${r} 0 0 1 ${at(195).x} ${at(195).y}`} fill="none" stroke="var(--color-rev)" strokeWidth="6" strokeOpacity="0.55" />
        {servers.map((s) => {
          const p = at(s.deg);
          return (
            <g key={s.name}>
              <rect x={p.x - 11} y={p.y - 11} width="22" height="22" rx="4" fill="var(--color-panel)" stroke="var(--color-topic)" strokeWidth="1.5" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-topic)">
                {s.name}
              </text>
            </g>
          );
        })}
        {keys.map((k) => {
          const p = at(k.deg);
          const l = at(k.deg, r - 20);
          return (
            <g key={k.name}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--color-new)" />
              <text x={l.x} y={l.y + 4} textAnchor="middle" fontSize="10" fill="var(--color-new)" className="font-mono">
                {k.name}
              </text>
            </g>
          );
        })}
        {(() => {
          const p = at(195);
          return (
            <g>
              <rect x={p.x - 11} y={p.y - 11} width="22" height="22" rx="4" fill="var(--color-panel)" stroke="var(--color-rev)" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--color-rev)">
                D
              </text>
            </g>
          );
        })()}
        <g fontSize="10.5" fill="var(--color-ink)">
          <text x="290" y="20" fill="var(--color-muted)">■ server   ● key</text>
          <text x="290" y="40">k1 → A, k2 → B, k4 → B, k3 → C</text>
          <text x="290" y="64" fill="var(--color-rev)">add D: only k3 moves (C → D)</text>
          <text x="290" y="88" fill="var(--color-muted)">with hash % N, adding one server</text>
          <text x="290" y="104" fill="var(--color-muted)">moves almost every key</text>
          <text x="290" y="136" fill="var(--color-topic)">virtual nodes: each server sits</text>
          <text x="290" y="152" fill="var(--color-topic)">at ~100 points, so load evens out</text>
        </g>
      </svg>
    </Figure>
  );
}

/** Snowflake's 64-bit ID layout. */
function Snowflake() {
  const parts = [
    { bits: 1, label: "sign", note: "0", tone: "var(--color-muted)" },
    { bits: 41, label: "timestamp (ms since epoch)", note: "~69 years", tone: "var(--color-topic)" },
    { bits: 5, label: "DC", note: "32", tone: "var(--color-rev)" },
    { bits: 5, label: "machine", note: "32", tone: "var(--color-new)" },
    { bits: 12, label: "sequence", note: "4096 / ms", tone: "var(--color-pulse)" },
  ];
  // The sign bit gets a readable minimum width; the other 63 bits share the rest.
  const width = (bits: number) => (bits === 1 ? 30 : (bits / 63) * 470);
  let x = 10;
  return (
    <Figure caption="Snowflake ID: 64 bits, time first, so IDs sort by creation time. Each machine makes up to 4096 IDs per millisecond with no coordination">
      <svg viewBox="0 0 520 96" className="h-auto w-full" role="img" aria-label="Snowflake ID bit layout">
        {parts.map((p) => {
          const w = width(p.bits);
          const g = (
            <g key={p.label}>
              <rect x={x} y="14" width={w - 3} height="36" rx="4" fill={p.tone} fillOpacity="0.18" stroke={p.tone} />
              <text x={x + (w - 3) / 2} y="31" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={p.tone}>
                {p.bits} bit{p.bits > 1 ? "s" : ""}
              </text>
              <text x={x + (w - 3) / 2} y="44" textAnchor="middle" fontSize="9.5" fill="var(--color-muted)">
                {p.note}
              </text>
              <text x={x + (w - 3) / 2} y="68" textAnchor="middle" fontSize="10" fill="var(--color-ink)">
                {p.label}
              </text>
            </g>
          );
          x += w;
          return g;
        })}
        <text x="10" y="90" fontSize="10" fill="var(--color-muted)" className="font-mono">
          id = (ts − epoch) &lt;&lt; 22 | dc &lt;&lt; 17 | machine &lt;&lt; 12 | seq
        </text>
      </svg>
    </Figure>
  );
}

/** A Bloom filter's bit array with the bits two items set. */
function BloomBits() {
  const set = new Map<number, string>([
    [1, "new"],
    [4, "new"],
    [9, "new"],
    [3, "rev"],
    [7, "rev"],
  ]);
  return (
    <Figure caption="Bloom filter: each item sets k bits (here k = 3). To check an item, look at its k bits: any 0 → definitely not present; all 1 → probably present (they may have been set by others)">
      <svg viewBox="0 0 520 150" className="h-auto w-full" role="img" aria-label="Bloom filter bit array">
        {Array.from({ length: 12 }, (_, i) => {
          const tone = set.get(i);
          const x = 40 + i * 38;
          return (
            <g key={i}>
              <rect x={x} y="56" width="34" height="30" rx="3" fill={tone ? `var(--color-${tone})` : "var(--color-panel)"} fillOpacity={tone ? 0.25 : 1} stroke={tone ? `var(--color-${tone})` : "var(--color-line)"} />
              <text x={x + 17} y="76" textAnchor="middle" fontSize="12" fill="var(--color-ink)" className="font-mono">
                {tone ? 1 : 0}
              </text>
              <text x={x + 17} y="100" textAnchor="middle" fontSize="9" fill="var(--color-muted)">
                {i}
              </text>
            </g>
          );
        })}
        <text x="40" y="20" fontSize="10.5" fill="var(--color-new)">add(&quot;asha&quot;) → bits 1, 4, 9</text>
        <text x="40" y="38" fontSize="10.5" fill="var(--color-rev)">add(&quot;ravi&quot;) → bits 3, 7, 9</text>
        <text x="40" y="124" fontSize="10.5" fill="var(--color-ink)">check(&quot;meena&quot;) → bits 2, 4, 7 → bit 2 is 0 → definitely NOT seen</text>
        <text x="40" y="142" fontSize="10.5" fill="var(--color-hard)">check(&quot;arjun&quot;) → bits 3, 4, 9 → all 1 → &quot;maybe&quot; (a false positive)</text>
      </svg>
    </Figure>
  );
}

/** Geohash cells: a longer shared prefix means closer together. */
function GeoGrid() {
  const cells = ["tdr0", "tdr1", "tdr4", "tdr5", "tdr2", "tdr3", "tdr6", "tdr7", "tdr8", "tdr9", "tdrd", "tdre"];
  const near = new Set(["tdr1", "tdr4", "tdr5", "tdr3", "tdr6", "tdr7", "tdr9", "tdrd", "tdre"]);
  return (
    <Figure caption="Geohash splits the map into a grid; each cell has a string name, and nearby cells share a prefix. To find drivers near you, look in your cell plus its 8 neighbours">
      <svg viewBox="0 0 520 170" className="h-auto w-full" role="img" aria-label="Geohash grid">
        {cells.map((c, i) => {
          const x = 20 + (i % 4) * 66;
          const y = 10 + Math.floor(i / 4) * 50;
          const me = c === "tdr6";
          return (
            <g key={c}>
              <rect x={x} y={y} width="62" height="46" rx="3" fill={near.has(c) ? "var(--color-new)" : "var(--color-panel)"} fillOpacity={near.has(c) ? (me ? 0.4 : 0.15) : 1} stroke={me ? "var(--color-topic)" : "var(--color-line)"} strokeWidth={me ? 2 : 1} />
              <text x={x + 31} y={y + 27} textAnchor="middle" fontSize="11" fill="var(--color-ink)" className="font-mono">
                {c}
              </text>
            </g>
          );
        })}
        <circle cx={20 + 2 * 66 + 34} cy={10 + 50 + 32} r="4" fill="var(--color-topic)" />
        <g fontSize="10.5" fill="var(--color-ink)">
          <text x="300" y="30">length 4 ≈ 39 km × 20 km</text>
          <text x="300" y="50">length 6 ≈ 1.2 km × 0.6 km</text>
          <text x="300" y="70">length 8 ≈ 38 m × 19 m</text>
          <text x="300" y="104" fill="var(--color-topic)">● you (cell tdr6)</text>
          <text x="300" y="124" fill="var(--color-new)">shaded: search these 9 cells</text>
          <text x="300" y="144" fill="var(--color-muted)">WHERE geohash LIKE &apos;tdr6%&apos; …</text>
        </g>
      </svg>
    </Figure>
  );
}

/** A distributed trace as a waterfall of spans. */
function Spans() {
  const spans = [
    { name: "GET /checkout (gateway)", start: 0, dur: 420, depth: 0, tone: "var(--color-topic)" },
    { name: "auth-service", start: 10, dur: 40, depth: 1, tone: "var(--color-new)" },
    { name: "cart-service", start: 60, dur: 70, depth: 1, tone: "var(--color-new)" },
    { name: "pricing-service", start: 140, dur: 250, depth: 1, tone: "var(--color-hard)" },
    { name: "SELECT discounts (DB)", start: 150, dur: 220, depth: 2, tone: "var(--color-hard)" },
  ];
  const sx = (ms: number) => 170 + (ms / 420) * 330;
  return (
    <Figure caption="A trace: one request (trace id) made of spans, one per service call. The waterfall shows at a glance that a slow DB query inside pricing-service is eating 220 of the 420 ms">
      <svg viewBox="0 0 520 150" className="h-auto w-full" role="img" aria-label="Distributed trace waterfall">
        {spans.map((s, i) => (
          <g key={s.name}>
            <text x={10 + s.depth * 10} y={22 + i * 24} fontSize="10.5" fill="var(--color-ink)">
              {s.name}
            </text>
            <rect x={sx(s.start)} y={12 + i * 24} width={(s.dur / 420) * 330} height="14" rx="3" fill={s.tone} fillOpacity="0.3" stroke={s.tone} />
            <text x={sx(s.start + s.dur) + 4} y={23 + i * 24} fontSize="9.5" fill="var(--color-muted)" className="font-mono">
              {s.dur}ms
            </text>
          </g>
        ))}
        <text x="170" y="142" fontSize="10" fill="var(--color-muted)" className="font-mono">0 ms</text>
        <text x="470" y="142" fontSize="10" fill="var(--color-muted)" className="font-mono">420</text>
      </svg>
    </Figure>
  );
}

export const SD_DIAGRAMS: Record<string, () => React.ReactNode> = {
  "sd-framework": () => (
    <Steps
      caption="A repeatable plan for any design question. Say each step out loud so the interviewer can follow"
      steps={[
        { label: "Requirements", note: "functional + non-functional", tone: "new" },
        { label: "Estimates", note: "users, QPS, storage", tone: "new" },
        { label: "API", note: "main endpoints", tone: "topic" },
        { label: "Data model", note: "tables / keys", tone: "topic" },
        { label: "High-level design", note: "boxes + arrows", tone: "pulse" },
        { label: "Deep dive", note: "1–2 hard parts", tone: "rev" },
        { label: "Bottlenecks", note: "scale, failures, trade-offs", tone: "hard" },
      ]}
    />
  ),
  "sd-time": () => (
    <Bars
      caption="Roughly how to spend a 45-minute round (minutes). Most people spend too long on requirements and never reach the deep dive"
      rows={[
        { label: "Requirements & scope", value: 5, shown: "5 min", tone: "new" },
        { label: "Estimates", value: 3, shown: "3 min", tone: "new" },
        { label: "API + data model", value: 7, shown: "7 min", tone: "topic" },
        { label: "High-level design", value: 10, shown: "10 min", tone: "pulse" },
        { label: "Deep dives", value: 15, shown: "15 min", tone: "rev" },
        { label: "Wrap-up & trade-offs", value: 5, shown: "5 min", tone: "hard" },
      ]}
    />
  ),
  "scale-up-out": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="Vertical: buy a bigger machine (simple, but has a ceiling and is one point of failure). Horizontal: add more machines behind a load balancer — needs stateless servers, with sessions in a shared store"
      nodes={[
        { id: "big", x: 10, y: 40, w: 140, title: "1 big server", lines: ["64 cores, 512 GB", "↑ add more RAM"], tone: "rev" },
        { id: "lb", x: 220, y: 6, w: 110, title: "Load balancer", tone: "topic" },
        { id: "s1", x: 180, y: 76, w: 80, title: "app 1", tone: "new" },
        { id: "s2", x: 270, y: 76, w: 80, title: "app 2", tone: "new" },
        { id: "s3", x: 360, y: 76, w: 80, title: "app 3", tone: "new" },
        { id: "st", x: 270, y: 136, w: 160, title: "Redis: sessions", shape: "db", tone: "pulse" },
      ]}
      edges={[
        { from: "lb", to: "s1", kind: "flow" },
        { from: "lb", to: "s2", kind: "flow" },
        { from: "lb", to: "s3", kind: "flow" },
        { from: "s1", to: "st", kind: "async" },
        { from: "s3", to: "st", kind: "async" },
      ]}
    />
  ),
  "latency-numbers": () => (
    <Bars
      log
      caption="Latency numbers every engineer should know (log scale — each gridstep is 10× slower). Memory is ~1000× faster than SSD; a cross-continent round trip costs as much as millions of memory reads"
      rows={[
        { label: "L1 cache reference", value: 0.5, shown: "0.5 ns", tone: "easy" },
        { label: "Main memory read", value: 100, shown: "100 ns", tone: "easy" },
        { label: "Compress 1 KB", value: 2_000, shown: "2 µs", tone: "topic" },
        { label: "Read 1 MB from RAM", value: 10_000, shown: "10 µs", tone: "topic" },
        { label: "SSD random read", value: 100_000, shown: "100 µs", tone: "pulse" },
        { label: "Round trip, same DC", value: 500_000, shown: "0.5 ms", tone: "pulse" },
        { label: "Read 1 MB from SSD", value: 1_000_000, shown: "1 ms", tone: "pulse" },
        { label: "Disk seek (HDD)", value: 10_000_000, shown: "10 ms", tone: "hard" },
        { label: "Mumbai ↔ US round trip", value: 200_000_000, shown: "~200 ms", tone: "hard" },
      ]}
    />
  ),
  percentiles: () => (
    <Bars
      caption="Why averages lie: in 1,000 requests the average looks fine, but p99 shows 1 in 100 users waiting over a second. A page that makes 50 calls hits the p99 on most loads"
      rows={[
        { label: "p50 (median)", value: 80, shown: "80 ms", tone: "easy" },
        { label: "average", value: 120, shown: "120 ms", tone: "muted" },
        { label: "p90", value: 250, shown: "250 ms", tone: "topic" },
        { label: "p99", value: 1100, shown: "1.1 s", tone: "pulse" },
        { label: "p99.9", value: 2600, shown: "2.6 s", tone: "hard" },
      ]}
    />
  ),
  "cap-partition": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="A network partition splits two replicas. A write arrives at node 1. CP: refuse it (or the reads on node 2) to stay correct. AP: accept it and let node 2 serve the old value until the link heals"
      nodes={[
        { id: "c", x: 10, y: 60, w: 90, title: "Client", shape: "pill", tone: "muted" },
        { id: "n1", x: 160, y: 50, w: 120, title: "Node 1", lines: ["balance = 500"], tone: "new" },
        { id: "n2", x: 390, y: 50, w: 120, title: "Node 2", lines: ["balance = 1000"], tone: "rev" },
        { id: "cp", x: 120, y: 130, w: 170, title: "CP: reject → consistent", tone: "topic" },
        { id: "ap", x: 320, y: 130, w: 190, title: "AP: accept → available", tone: "pulse" },
      ]}
      edges={[
        { from: "c", to: "n1", kind: "flow", label: "write" },
        { from: "n1", to: "n2", kind: "async", label: "✗ cut" },
      ]}
    />
  ),
  pacelc: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="PACELC: if there's a Partition, choose Availability or Consistency; Else (normal times), choose Latency or Consistency"
      nodes={[
        { id: "q", x: 180, y: 6, w: 160, h: 54, title: "Partition?", shape: "diamond", tone: "pulse" },
        { id: "pa", x: 6, y: 110, w: 120, title: "PA: stay up", lines: ["Cassandra"], tone: "new" },
        { id: "pc", x: 136, y: 110, w: 120, title: "PC: stay right", lines: ["HBase, Spanner"], tone: "topic" },
        { id: "el", x: 266, y: 110, w: 120, title: "EL: be fast", lines: ["Dynamo, Cassandra"], tone: "new" },
        { id: "ec", x: 396, y: 110, w: 118, title: "EC: be right", lines: ["Spanner, BigTable"], tone: "topic" },
      ]}
      edges={[
        { from: "q", to: "pa", kind: "flow", label: "yes" },
        { from: "q", to: "pc", kind: "flow" },
        { from: "q", to: "el", kind: "flow", label: "no" },
        { from: "q", to: "ec", kind: "flow" },
      ]}
    />
  ),
  "consistency-spectrum": () => (
    <Layers
      caption="Consistency models from strongest (slowest, simplest to reason about) to weakest (fastest, most available)"
      layers={[
        { label: "Linearizable (strong)", note: "Acts like one copy; a read sees the latest completed write", tone: "topic", side: "bank balance, locks" },
        { label: "Sequential / causal", note: "Everyone sees cause before effect (question before its reply)", tone: "new", side: "comments, chat" },
        { label: "Read-your-writes", note: "You always see your own updates, others may lag", tone: "rev", side: "profile edits" },
        { label: "Eventual", note: "Replicas agree if writes stop; reads may be stale for a while", tone: "muted", side: "likes, view counts" },
      ]}
    />
  ),
  quorum: () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="Quorum with N = 3 replicas: write to W = 2, read from R = 2. Because R + W > N, every read set overlaps the write set in at least one node, which has the newest version"
      nodes={[
        { id: "w", x: 10, y: 10, w: 110, title: "Write v2", shape: "pill", tone: "new" },
        { id: "r", x: 400, y: 10, w: 110, title: "Read", shape: "pill", tone: "rev" },
        { id: "a", x: 70, y: 100, w: 100, title: "Replica A", lines: ["v2"], tone: "new" },
        { id: "b", x: 210, y: 100, w: 100, title: "Replica B", lines: ["v2 ← overlap"], tone: "topic" },
        { id: "c", x: 350, y: 100, w: 100, title: "Replica C", lines: ["v1 (stale)"], tone: "muted" },
      ]}
      edges={[
        { from: "w", to: "a", kind: "flow" },
        { from: "w", to: "b", kind: "flow" },
        { from: "r", to: "b", kind: "async" },
        { from: "r", to: "c", kind: "async" },
      ]}
    />
  ),
  nines: () => (
    <Bars
      log
      caption="Allowed downtime per year for each level of availability (log scale). Each extra nine cuts it by 10× — and usually costs far more than 10× in effort"
      rows={[
        { label: "99% (two nines)", value: 5256, shown: "3.65 days", tone: "hard" },
        { label: "99.9%", value: 525.6, shown: "8.8 hours", tone: "pulse" },
        { label: "99.95%", value: 262.8, shown: "4.4 hours", tone: "pulse" },
        { label: "99.99%", value: 52.56, shown: "52.6 min", tone: "topic" },
        { label: "99.999% (five nines)", value: 5.256, shown: "5.3 min", tone: "easy" },
      ]}
    />
  ),
  "sli-slo-sla": () => (
    <Layers
      caption="SLI is what you measure, SLO is the goal you set, SLA is the promise with a penalty. The SLO is always stricter than the SLA so you get warned before you owe money"
      layers={[
        { label: "SLI — indicator", note: "% of requests answered in < 300 ms over the last 30 days = 99.95%", tone: "new", side: "a measurement" },
        { label: "SLO — objective", note: "Internal goal: 99.9% of requests < 300 ms", tone: "topic", side: "a target" },
        { label: "SLA — agreement", note: "Contract: 99.5% or the customer gets 10% credit", tone: "pulse", side: "a promise + penalty" },
        { label: "Error budget", note: "100% − SLO = 0.1% ≈ 43 min/month you may 'spend' on releases and incidents", tone: "rev", side: "freeze deploys when spent" },
      ]}
    />
  ),
  "dns-cdn": () => (
    <ClassDiagram
      width={520}
      height={180}
      caption="Opening shop.com: DNS turns the name into the IP of the nearest CDN edge; the edge serves cached images / JS itself and forwards only dynamic requests to your origin servers"
      nodes={[
        { id: "u", x: 6, y: 70, w: 90, title: "Browser", shape: "pill", tone: "muted" },
        { id: "r", x: 150, y: 6, w: 130, title: "DNS resolver", lines: ["root → .com → NS"], tone: "new" },
        { id: "e", x: 150, y: 116, w: 130, title: "CDN edge (Mumbai)", lines: ["cached assets"], tone: "topic" },
        { id: "o", x: 380, y: 106, w: 130, title: "Origin (Singapore)", lines: ["app + DB"], shape: "db", tone: "rev" },
      ]}
      edges={[
        { from: "u", to: "r", kind: "flow", label: "① shop.com?" },
        { from: "u", to: "e", kind: "flow", label: "② GET" },
        { from: "e", to: "o", kind: "async", label: "③ miss / API" },
      ]}
    />
  ),
  "dns-steps": () => (
    <Steps
      caption="DNS lookup, step by step. Every answer is cached for its TTL, so most lookups stop at step 1 or 2"
      steps={[
        { label: "Browser / OS cache", tone: "muted" },
        { label: "Resolver (ISP / 8.8.8.8)", tone: "new" },
        { label: "Root server", note: "ask .com", tone: "new" },
        { label: "TLD server", note: ".com → NS", tone: "new" },
        { label: "Authoritative NS", note: "A record: IP", tone: "topic" },
        { label: "Connect to IP", tone: "easy" },
      ]}
    />
  ),
  "http-versions": () => (
    <Cards
      cols={3}
      caption="Loading 3 files (a, b, c) over each HTTP version"
      items={[
        { title: "HTTP/1.1", idea: "One request at a time per TCP connection; browsers open ~6 connections", code: "conn1: a ━━ b ━━ c\n(b waits for a)", tone: "muted" },
        { title: "HTTP/2", idea: "Many streams multiplexed on one TCP connection, headers compressed", code: "conn: a b c a b c …\n1 lost TCP packet\nstalls ALL streams", tone: "new" },
        { title: "HTTP/3 (QUIC)", idea: "Streams over UDP; loss stalls only that stream; 0–1 RTT setup", code: "a ━━━\nb ━ ✗ ━ (only b waits)\nc ━━━", tone: "topic" },
      ]}
    />
  ),
  "tls-handshake": () => (
    <Timeline
      caption="Setting up HTTPS (TCP + TLS 1.3): two round trips before the first byte of data. That's why connection reuse and HTTP/3 matter on mobile networks"
      cols={[
        { name: "Client", tone: "new" },
        { name: "Server", tone: "rev" },
      ]}
      rows={[
        ["SYN →", ""],
        ["", "← SYN-ACK"],
        ["ACK + ClientHello (key share) →", ""],
        ["", "← ServerHello + certificate + Finished"],
        ["Finished + GET /page → ✓", ""],
      ]}
    />
  ),
  "api-styles": () => (
    <Cards
      cols={3}
      caption="The same 'get a user and their last orders' in three API styles"
      items={[
        { title: "REST", idea: "Resources + HTTP verbs; cacheable; may need several calls", code: "GET /users/42\nGET /users/42/orders?limit=3", tone: "new" },
        { title: "GraphQL", idea: "Client asks for exactly the fields it needs, one endpoint", code: "{ user(id:42) {\n   name\n   orders(last:3){ total }\n} }", tone: "rev" },
        { title: "gRPC", idea: "Typed functions over HTTP/2 + Protobuf; fast, for service-to-service", code: "rpc GetUser(UserReq)\n  returns (User);\n// binary on the wire", tone: "topic" },
      ]}
    />
  ),
  realtime: () => (
    <Timeline
      caption="How each technique gets a new message (arriving at t3) to the browser"
      cols={[
        { name: "Short polling", tone: "muted" },
        { name: "Long polling", tone: "new" },
        { name: "SSE", tone: "rev" },
        { name: "WebSocket", tone: "topic" },
      ]}
      rows={[
        ["GET → empty", "GET … (server holds it)", "open stream →", "upgrade → open"],
        ["GET → empty", "… still waiting", "(idle)", "(idle, both can send)"],
        ["GET → msg ✓", "← msg ✓, re-GET", "← msg ✓ (server push)", "← msg ✓"],
        ["GET → empty", "GET … waiting", "← next msg", "→ 'typing…' (client push)"],
      ]}
    />
  ),
  "load-balancer": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="A load balancer spreads requests and stops sending to servers that fail health checks. Run two (active + standby sharing a virtual IP) so the LB isn't the single point of failure"
      nodes={[
        { id: "u", x: 6, y: 74, w: 80, title: "Users", shape: "pill", tone: "muted" },
        { id: "lb", x: 130, y: 40, w: 120, title: "LB (active)", lines: ["VIP 10.0.0.1"], tone: "topic" },
        { id: "lb2", x: 130, y: 120, w: 120, title: "LB (standby)", tone: "muted" },
        { id: "a", x: 360, y: 6, w: 150, title: "server 1 ✓", tone: "new" },
        { id: "b", x: 360, y: 66, w: 150, title: "server 2 ✓", tone: "new" },
        { id: "c", x: 360, y: 126, w: 150, title: "server 3 ✗ unhealthy", tone: "hard" },
      ]}
      edges={[
        { from: "u", to: "lb", kind: "flow" },
        { from: "lb", to: "a", kind: "flow" },
        { from: "lb", to: "b", kind: "flow" },
        { from: "lb", to: "c", kind: "depend", label: "/health ✗" },
        { from: "lb2", to: "lb", kind: "depend", label: "heartbeat" },
      ]}
    />
  ),
  "api-gateway": () => (
    <ClassDiagram
      width={520}
      height={180}
      caption="An API gateway is a reverse proxy at the front door: one place for TLS, auth, rate limits and routing, so each service doesn't re-implement them"
      nodes={[
        { id: "m", x: 6, y: 30, w: 90, title: "Mobile app", shape: "pill", tone: "muted" },
        { id: "w", x: 6, y: 110, w: 90, title: "Web app", shape: "pill", tone: "muted" },
        { id: "g", x: 160, y: 40, w: 160, title: "API gateway", lines: ["TLS termination", "auth (JWT check)", "rate limit · routing"], tone: "topic" },
        { id: "u", x: 400, y: 6, w: 110, title: "/users → users", tone: "new" },
        { id: "o", x: 400, y: 70, w: 110, title: "/orders → orders", tone: "new" },
        { id: "p", x: 400, y: 134, w: 110, title: "/pay → payments", tone: "new" },
      ]}
      edges={[
        { from: "m", to: "g", kind: "flow" },
        { from: "w", to: "g", kind: "flow" },
        { from: "g", to: "u", kind: "flow" },
        { from: "g", to: "o", kind: "flow" },
        { from: "g", to: "p", kind: "flow" },
      ]}
    />
  ),
  "cache-aside": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Cache-aside (lazy loading), the most common pattern: the app checks the cache first and only goes to the DB on a miss, then fills the cache with a TTL"
      nodes={[
        { id: "s", x: 6, y: 20, w: 100, title: "get(user:42)", shape: "pill", tone: "new" },
        { id: "q", x: 140, y: 6, w: 140, h: 56, title: "In Redis?", shape: "diamond", tone: "pulse" },
        { id: "hit", x: 380, y: 20, w: 130, title: "return it (~1 ms)", tone: "easy" },
        { id: "db", x: 150, y: 110, w: 120, title: "read DB (~10 ms)", shape: "db", tone: "rev" },
        { id: "set", x: 380, y: 120, w: 130, title: "SET with TTL, return", tone: "topic" },
      ]}
      edges={[
        { from: "s", to: "q", kind: "flow" },
        { from: "q", to: "hit", kind: "flow", label: "hit" },
        { from: "q", to: "db", kind: "flow", label: "miss" },
        { from: "db", to: "set", kind: "flow" },
      ]}
    />
  ),
  "cache-strategies": () => (
    <Cards
      cols={4}
      caption="Four ways to keep a cache and a database together"
      items={[
        { title: "Cache-aside", idea: "App reads cache, on miss reads DB and fills cache. Writes go to DB and delete the key", code: "most common", tone: "new" },
        { title: "Read-through", idea: "Cache itself loads from DB on a miss; app only talks to the cache", code: "CDNs, DAX", tone: "new" },
        { title: "Write-through", idea: "Write to cache and DB together; reads always fresh, writes slower", code: "consistency first", tone: "topic" },
        { title: "Write-back", idea: "Write to cache now, DB later in batches; fastest, can lose data", code: "counters, metrics", tone: "hard" },
      ]}
    />
  ),
  "redis-types": () => (
    <Cards
      cols={3}
      caption="Redis data structures and what each is used for"
      items={[
        { title: "String", idea: "Cache a value, counters, locks", code: "SET user:42 \"{…}\" EX 300\nINCR views:post:9", tone: "new" },
        { title: "Hash", idea: "An object's fields", code: "HSET cart:42 sku1 2 sku7 1", tone: "new" },
        { title: "List", idea: "Queues, latest-N items", code: "LPUSH feed:42 post:9\nLTRIM feed:42 0 99", tone: "topic" },
        { title: "Set", idea: "Unique members, mutual friends", code: "SADD online u1 u2\nSINTER f:a f:b", tone: "topic" },
        { title: "Sorted set", idea: "Leaderboards, rate-limit windows", code: "ZADD lb 980 asha\nZREVRANGE lb 0 9", tone: "pulse" },
        { title: "Stream / Pub-Sub", idea: "Event log with consumer groups; live messages", code: "XADD orders * id 7\nPUBLISH chat:1 \"hi\"", tone: "rev" },
      ]}
    />
  ),
  "hash-ring": HashRing,
  "db-choice": () => (
    <ClassDiagram
      width={520}
      height={214}
      caption="A quick way to pick a database: start from how the data is read and written, not from what's popular"
      nodes={[
        { id: "q1", x: 160, y: 4, w: 200, h: 52, title: "Need joins / transactions?", shape: "diamond", tone: "pulse" },
        { id: "sql", x: 6, y: 18, w: 120, title: "SQL (Postgres)", shape: "db", tone: "topic" },
        { id: "q2", x: 160, y: 84, w: 200, h: 52, title: "What's the access pattern?", shape: "diamond", tone: "pulse" },
        { id: "kv", x: 6, y: 160, w: 120, title: "get by key", lines: ["Redis, DynamoDB"], tone: "new" },
        { id: "doc", x: 136, y: 160, w: 120, title: "flexible JSON", lines: ["MongoDB"], tone: "new" },
        { id: "wc", x: 266, y: 160, w: 120, title: "huge writes", lines: ["Cassandra"], tone: "new" },
        { id: "g", x: 396, y: 160, w: 118, title: "relationships", lines: ["Neo4j"], tone: "rev" },
      ]}
      edges={[
        { from: "q1", to: "sql", kind: "flow", label: "yes" },
        { from: "q1", to: "q2", kind: "flow", label: "no" },
        { from: "q2", to: "kv", kind: "flow" },
        { from: "q2", to: "doc", kind: "flow" },
        { from: "q2", to: "wc", kind: "flow" },
        { from: "q2", to: "g", kind: "flow" },
      ]}
    />
  ),
  "lsm-tree": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="LSM tree (Cassandra, RocksDB): writes go to an in-memory table plus a log, get flushed as sorted immutable files, and background compaction merges them. Very fast writes; reads may check several files (Bloom filters help)"
      nodes={[
        { id: "w", x: 6, y: 20, w: 80, title: "write", shape: "pill", tone: "new" },
        { id: "m", x: 140, y: 6, w: 140, title: "Memtable (RAM)", lines: ["sorted, + WAL"], tone: "topic" },
        { id: "l0", x: 360, y: 6, w: 150, title: "SSTable L0", lines: ["sorted, immutable"], shape: "db", tone: "rev" },
        { id: "l1", x: 360, y: 96, w: 150, title: "SSTable L1 (bigger)", lines: ["merged"], shape: "db", tone: "rev" },
        { id: "r", x: 140, y: 106, w: 140, title: "read: mem → L0 → L1", tone: "muted" },
      ]}
      edges={[
        { from: "w", to: "m", kind: "flow" },
        { from: "m", to: "l0", kind: "flow", label: "flush when full" },
        { from: "l0", to: "l1", kind: "async", label: "compaction" },
      ]}
    />
  ),
  replication: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Leader-follower replication: all writes go to the leader, which streams changes to followers. Reads can go to followers to scale — but they may lag behind"
      nodes={[
        { id: "app", x: 6, y: 66, w: 90, title: "App", shape: "pill", tone: "muted" },
        { id: "l", x: 180, y: 6, w: 130, title: "Leader", lines: ["reads + writes"], shape: "db", tone: "topic" },
        { id: "f1", x: 390, y: 6, w: 120, title: "Follower 1", lines: ["lag 20 ms"], shape: "db", tone: "new" },
        { id: "f2", x: 390, y: 100, w: 120, title: "Follower 2", lines: ["lag 2 s"], shape: "db", tone: "new" },
      ]}
      edges={[
        { from: "app", to: "l", kind: "flow", label: "writes" },
        { from: "l", to: "f1", kind: "async", label: "binlog" },
        { from: "l", to: "f2", kind: "async" },
        { from: "app", to: "f2", kind: "flow", label: "reads" },
      ]}
    />
  ),
  "replica-lag": () => (
    <Timeline
      caption="Replication lag breaks 'read your own writes': you update your name, the page reloads from a follower that hasn't got it yet. Fix: read your own data from the leader for a few seconds after writing"
      cols={[
        { name: "You", tone: "muted" },
        { name: "Leader", tone: "topic" },
        { name: "Follower", tone: "new" },
      ]}
      rows={[
        ["update name = 'Asha K'", "name = 'Asha K' ✓", "name = 'Asha'"],
        ["reload profile → follower", "", "returns 'Asha' ✗ (stale)"],
        ["", "→ replicates", "name = 'Asha K'"],
      ]}
    />
  ),
  sharding: () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="Sharding: split one huge table across machines by a shard key. The router computes the shard from the key, so each query hits one small database"
      nodes={[
        { id: "app", x: 6, y: 20, w: 120, title: "user_id = 1007", shape: "pill", tone: "muted" },
        { id: "r", x: 170, y: 14, w: 170, title: "Router", lines: ["hash(1007) % 4 = 3"], tone: "topic" },
        { id: "s0", x: 6, y: 100, w: 110, title: "Shard 0", shape: "db", tone: "new" },
        { id: "s1", x: 136, y: 100, w: 110, title: "Shard 1", shape: "db", tone: "new" },
        { id: "s2", x: 266, y: 100, w: 110, title: "Shard 2", shape: "db", tone: "new" },
        { id: "s3", x: 396, y: 100, w: 110, title: "Shard 3 ✓", shape: "db", tone: "pulse" },
      ]}
      edges={[
        { from: "app", to: "r", kind: "flow" },
        { from: "r", to: "s3", kind: "flow" },
      ]}
    />
  ),
  "shard-strategies": () => (
    <Cards
      cols={3}
      caption="Three ways to decide which shard a row lives on"
      items={[
        { title: "Range", idea: "A–F on shard 1, G–M on shard 2…  Range queries are easy; new data can pile onto one shard", code: "orders by date →\ntoday's shard is hot", tone: "new" },
        { title: "Hash", idea: "hash(key) % N or a hash ring. Spreads load evenly; range queries hit every shard", code: "hash(user_id)", tone: "topic" },
        { title: "Directory", idea: "A lookup table says where each key lives. Flexible, easy to move tenants; the table is extra infra", code: "tenant 42 → shard 7", tone: "rev" },
      ]}
    />
  ),
  "two-phase-commit": () => (
    <Timeline
      caption="Two-phase commit: everyone votes, then the coordinator decides. If it crashes after the votes, participants hold their locks and wait — the blocking problem"
      cols={[
        { name: "Coordinator", tone: "topic" },
        { name: "Orders DB", tone: "new" },
        { name: "Payments DB", tone: "rev" },
      ]}
      rows={[
        ["PREPARE →", "lock rows, write log", "lock rows, write log"],
        ["", "← YES", "← YES"],
        ["all YES → COMMIT →", "commit ✓", "commit ✓"],
        ["(if any NO → ABORT)", "", ""],
      ]}
    />
  ),
  saga: () => (
    <Steps
      caption="A saga: a chain of local transactions, each with an undo (a compensating action). Payment fails → refund nothing, release the stock, cancel the order"
      loop="on failure, run compensations backwards: release stock ← cancel order"
      steps={[
        { label: "Create order", note: "undo: cancel", tone: "new" },
        { label: "Reserve stock", note: "undo: release", tone: "new" },
        { label: "Charge card", note: "✗ declined", tone: "hard" },
        { label: "Ship", note: "never runs", tone: "muted" },
      ]}
    />
  ),
  outbox: () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="The outbox pattern: write the business row and the event in ONE local transaction, then a relay publishes the event. No more 'saved to DB but the Kafka send failed'"
      nodes={[
        { id: "s", x: 6, y: 40, w: 110, title: "Order service", tone: "muted" },
        { id: "db", x: 170, y: 20, w: 160, title: "Same DB, one txn", lines: ["orders row", "outbox row: OrderPlaced"], shape: "db", tone: "topic" },
        { id: "r", x: 170, y: 116, w: 160, title: "Relay / CDC (Debezium)", tone: "new" },
        { id: "k", x: 400, y: 60, w: 110, title: "Kafka", tone: "rev" },
      ]}
      edges={[
        { from: "s", to: "db", kind: "flow" },
        { from: "db", to: "r", kind: "async", label: "poll" },
        { from: "r", to: "k", kind: "flow", label: "publish" },
      ]}
    />
  ),
  "presigned-upload": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Uploading a photo: the app server only hands out a short-lived pre-signed URL; the heavy bytes go straight from the phone to S3. The DB stores just the metadata and the object key"
      nodes={[
        { id: "c", x: 6, y: 66, w: 90, title: "Phone", shape: "pill", tone: "muted" },
        { id: "a", x: 190, y: 6, w: 130, title: "App server", tone: "topic" },
        { id: "m", x: 390, y: 0, w: 120, title: "Metadata DB", lines: ["key, size, owner"], shape: "db", tone: "rev" },
        { id: "s", x: 190, y: 120, w: 130, title: "S3 bucket", shape: "db", tone: "new" },
      ]}
      edges={[
        { from: "c", to: "a", kind: "flow", label: "① get URL" },
        { from: "c", to: "s", kind: "flow", label: "② PUT bytes" },
        { from: "a", to: "m", kind: "flow", label: "③ save" },
      ]}
    />
  ),
  "inverted-index": () => (
    <Tables
      between="→ index →"
      caption="An inverted index maps each word to the documents containing it (like the index at the back of a book). 'red shoes' = intersect the two lists → doc 1"
      tables={[
        { name: "Documents", head: ["id", "text"], rows: [["1", "Red running shoes"], ["2", "Red cotton shirt"], ["3", "Running socks"]] },
        { name: "Inverted index", head: ["term", "doc ids"], rows: [["red", "1, 2"], ["running", "1, 3"], ["shoes", "1"], ["shirt", "2"], ["socks", "3"]], tone: "topic", mark: ["0,1", "2,1"] },
      ]}
    />
  ),
  "search-sync": () => (
    <Steps
      caption="Keeping Elasticsearch in sync with the main database without dual writes: stream the DB's change log"
      steps={[
        { label: "Postgres / MySQL", note: "source of truth", tone: "rev" },
        { label: "CDC (Debezium)", note: "reads the binlog", tone: "new" },
        { label: "Kafka", note: "change events", tone: "topic" },
        { label: "Indexer", note: "builds docs", tone: "new" },
        { label: "Elasticsearch", note: "search only", tone: "pulse" },
      ]}
    />
  ),
  "queue-vs-pubsub": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Point-to-point queue: each message goes to ONE of the workers (share the work). Pub/sub: each message goes to EVERY subscriber (each does its own thing)"
      nodes={[
        { id: "p", x: 6, y: 10, w: 90, title: "Producer", shape: "pill", tone: "muted" },
        { id: "q", x: 140, y: 10, w: 110, title: "Queue", tone: "topic" },
        { id: "w1", x: 290, y: 0, w: 90, title: "worker 1", tone: "new" },
        { id: "w2", x: 290, y: 40, w: 90, title: "worker 2", tone: "muted" },
        { id: "pub", x: 6, y: 116, w: 90, title: "Order placed", shape: "pill", tone: "muted" },
        { id: "t", x: 140, y: 116, w: 110, title: "Topic", tone: "rev" },
        { id: "e", x: 290, y: 90, w: 100, title: "email svc", tone: "new" },
        { id: "i", x: 290, y: 130, w: 100, title: "inventory svc", tone: "new" },
        { id: "a", x: 410, y: 110, w: 100, title: "analytics", tone: "new" },
      ]}
      edges={[
        { from: "p", to: "q", kind: "flow" },
        { from: "q", to: "w1", kind: "flow", label: "msg" },
        { from: "pub", to: "t", kind: "flow" },
        { from: "t", to: "e", kind: "flow" },
        { from: "t", to: "i", kind: "flow" },
        { from: "t", to: "a", kind: "flow" },
      ]}
    />
  ),
  dlq: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Retries and a dead letter queue: a message that keeps failing is parked in the DLQ after N tries, so it stops blocking the queue and someone can inspect it"
      nodes={[
        { id: "q", x: 6, y: 20, w: 100, title: "Queue", tone: "topic" },
        { id: "c", x: 150, y: 20, w: 110, title: "Consumer", tone: "new" },
        { id: "d", x: 300, y: 6, w: 110, h: 56, title: "Succeeded?", shape: "diamond", tone: "pulse" },
        { id: "ack", x: 440, y: 20, w: 74, title: "ack ✓", tone: "easy" },
        { id: "r", x: 290, y: 110, w: 130, h: 52, title: "tries < 5?", shape: "diamond", tone: "pulse" },
        { id: "dlq", x: 440, y: 120, w: 74, title: "DLQ", shape: "db", tone: "hard" },
        { id: "b", x: 120, y: 120, w: 140, title: "retry after backoff", tone: "muted" },
      ]}
      edges={[
        { from: "q", to: "c", kind: "flow" },
        { from: "c", to: "d", kind: "flow" },
        { from: "d", to: "ack", kind: "flow", label: "yes" },
        { from: "d", to: "r", kind: "flow", label: "no" },
        { from: "r", to: "dlq", kind: "flow", label: "no" },
        { from: "r", to: "b", kind: "flow", label: "yes" },
        { from: "b", to: "q", kind: "async" },
      ]}
    />
  ),
  "delivery-semantics": () => (
    <Cards
      cols={3}
      caption="Delivery guarantees. In practice you pick at-least-once and make consumers idempotent"
      items={[
        { title: "At-most-once", idea: "Ack before processing. Crash → message lost, never duplicated", code: "metrics, logs", tone: "muted" },
        { title: "At-least-once", idea: "Ack after processing. Crash → redelivered, may be processed twice", code: "most systems +\nidempotent consumer", tone: "topic" },
        { title: "Exactly-once", idea: "Effect happens once: dedup ids or transactions (Kafka EOS) inside one system", code: "payments, ledgers", tone: "new" },
      ]}
    />
  ),
  "kafka-partitions": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="A Kafka topic is split into partitions (ordered, append-only logs). In a consumer group each partition goes to exactly one consumer; order is guaranteed only within a partition, so key by order_id"
      nodes={[
        { id: "p", x: 6, y: 70, w: 100, title: "Producer", lines: ["key = order_id"], tone: "muted" },
        { id: "p0", x: 150, y: 6, w: 200, title: "Partition 0", lines: ["0 1 2 3 4 5 ▸ offset 6"], tone: "topic" },
        { id: "p1", x: 150, y: 70, w: 200, title: "Partition 1", lines: ["0 1 2 3 ▸ offset 4"], tone: "topic" },
        { id: "p2", x: 150, y: 134, w: 200, title: "Partition 2", lines: ["0 1 2 3 4 ▸ offset 5"], tone: "topic" },
        { id: "c1", x: 400, y: 30, w: 110, title: "Consumer A", tone: "new" },
        { id: "c2", x: 400, y: 120, w: 110, title: "Consumer B", tone: "new" },
      ]}
      edges={[
        { from: "p", to: "p1", kind: "flow" },
        { from: "p0", to: "c1", kind: "flow" },
        { from: "p1", to: "c1", kind: "flow" },
        { from: "p2", to: "c2", kind: "flow" },
      ]}
    />
  ),
  cqrs: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="CQRS: commands (writes) and queries (reads) use different models. Writes append events; a projector builds read-optimised views from them, a moment later (eventual consistency)"
      nodes={[
        { id: "cmd", x: 6, y: 10, w: 110, title: "PlaceOrder", shape: "pill", tone: "new" },
        { id: "w", x: 160, y: 4, w: 150, title: "Write model", lines: ["event store / SQL"], shape: "db", tone: "topic" },
        { id: "pr", x: 380, y: 10, w: 130, title: "Projector", tone: "rev" },
        { id: "r", x: 380, y: 110, w: 130, title: "Read model", lines: ["denormalised view"], shape: "db", tone: "new" },
        { id: "q", x: 160, y: 120, w: 150, title: "GET /my-orders", shape: "pill", tone: "new" },
      ]}
      edges={[
        { from: "cmd", to: "w", kind: "flow" },
        { from: "w", to: "pr", kind: "async", label: "events" },
        { from: "pr", to: "r", kind: "flow" },
        { from: "q", to: "r", kind: "flow" },
      ]}
    />
  ),
  "event-sourcing": () => (
    <Tables
      between="→ replay →"
      caption="Event sourcing: store what happened, not just the current value. The balance is computed by replaying events, so you get a full audit trail for free"
      tables={[
        { name: "Events (append-only)", head: ["#", "event"], rows: [["1", "AccountOpened"], ["2", "Deposited 1000"], ["3", "Withdrew 300"], ["4", "Deposited 50"]], tone: "topic" },
        { name: "Current state", head: ["account", "balance"], rows: [["A-17", "750"]], tone: "new" },
      ]}
    />
  ),
  mapreduce: () => (
    <Steps
      caption="MapReduce word count: split the input, map each piece to (word, 1), shuffle so each word lands on one reducer, then add up"
      steps={[
        { label: "Input", note: "TBs of logs", tone: "muted" },
        { label: "Split", note: "128 MB chunks", tone: "new" },
        { label: "Map", note: "(\"cat\",1) (\"dog\",1)", tone: "topic" },
        { label: "Shuffle & sort", note: "group by word", tone: "pulse" },
        { label: "Reduce", note: "(\"cat\", 42)", tone: "rev" },
        { label: "Output", tone: "easy" },
      ]}
    />
  ),
  windows: () => (
    <Timeline
      caption="Stream windows over clicks (event time). Tumbling: fixed, non-overlapping. Sliding: overlapping. Session: closes after a gap of inactivity. A watermark decides how long to wait for late events"
      cols={[
        { name: "Tumbling (1 min)", tone: "new" },
        { name: "Sliding (1 min, every 30 s)", tone: "topic" },
        { name: "Session (gap 30 s)", tone: "rev" },
      ]}
      time="min"
      rows={[
        ["[0:00–1:00)", "[0:00–1:00)", "session 1 starts"],
        ["[1:00–2:00)", "[0:30–1:30)", "… clicks keep it open"],
        ["[2:00–3:00)", "[1:00–2:00)", "30 s idle → close ✓"],
      ]}
    />
  ),
  "token-bucket": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Token bucket: tokens drip in at a fixed rate up to a cap; each request spends one. Allows short bursts (up to the cap) but limits the average rate"
      nodes={[
        { id: "ref", x: 6, y: 10, w: 140, title: "Refill 10 tokens/s", shape: "pill", tone: "new" },
        { id: "b", x: 190, y: 6, w: 140, title: "Bucket", lines: ["capacity 20", "now: 3 tokens"], tone: "topic" },
        { id: "req", x: 6, y: 110, w: 110, title: "Request", shape: "pill", tone: "muted" },
        { id: "q", x: 180, y: 96, w: 160, h: 56, title: "token left?", shape: "diamond", tone: "pulse" },
        { id: "ok", x: 400, y: 70, w: 110, title: "take 1, serve ✓", tone: "easy" },
        { id: "no", x: 400, y: 130, w: 110, title: "429 Too Many", tone: "hard" },
      ]}
      edges={[
        { from: "ref", to: "b", kind: "flow" },
        { from: "req", to: "q", kind: "flow" },
        { from: "q", to: "ok", kind: "flow", label: "yes" },
        { from: "q", to: "no", kind: "flow", label: "no" },
      ]}
    />
  ),
  "rate-windows": () => (
    <Timeline
      caption="Limit: 5 requests per minute. A fixed window lets 10 through around the boundary (5 at 0:59, 5 at 1:00). A sliding window counts the last 60 s from now, so it blocks the second burst"
      cols={[
        { name: "Fixed window", tone: "pulse" },
        { name: "Sliding window", tone: "topic" },
      ]}
      rows={[
        ["0:59 — 5 requests, window 0:00 count = 5 ✓", "0:59 — 5 requests, last 60 s = 5 ✓"],
        ["1:00 — new window, count reset to 0", "1:00 — last 60 s still = 5"],
        ["1:00 — 5 more allowed ✗ (10 in 2 s)", "1:00 — 5 more blocked ✓ 429"],
      ]}
    />
  ),
  "idempotency-key": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Idempotency key: the client sends the same unique key on every retry. The server remembers keys it has processed and replays the saved response instead of charging twice"
      nodes={[
        { id: "r", x: 6, y: 20, w: 150, title: "POST /pay", lines: ["Idempotency-Key: k-91"], tone: "new" },
        { id: "q", x: 190, y: 10, w: 150, h: 60, title: "Seen k-91?", shape: "diamond", tone: "pulse" },
        { id: "old", x: 380, y: 20, w: 130, title: "return saved result", tone: "easy" },
        { id: "do", x: 160, y: 116, w: 210, title: "charge, save k-91 → result", tone: "topic" },
        { id: "db", x: 400, y: 104, w: 110, title: "keys table", shape: "db", tone: "rev" },
      ]}
      edges={[
        { from: "r", to: "q", kind: "flow" },
        { from: "q", to: "old", kind: "flow", label: "yes" },
        { from: "q", to: "do", kind: "flow", label: "no" },
        { from: "do", to: "db", kind: "flow" },
      ]}
    />
  ),
  backoff: () => (
    <Bars
      caption="Exponential backoff: wait 1, 2, 4, 8, 16 s between retries (capped), plus random jitter so a thousand clients don't all retry at the same instant"
      rows={[
        { label: "retry 1", value: 1, shown: "1 s ± jitter", tone: "new" },
        { label: "retry 2", value: 2, shown: "2 s ± jitter", tone: "new" },
        { label: "retry 3", value: 4, shown: "4 s ± jitter", tone: "topic" },
        { label: "retry 4", value: 8, shown: "8 s ± jitter", tone: "pulse" },
        { label: "retry 5", value: 16, shown: "16 s, then give up", tone: "hard" },
      ]}
    />
  ),
  "circuit-breaker": () => (
    <ClassDiagram
      width={520}
      height={160}
      caption="Circuit breaker states. Open = fail fast without calling the sick service, giving it time to recover; half-open sends a few test calls"
      nodes={[
        { id: "c", x: 6, y: 50, w: 120, title: "CLOSED", lines: ["calls flow"], shape: "pill", tone: "easy" },
        { id: "o", x: 380, y: 50, w: 130, title: "OPEN", lines: ["fail fast"], shape: "pill", tone: "hard" },
        { id: "h", x: 190, y: 110, w: 140, title: "HALF-OPEN", lines: ["try a few"], shape: "pill", tone: "pulse" },
      ]}
      edges={[
        { from: "c", to: "o", kind: "flow", label: "errors > 50%" },
        { from: "o", to: "h", kind: "flow", label: "after 30 s" },
        { from: "h", to: "c", kind: "flow", label: "ok" },
        { from: "h", to: "o", kind: "async", label: "fail" },
      ]}
    />
  ),
  bulkhead: () => (
    <ClassDiagram
      width={520}
      height={150}
      caption="Bulkhead: give each downstream its own small thread / connection pool, like watertight compartments in a ship. A slow recommendations service can only exhaust its own 10 threads, not checkout's"
      nodes={[
        { id: "s", x: 6, y: 50, w: 120, title: "Product page", tone: "muted" },
        { id: "p1", x: 180, y: 6, w: 150, title: "pool: payments (20)", tone: "new" },
        { id: "p2", x: 180, y: 96, w: 150, title: "pool: recs (10) full ✗", tone: "hard" },
        { id: "a", x: 390, y: 6, w: 120, title: "Payments ✓", tone: "easy" },
        { id: "b", x: 390, y: 96, w: 120, title: "Recs (slow)", tone: "hard" },
      ]}
      edges={[
        { from: "s", to: "p1", kind: "flow" },
        { from: "s", to: "p2", kind: "flow" },
        { from: "p1", to: "a", kind: "flow" },
        { from: "p2", to: "b", kind: "async" },
      ]}
    />
  ),
  raft: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Raft roles. A follower that hears nothing from a leader for a random timeout becomes a candidate and asks for votes; a majority makes it leader for that term"
      nodes={[
        { id: "f", x: 6, y: 60, w: 120, title: "Follower", shape: "pill", tone: "new" },
        { id: "c", x: 200, y: 6, w: 120, title: "Candidate", shape: "pill", tone: "pulse" },
        { id: "l", x: 390, y: 60, w: 120, title: "Leader", shape: "pill", tone: "topic" },
      ]}
      edges={[
        { from: "f", to: "c", kind: "flow", label: "timeout, term+1" },
        { from: "c", to: "l", kind: "flow", label: "majority votes" },
        { from: "c", to: "f", kind: "async", label: "sees leader" },
        { from: "l", to: "f", kind: "async", label: "higher term seen" },
      ]}
    />
  ),
  "raft-log": () => (
    <Timeline
      caption="Raft log replication with 3 nodes: an entry is committed once a majority (2 of 3) has it — even if one node is down"
      cols={[
        { name: "Leader", tone: "topic" },
        { name: "Follower 1", tone: "new" },
        { name: "Follower 2", tone: "muted" },
      ]}
      rows={[
        ["append x=5 (term 3)", "", "(down)"],
        ["AppendEntries →", "append x=5, ack", "(down)"],
        ["2/3 have it → commit ✓", "", ""],
        ["apply, reply to client", "learns commit next heartbeat", "catches up later"],
      ]}
    />
  ),
  snowflake: Snowflake,
  lamport: () => (
    <Timeline
      caption="Lamport clocks: each node keeps a counter, +1 per event; on receive, take max(mine, msg) + 1. If A happened before B, then L(A) < L(B) — giving a consistent order without synchronised clocks"
      cols={[
        { name: "Node P", tone: "new" },
        { name: "Node Q", tone: "rev" },
      ]}
      rows={[
        ["event → L=1", "event → L=1"],
        ["send msg (L=2) →", ""],
        ["", "receive: max(1,2)+1 → L=3"],
        ["event → L=3", "send reply (L=4) →"],
        ["receive: max(3,4)+1 → L=5", ""],
      ]}
    />
  ),
  observability: () => (
    <Cards
      cols={3}
      caption="The three pillars of observability, answering three different questions"
      items={[
        { title: "Metrics — is something wrong?", idea: "Numbers over time: cheap, aggregated, alertable", code: "http_requests_total{code=\"500\"}\np99 latency = 840ms", tone: "topic" },
        { title: "Logs — what happened?", idea: "Timestamped events with detail; structured JSON + a request id", code: '{"lvl":"error","req":"a91",\n "msg":"card declined"}', tone: "new" },
        { title: "Traces — where is it slow?", idea: "One request's path across services, as spans", code: "trace a91: gateway → cart\n→ pricing (220ms) → DB", tone: "rev" },
      ]}
    />
  ),
  spans: Spans,
  "monolith-vs-micro": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="A monolith is one deployable with one database. Microservices split by business capability, each owning its own data and talking over the network"
      nodes={[
        { id: "m", x: 6, y: 6, w: 160, title: "Monolith", lines: ["users · orders", "payments · search", "one deploy"], tone: "rev" },
        { id: "md", x: 26, y: 112, w: 120, title: "one DB", shape: "db", tone: "rev" },
        { id: "g", x: 290, y: 0, w: 120, title: "Gateway", tone: "topic" },
        { id: "u", x: 220, y: 66, w: 90, title: "users", tone: "new" },
        { id: "o", x: 320, y: 66, w: 90, title: "orders", tone: "new" },
        { id: "p", x: 420, y: 66, w: 90, title: "payments", tone: "new" },
        { id: "ud", x: 220, y: 124, w: 90, title: "DB", shape: "db", tone: "new" },
        { id: "od", x: 320, y: 124, w: 90, title: "DB", shape: "db", tone: "new" },
        { id: "pd", x: 420, y: 124, w: 90, title: "DB", shape: "db", tone: "new" },
      ]}
      edges={[
        { from: "m", to: "md", kind: "flow" },
        { from: "g", to: "u", kind: "flow" },
        { from: "g", to: "o", kind: "flow" },
        { from: "g", to: "p", kind: "flow" },
        { from: "u", to: "ud", kind: "flow" },
        { from: "o", to: "od", kind: "flow" },
        { from: "p", to: "pd", kind: "flow" },
      ]}
    />
  ),
  "oauth-flow": () => (
    <Timeline
      caption="OAuth 2.0 authorization code flow ('Log in with Google'). The app never sees your Google password; it gets a token that allows only what you approved"
      cols={[
        { name: "You (browser)", tone: "muted" },
        { name: "App", tone: "new" },
        { name: "Google (auth server)", tone: "topic" },
      ]}
      rows={[
        ["click 'Login with Google'", "redirect → with client_id, scope, PKCE", ""],
        ["log in, approve 'email, profile'", "", "← redirect back with a one-time code"],
        ["", "code + secret → (back channel)", "← access token + ID token (OIDC)"],
        ["logged in ✓", "call APIs with the access token", ""],
      ]}
    />
  ),
  "session-vs-jwt": () => (
    <Cards
      cols={2}
      caption="Two ways to remember who's logged in"
      items={[
        { title: "Server session", idea: "Cookie holds a random id; server looks it up in Redis on each request. Easy to revoke; needs a shared store", code: "Cookie: sid=8f3a…\nRedis: 8f3a → {user: 42}", tone: "new" },
        { title: "JWT", idea: "Token itself holds signed claims; any server verifies the signature, no lookup. Hard to revoke → keep it short-lived + refresh token", code: "header.payload.signature\n{ sub: 42, role: \"admin\",\n  exp: 1730000000 }", tone: "topic" },
      ]}
    />
  ),
  "bloom-filter": BloomBits,
  "count-min": () => (
    <Tables
      caption="Count-min sketch: d rows of counters, each with its own hash. Add an item → +1 in one cell per row. Estimate = the minimum across its cells (collisions only ever inflate counts, so min is the best guess)"
      tables={[
        {
          name: "add 'cat' ×3, 'dog' ×1 — estimate('cat') = min(3, 4, 3) = 3",
          head: ["", "c0", "c1", "c2", "c3", "c4"],
          rows: [
            ["h1", "0", "3", "0", "1", "0"],
            ["h2", "4", "0", "0", "0", "0"],
            ["h3", "0", "0", "1", "3", "0"],
          ],
          mark: ["0,2", "1,1", "2,4"],
        },
      ]}
    />
  ),
  "geohash-grid": GeoGrid,
  quadtree: () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Quadtree: keep splitting any square with too many points into 4. Dense cities get small cells, empty areas stay big — good for 'nearest 10 restaurants'"
      nodes={[
        { id: "r", x: 200, y: 6, w: 120, title: "India (whole)", tone: "topic" },
        { id: "nw", x: 6, y: 80, w: 110, title: "NW", lines: ["40 pts → split"], tone: "pulse" },
        { id: "ne", x: 136, y: 80, w: 110, title: "NE", lines: ["3 pts (leaf)"], tone: "new" },
        { id: "sw", x: 266, y: 80, w: 110, title: "SW (Mumbai)", lines: ["900 → split"], tone: "pulse" },
        { id: "se", x: 396, y: 80, w: 110, title: "SE", lines: ["12 pts (leaf)"], tone: "new" },
      ]}
      edges={[
        { from: "r", to: "nw", kind: "flow" },
        { from: "r", to: "ne", kind: "flow" },
        { from: "r", to: "sw", kind: "flow" },
        { from: "r", to: "se", kind: "flow" },
      ]}
    />
  ),

  // Case studies
  "tinyurl-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="URL shortener: writes get a unique id from a key service and store code → long URL; reads (100× more) are served from cache and return a 301/302 redirect"
      nodes={[
        { id: "u", x: 6, y: 74, w: 80, title: "User", shape: "pill", tone: "muted" },
        { id: "lb", x: 120, y: 74, w: 90, title: "LB + API", tone: "topic" },
        { id: "k", x: 250, y: 4, w: 130, title: "Key generation", lines: ["pre-made ids"], tone: "rev" },
        { id: "c", x: 250, y: 130, w: 130, title: "Redis cache", lines: ["code → URL"], tone: "new" },
        { id: "db", x: 410, y: 66, w: 104, title: "DB", lines: ["code, url, ts"], shape: "db", tone: "pulse" },
      ]}
      edges={[
        { from: "u", to: "lb", kind: "flow" },
        { from: "lb", to: "k", kind: "flow", label: "POST" },
        { from: "lb", to: "c", kind: "flow", label: "GET /x7Kq" },
        { from: "k", to: "db", kind: "flow" },
        { from: "c", to: "db", kind: "async", label: "miss" },
      ]}
    />
  ),
  base62: () => (
    <Steps
      caption="Base62 turns a numeric id into a short code using 0–9, a–z, A–Z. 7 characters give 62⁷ ≈ 3.5 trillion codes"
      steps={[
        { label: "id = 125", tone: "new" },
        { label: "125 ÷ 62 = 2 r 1", note: "digit '1'", tone: "topic" },
        { label: "2 ÷ 62 = 0 r 2", note: "digit '2'", tone: "topic" },
        { label: "read backwards", tone: "pulse" },
        { label: "\"21\"", note: "short.ly/21", tone: "easy" },
      ]}
    />
  ),
  "rate-limiter-arch": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Distributed rate limiter: every gateway node checks and updates the same counters in Redis with one atomic Lua script, so limits hold across the fleet"
      nodes={[
        { id: "c", x: 6, y: 60, w: 80, title: "Client", shape: "pill", tone: "muted" },
        { id: "g", x: 130, y: 54, w: 130, title: "Gateway + limiter", lines: ["key = user:42"], tone: "topic" },
        { id: "r", x: 320, y: 0, w: 110, title: "Redis", lines: ["Lua: check+incr"], shape: "db", tone: "rev" },
        { id: "cfg", x: 320, y: 120, w: 110, title: "Rules", lines: ["100 req/min"], tone: "muted" },
        { id: "api", x: 450, y: 60, w: 64, title: "API", tone: "new" },
      ]}
      edges={[
        { from: "c", to: "g", kind: "flow" },
        { from: "g", to: "r", kind: "flow" },
        { from: "cfg", to: "g", kind: "async" },
        { from: "g", to: "api", kind: "flow", label: "ok" },
      ]}
    />
  ),
  "dynamo-techniques": () => (
    <Tables
      caption="Designing a Dynamo-style key-value store: each problem and the technique that solves it"
      tables={[
        {
          name: "Problem → technique",
          head: ["Problem", "Technique", "Why"],
          rows: [
            ["Spread data", "Consistent hashing + virtual nodes", "add / remove nodes, move few keys"],
            ["Survive failures", "Replicate to next N nodes on ring", "N = 3 copies"],
            ["Tunable consistency", "Quorum R + W > N", "trade latency vs freshness"],
            ["Concurrent writes", "Vector clocks / last-write-wins", "detect or resolve conflicts"],
            ["Node down briefly", "Sloppy quorum + hinted handoff", "stay writable"],
            ["Replicas drift", "Merkle trees (anti-entropy)", "sync only what differs"],
            ["Who's alive?", "Gossip protocol", "no central master"],
          ],
        },
      ]}
    />
  ),
  "id-options": () => (
    <Tables
      caption="Ways to generate unique IDs in a distributed system"
      tables={[
        {
          name: "Options",
          head: ["Approach", "Sortable?", "Size", "Coordination", "Catch"],
          rows: [
            ["DB auto-increment", "yes", "64-bit", "single DB", "bottleneck / SPOF"],
            ["UUID v4", "no", "128-bit", "none", "bad for B-tree inserts"],
            ["Ticket server (Flickr)", "yes", "64-bit", "1–2 servers", "SPOF unless paired"],
            ["Snowflake", "by time", "64-bit", "machine ids only", "needs sane clocks"],
            ["UUID v7 / ULID", "by time", "128-bit", "none", "bigger keys"],
          ],
        },
      ]}
    />
  ),
  "notification-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Notification system: one service checks preferences and templates, then puts each message on a per-channel queue so a slow SMS provider never delays push notifications"
      nodes={[
        { id: "s", x: 6, y: 74, w: 100, title: "Order svc", lines: ["'shipped'"], tone: "muted" },
        { id: "n", x: 140, y: 64, w: 130, title: "Notification svc", lines: ["prefs · template", "dedup · rate limit"], tone: "topic" },
        { id: "qp", x: 310, y: 6, w: 90, title: "push queue", tone: "rev" },
        { id: "qs", x: 310, y: 76, w: 90, title: "SMS queue", tone: "rev" },
        { id: "qe", x: 310, y: 146, w: 90, title: "email queue", tone: "rev" },
        { id: "fp", x: 430, y: 6, w: 84, title: "FCM/APNs", tone: "new" },
        { id: "fs", x: 430, y: 76, w: 84, title: "Twilio", tone: "new" },
        { id: "fe", x: 430, y: 146, w: 84, title: "SES", tone: "new" },
      ]}
      edges={[
        { from: "s", to: "n", kind: "flow" },
        { from: "n", to: "qp", kind: "flow" },
        { from: "n", to: "qs", kind: "flow" },
        { from: "n", to: "qe", kind: "flow" },
        { from: "qp", to: "fp", kind: "flow" },
        { from: "qs", to: "fs", kind: "flow" },
        { from: "qe", to: "fe", kind: "flow" },
      ]}
    />
  ),
  "feed-fanout": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="Fan-out on write (push): a new post is copied into every follower's feed cache, so reading is instant. Celebrities with crores of followers are skipped and merged in at read time (fan-out on read)"
      nodes={[
        { id: "a", x: 6, y: 20, w: 110, title: "Asha posts", shape: "pill", tone: "new" },
        { id: "f", x: 160, y: 14, w: 130, title: "Fan-out workers", tone: "topic" },
        { id: "c1", x: 340, y: 0, w: 170, title: "feed:ravi  [p9, …]", tone: "new" },
        { id: "c2", x: 340, y: 50, w: 170, title: "feed:meena [p9, …]", tone: "new" },
        { id: "v", x: 6, y: 120, w: 110, title: "Celebrity posts", shape: "pill", tone: "pulse" },
        { id: "r", x: 160, y: 114, w: 130, title: "read: merge at view", tone: "pulse" },
        { id: "c3", x: 340, y: 120, w: 170, title: "feed:ravi + celeb posts", tone: "pulse" },
      ]}
      edges={[
        { from: "a", to: "f", kind: "flow" },
        { from: "f", to: "c1", kind: "flow" },
        { from: "f", to: "c2", kind: "flow" },
        { from: "v", to: "r", kind: "async" },
        { from: "r", to: "c3", kind: "flow" },
      ]}
    />
  ),
  "chat-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Chat: each phone keeps a WebSocket to a gateway. A session registry says which gateway a user is on; the message is stored first, then pushed — or kept for later if they're offline"
      nodes={[
        { id: "a", x: 6, y: 20, w: 80, title: "Asha", shape: "pill", tone: "new" },
        { id: "g1", x: 120, y: 14, w: 100, title: "Gateway 1", tone: "topic" },
        { id: "chat", x: 260, y: 70, w: 110, title: "Chat service", tone: "topic" },
        { id: "reg", x: 260, y: 0, w: 110, title: "Sessions", lines: ["ravi → gw 2"], shape: "db", tone: "rev" },
        { id: "store", x: 260, y: 130, w: 110, title: "Messages", lines: ["Cassandra"], shape: "db", tone: "rev" },
        { id: "g2", x: 410, y: 70, w: 100, title: "Gateway 2", tone: "topic" },
        { id: "b", x: 420, y: 140, w: 80, title: "Ravi", shape: "pill", tone: "new" },
      ]}
      edges={[
        { from: "a", to: "g1", kind: "flow", label: "WS" },
        { from: "g1", to: "chat", kind: "flow" },
        { from: "chat", to: "reg", kind: "flow" },
        { from: "chat", to: "store", kind: "flow" },
        { from: "chat", to: "g2", kind: "flow" },
        { from: "g2", to: "b", kind: "flow" },
      ]}
    />
  ),
  "message-receipts": () => (
    <Timeline
      caption="WhatsApp-style ticks: each tick is an acknowledgement travelling back. Messages carry a per-chat sequence number so they show in order even if they arrive out of order"
      cols={[
        { name: "Asha's phone", tone: "new" },
        { name: "Server", tone: "topic" },
        { name: "Ravi's phone", tone: "rev" },
      ]}
      rows={[
        ["send msg #17 →", "store, ack", ""],
        ["✓ one tick (sent)", "push → (or wait till online)", "receives #17"],
        ["✓✓ two ticks (delivered)", "← delivered ack", "← ack"],
        ["blue ✓✓ (read)", "← read ack", "opens the chat"],
      ]}
    />
  ),
  "trie-topk": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Autocomplete trie: each node caches the top suggestions for its prefix, so typing 'ip' is one lookup — no need to walk the subtree. Top-k lists are rebuilt offline from search logs"
      nodes={[
        { id: "r", x: 210, y: 4, w: 100, title: "(root)", tone: "muted" },
        { id: "i", x: 110, y: 64, w: 150, title: "i", lines: ["top: iphone, ipl, india"], tone: "topic" },
        { id: "ip", x: 6, y: 136, w: 170, title: "ip", lines: ["top: iphone 16, ipl score"], tone: "new" },
        { id: "in", x: 200, y: 136, w: 150, title: "in", lines: ["top: india, instagram"], tone: "new" },
        { id: "s", x: 370, y: 64, w: 140, title: "s", lines: ["top: swiggy, sbi"], tone: "topic" },
      ]}
      edges={[
        { from: "r", to: "i", kind: "flow" },
        { from: "r", to: "s", kind: "flow" },
        { from: "i", to: "ip", kind: "flow" },
        { from: "i", to: "in", kind: "flow" },
      ]}
    />
  ),
  "video-pipeline": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Video platform: upload the raw file to blob storage, transcode it in parallel into many resolutions and small segments, push to the CDN. Viewers stream segments from the nearest edge"
      nodes={[
        { id: "u", x: 6, y: 20, w: 90, title: "Creator", shape: "pill", tone: "muted" },
        { id: "raw", x: 130, y: 10, w: 110, title: "Raw video", lines: ["S3"], shape: "db", tone: "rev" },
        { id: "q", x: 280, y: 20, w: 100, title: "Queue", tone: "topic" },
        { id: "t", x: 410, y: 10, w: 104, title: "Transcoders", lines: ["240p…4K, HLS"], tone: "pulse" },
        { id: "cdn", x: 260, y: 130, w: 120, title: "CDN edges", lines: ["segments"], tone: "new" },
        { id: "v", x: 6, y: 136, w: 100, title: "Viewer", shape: "pill", tone: "muted" },
        { id: "m", x: 130, y: 120, w: 100, title: "Metadata", lines: ["title, views"], shape: "db", tone: "rev" },
      ]}
      edges={[
        { from: "u", to: "raw", kind: "flow" },
        { from: "raw", to: "q", kind: "flow" },
        { from: "q", to: "t", kind: "flow" },
        { from: "t", to: "cdn", kind: "flow" },
        { from: "v", to: "cdn", kind: "flow" },
      ]}
    />
  ),
  abr: () => (
    <Bars
      caption="Adaptive bitrate streaming: the player measures bandwidth for each 4-second segment and picks the best quality it can download in time — so the video drops to 360p in a tunnel instead of buffering"
      rows={[
        { label: "seg 1 · home Wi-Fi", value: 5, shown: "1080p", tone: "easy" },
        { label: "seg 2 · 4G", value: 3, shown: "720p", tone: "topic" },
        { label: "seg 3 · tunnel", value: 1, shown: "360p", tone: "hard" },
        { label: "seg 4 · 4G again", value: 3, shown: "720p", tone: "topic" },
      ]}
    />
  ),
  "dropbox-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="File sync: the client splits files into 4 MB chunks named by their hash, uploads only chunks the server doesn't have, then commits a new file version in the metadata DB; other devices get notified and pull the changes"
      nodes={[
        { id: "c", x: 6, y: 70, w: 100, title: "Laptop client", lines: ["chunker, watcher"], tone: "muted" },
        { id: "b", x: 170, y: 6, w: 120, title: "Block store", lines: ["S3: hash → chunk"], shape: "db", tone: "rev" },
        { id: "m", x: 170, y: 130, w: 120, title: "Metadata svc", lines: ["file → [hashes]"], tone: "topic" },
        { id: "n", x: 350, y: 130, w: 120, title: "Notification", lines: ["long poll / WS"], tone: "pulse" },
        { id: "p", x: 390, y: 40, w: 120, title: "Phone client", tone: "muted" },
      ]}
      edges={[
        { from: "c", to: "b", kind: "flow", label: "new chunks only" },
        { from: "c", to: "m", kind: "flow", label: "commit v5" },
        { from: "m", to: "n", kind: "flow" },
        { from: "n", to: "p", kind: "async", label: "changed" },
      ]}
    />
  ),
  "crawler-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Web crawler loop: take a URL from the frontier (which enforces politeness per site), fetch it, skip duplicate content, store it, extract links, and feed only unseen URLs back"
      nodes={[
        { id: "seed", x: 6, y: 10, w: 90, title: "Seed URLs", shape: "pill", tone: "muted" },
        { id: "f", x: 130, y: 6, w: 120, title: "URL frontier", lines: ["queue per host"], tone: "topic" },
        { id: "d", x: 300, y: 6, w: 100, title: "Fetcher", lines: ["robots.txt, DNS"], tone: "new" },
        { id: "dup", x: 420, y: 70, w: 94, title: "Seen content?", lines: ["simhash"], tone: "pulse" },
        { id: "s", x: 420, y: 140, w: 94, title: "Store", shape: "db", tone: "rev" },
        { id: "p", x: 260, y: 140, w: 120, title: "Link extractor", tone: "new" },
        { id: "seen", x: 110, y: 140, w: 120, title: "Seen URL?", lines: ["Bloom filter"], tone: "pulse" },
      ]}
      edges={[
        { from: "seed", to: "f", kind: "flow" },
        { from: "f", to: "d", kind: "flow" },
        { from: "d", to: "dup", kind: "flow" },
        { from: "dup", to: "s", kind: "flow" },
        { from: "s", to: "p", kind: "flow" },
        { from: "p", to: "seen", kind: "flow" },
        { from: "seen", to: "f", kind: "async", label: "new only" },
      ]}
    />
  ),
  "uber-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Ride sharing: drivers send GPS every few seconds into an in-memory geo index; a ride request searches nearby cells, offers the trip to the best driver, and the trip service tracks its state"
      nodes={[
        { id: "d", x: 6, y: 10, w: 100, title: "Drivers", lines: ["GPS every 4 s"], shape: "pill", tone: "muted" },
        { id: "loc", x: 150, y: 6, w: 130, title: "Location svc", lines: ["geohash → drivers"], tone: "topic" },
        { id: "r", x: 6, y: 130, w: 100, title: "Rider", shape: "pill", tone: "muted" },
        { id: "m", x: 150, y: 120, w: 130, title: "Matching", lines: ["nearest + ETA"], tone: "pulse" },
        { id: "t", x: 340, y: 120, w: 130, title: "Trip service", lines: ["state machine"], tone: "new" },
        { id: "g", x: 340, y: 6, w: 130, title: "Redis geo index", shape: "db", tone: "rev" },
      ]}
      edges={[
        { from: "d", to: "loc", kind: "flow" },
        { from: "loc", to: "g", kind: "flow" },
        { from: "r", to: "m", kind: "flow" },
        { from: "m", to: "g", kind: "flow", label: "nearby?" },
        { from: "m", to: "t", kind: "flow" },
      ]}
    />
  ),
  "trip-states": () => (
    <Steps
      caption="A trip as a state machine; only these transitions are legal, which keeps two drivers from accepting the same ride"
      loop="cancel is allowed from REQUESTED, MATCHED and ARRIVING"
      steps={[
        { label: "REQUESTED", tone: "muted" },
        { label: "MATCHED", note: "driver accepted", tone: "new" },
        { label: "ARRIVING", tone: "new" },
        { label: "IN_TRIP", tone: "topic" },
        { label: "COMPLETED", tone: "easy" },
        { label: "PAID", tone: "pulse" },
      ]}
    />
  ),
  "payment-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Payment system: the payment service records intent first, calls the PSP with an idempotency key, writes a double-entry ledger, and trusts the PSP's webhook + daily reconciliation for the final truth"
      nodes={[
        { id: "c", x: 6, y: 70, w: 90, title: "Checkout", shape: "pill", tone: "muted" },
        { id: "p", x: 130, y: 64, w: 130, title: "Payment svc", lines: ["status: PENDING"], tone: "topic" },
        { id: "psp", x: 320, y: 6, w: 110, title: "PSP (Razorpay)", tone: "new" },
        { id: "l", x: 320, y: 130, w: 110, title: "Ledger", lines: ["double-entry"], shape: "db", tone: "rev" },
        { id: "rec", x: 450, y: 70, w: 64, title: "Recon", tone: "pulse" },
      ]}
      edges={[
        { from: "c", to: "p", kind: "flow" },
        { from: "p", to: "psp", kind: "flow", label: "charge + key" },
        { from: "psp", to: "p", kind: "async", label: "webhook" },
        { from: "p", to: "l", kind: "flow" },
        { from: "rec", to: "l", kind: "depend" },
      ]}
    />
  ),
  ledger: () => (
    <Tables
      caption="Double-entry ledger for a ₹500 order: every payment is two rows that cancel out, so the total of all entries is always zero. If it isn't, money went missing — that's how bugs get caught"
      tables={[
        {
          name: "ledger_entries (append-only)",
          head: ["txn", "account", "debit", "credit"],
          rows: [
            ["T1", "customer_wallet", "500", ""],
            ["T1", "merchant_payable", "", "500"],
            ["T2 (fee)", "merchant_payable", "10", ""],
            ["T2 (fee)", "platform_revenue", "", "10"],
          ],
          note: "Never UPDATE a row. A refund is new opposite entries.",
        },
      ]}
    />
  ),
  "checkout-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Checkout: the cart lives in a fast store, inventory is RESERVED (not sold) with an expiry, and an order saga drives payment and confirmation, releasing the hold if anything fails"
      nodes={[
        { id: "u", x: 6, y: 74, w: 80, title: "Shopper", shape: "pill", tone: "muted" },
        { id: "cart", x: 120, y: 6, w: 110, title: "Cart svc", lines: ["Redis"], tone: "new" },
        { id: "o", x: 120, y: 120, w: 110, title: "Order saga", tone: "topic" },
        { id: "inv", x: 290, y: 6, w: 130, title: "Inventory", lines: ["reserve 10 min"], shape: "db", tone: "rev" },
        { id: "pay", x: 290, y: 120, w: 130, title: "Payment", tone: "pulse" },
        { id: "n", x: 440, y: 70, w: 74, title: "Notify", tone: "new" },
      ]}
      edges={[
        { from: "u", to: "cart", kind: "flow" },
        { from: "u", to: "o", kind: "flow", label: "place" },
        { from: "o", to: "inv", kind: "flow", label: "reserve" },
        { from: "o", to: "pay", kind: "flow", label: "charge" },
        { from: "pay", to: "n", kind: "async" },
      ]}
    />
  ),
  oversell: () => (
    <Timeline
      caption="Why 'read stock, then write' oversells: two buyers both see 1 left. Fix with one atomic conditional update: UPDATE stock SET qty = qty − 1 WHERE sku = 7 AND qty > 0"
      cols={[
        { name: "Buyer A", tone: "new" },
        { name: "Buyer B", tone: "rev" },
      ]}
      rows={[
        ["SELECT qty → 1", ""],
        ["", "SELECT qty → 1"],
        ["UPDATE qty = 0, order ✓", ""],
        ["", "UPDATE qty = 0, order ✗ (sold twice)"],
      ]}
    />
  ),
  "isr-replication": () => (
    <ClassDiagram
      width={520}
      height={170}
      caption="Each partition has a leader and followers. Followers that are caught up form the ISR (in-sync replicas). With acks=all, a write is confirmed only when every ISR member has it; if the leader dies, an ISR member takes over with no data loss"
      nodes={[
        { id: "p", x: 6, y: 60, w: 90, title: "Producer", shape: "pill", tone: "muted" },
        { id: "l", x: 150, y: 54, w: 130, title: "Leader (broker 1)", lines: ["offset 0…120"], tone: "topic" },
        { id: "f1", x: 370, y: 0, w: 140, title: "Follower (broker 2)", lines: ["0…120  in ISR ✓"], tone: "new" },
        { id: "f2", x: 370, y: 110, w: 140, title: "Follower (broker 3)", lines: ["0…80  lagging ✗"], tone: "hard" },
      ]}
      edges={[
        { from: "p", to: "l", kind: "flow", label: "acks=all" },
        { from: "f1", to: "l", kind: "async", label: "fetch" },
        { from: "f2", to: "l", kind: "async", label: "fetch" },
      ]}
    />
  ),
  "seat-lock": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Seat booking: lock the seat atomically with a TTL (SET seat NX EX 600), take payment, then confirm. If payment never comes, the lock expires and the seat frees itself"
      nodes={[
        { id: "s", x: 6, y: 24, w: 110, title: "Pick seat A7", shape: "pill", tone: "new" },
        { id: "q", x: 150, y: 6, w: 150, h: 60, title: "Lock A7 (NX, 10 min)?", shape: "diamond", tone: "pulse" },
        { id: "no", x: 360, y: 20, w: 150, title: "'Seat just taken' ✗", tone: "hard" },
        { id: "pay", x: 160, y: 104, w: 130, title: "Pay within 10 min", tone: "topic" },
        { id: "ok", x: 360, y: 90, w: 150, title: "Confirm booking ✓", tone: "easy" },
        { id: "exp", x: 360, y: 146, w: 150, title: "Timeout → lock expires", tone: "muted" },
      ]}
      edges={[
        { from: "s", to: "q", kind: "flow" },
        { from: "q", to: "no", kind: "flow", label: "taken" },
        { from: "q", to: "pay", kind: "flow", label: "got it" },
        { from: "pay", to: "ok", kind: "flow", label: "success" },
        { from: "pay", to: "exp", kind: "async", label: "no pay" },
      ]}
    />
  ),
  "metrics-arch": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="Monitoring system: collectors pull (or agents push) metrics, write them to a time-series DB that downsamples old data; dashboards query it and an alert engine evaluates rules every minute"
      nodes={[
        { id: "s", x: 6, y: 60, w: 100, title: "Services", lines: ["/metrics"], tone: "muted" },
        { id: "c", x: 140, y: 60, w: 100, title: "Collectors", lines: ["scrape 15 s"], tone: "new" },
        { id: "k", x: 270, y: 60, w: 70, title: "Kafka", tone: "muted" },
        { id: "t", x: 370, y: 4, w: 140, title: "Time-series DB", lines: ["raw 15 d, 1 h rollups 1 y"], shape: "db", tone: "topic" },
        { id: "d", x: 370, y: 130, w: 64, title: "Grafana", tone: "rev" },
        { id: "a", x: 446, y: 130, w: 68, title: "Alerts", tone: "hard" },
      ]}
      edges={[
        { from: "c", to: "s", kind: "depend", label: "pull" },
        { from: "c", to: "k", kind: "flow" },
        { from: "k", to: "t", kind: "flow" },
        { from: "d", to: "t", kind: "flow" },
        { from: "a", to: "t", kind: "flow" },
      ]}
    />
  ),
  "ot-example": () => (
    <Timeline
      caption="Two people edit 'CAT' at once. Operational transform shifts B's insert position because A's insert came first, so both screens end up with the same text"
      cols={[
        { name: "User A", tone: "new" },
        { name: "Server", tone: "topic" },
        { name: "User B", tone: "rev" },
      ]}
      rows={[
        ["doc: CAT", "doc: CAT", "doc: CAT"],
        ["insert 'S' at 3 → CATS", "", "insert '!' at 3 → CAT!"],
        ["", "A first; transform B: '!' at 3 → at 4", ""],
        ["gets '!' at 4 → CATS! ✓", "CATS!", "gets 'S' at 3 → CATS! ✓"],
      ]}
    />
  ),
  leaderboard: () => (
    <Tables
      caption="A Redis sorted set keeps members ordered by score: update in O(log n), top 10 or 'my rank' in O(log n). Perfect for a live game leaderboard"
      tables={[
        { name: "ZADD lb 980 asha · ZINCRBY lb 50 ravi", head: ["rank", "member", "score"], rows: [["1", "ravi", "1020"], ["2", "asha", "980"], ["3", "meena", "870"]], tone: "topic" },
        { name: "Queries", head: ["command", "returns"], rows: [["ZREVRANGE lb 0 9 WITHSCORES", "top 10"], ["ZREVRANK lb asha", "1 (0-based)"], ["ZSCORE lb meena", "870"]], tone: "new" },
      ]}
    />
  ),
  "scheduler-arch": () => (
    <ClassDiagram
      width={520}
      height={176}
      caption="Distributed job scheduler: jobs and their next run time live in a DB; schedulers claim due jobs with a lease (so only one runs it), push them to a queue, and workers execute and report back"
      nodes={[
        { id: "api", x: 6, y: 64, w: 90, title: "Job API", lines: ["cron, DAG"], tone: "muted" },
        { id: "db", x: 130, y: 54, w: 120, title: "Jobs DB", lines: ["next_run, lease"], shape: "db", tone: "rev" },
        { id: "s", x: 290, y: 6, w: 110, title: "Schedulers", lines: ["claim due jobs"], tone: "topic" },
        { id: "q", x: 290, y: 120, w: 110, title: "Queue", tone: "pulse" },
        { id: "w", x: 430, y: 60, w: 84, title: "Workers", tone: "new" },
      ]}
      edges={[
        { from: "api", to: "db", kind: "flow" },
        { from: "s", to: "db", kind: "flow", label: "lease" },
        { from: "s", to: "q", kind: "flow" },
        { from: "q", to: "w", kind: "flow" },
        { from: "w", to: "db", kind: "async", label: "status" },
      ]}
    />
  ),
  "job-states": () => (
    <Steps
      caption="A job run's life. A lease means 'mine until time T'; if the worker dies, the lease expires and another worker retries the run"
      loop="FAILED → RETRYING (backoff) → QUEUED, up to max attempts"
      steps={[
        { label: "SCHEDULED", tone: "muted" },
        { label: "QUEUED", tone: "new" },
        { label: "RUNNING", note: "lease held", tone: "topic" },
        { label: "SUCCEEDED", tone: "easy" },
        { label: "or FAILED", tone: "hard" },
      ]}
    />
  ),
  "instagram-arch": () => (
    <ClassDiagram
      width={520}
      height={186}
      caption="Instagram: photos go to object storage + CDN, metadata to a sharded DB, the follow graph to its own store, and a fan-out service builds each user's feed cache. Stories are the same with a 24 h TTL"
      nodes={[
        { id: "u", x: 6, y: 80, w: 80, title: "App", shape: "pill", tone: "muted" },
        { id: "up", x: 130, y: 24, w: 110, title: "Upload svc", tone: "topic" },
        { id: "s3", x: 300, y: 0, w: 110, title: "S3 + CDN", shape: "db", tone: "rev" },
        { id: "meta", x: 300, y: 56, w: 110, title: "Posts DB", lines: ["sharded"], shape: "db", tone: "rev" },
        { id: "fan", x: 300, y: 142, w: 110, title: "Fan-out", tone: "pulse" },
        { id: "g", x: 430, y: 136, w: 84, title: "Follow graph", shape: "db", tone: "new" },
        { id: "feed", x: 130, y: 142, w: 110, title: "Feed cache", tone: "new" },
      ]}
      edges={[
        { from: "u", to: "up", kind: "flow" },
        { from: "up", to: "s3", kind: "flow" },
        { from: "up", to: "meta", kind: "flow" },
        { from: "up", to: "fan", kind: "async" },
        { from: "fan", to: "g", kind: "flow" },
        { from: "fan", to: "feed", kind: "flow" },
        { from: "u", to: "feed", kind: "flow", label: "open app" },
      ]}
    />
  ),
};
