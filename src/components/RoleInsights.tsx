import { LEVELS, LEVEL_LABEL, type Level } from "@/data/topics";

/*
 * "What to expect at your level" panel for the OOP & LLD track. The prep split and the
 * question-style heatmap are editorial guidance, not survey data; the coverage chart is
 * computed from the track's own topic tags.
 */

const AREAS = [
  { key: "dsa", label: "DSA", color: "var(--color-new)" },
  { key: "oop", label: "OOP & LLD", color: "var(--color-topic)" },
  { key: "hld", label: "System design", color: "var(--color-rev)" },
  { key: "beh", label: "Behavioural", color: "var(--color-pulse)" },
] as const;

const PREP_SPLIT: Record<Level, Record<(typeof AREAS)[number]["key"], number>> = {
  entry: { dsa: 60, oop: 25, hld: 5, beh: 10 },
  mid: { dsa: 40, oop: 25, hld: 20, beh: 15 },
  senior: { dsa: 30, oop: 25, hld: 30, beh: 15 },
};

// 0 = rarely, 3 = core of the round.
const STYLES: { style: string; example: string; by: Record<Level, 0 | 1 | 2 | 3> }[] = [
  { style: "Theory & definitions", example: "Overloading vs overriding?", by: { entry: 3, mid: 1, senior: 0 } },
  { style: "Write a small class", example: "Implement an immutable Money", by: { entry: 2, mid: 2, senior: 1 } },
  { style: "LLD design", example: "Design a parking lot", by: { entry: 1, mid: 3, senior: 3 } },
  { style: "Machine coding", example: "Splitwise in 90 minutes", by: { entry: 1, mid: 3, senior: 2 } },
  { style: "Patterns & trade-offs", example: "Strategy or State here?", by: { entry: 0, mid: 2, senior: 3 } },
  { style: "Code review & refactor", example: "What's wrong with this class?", by: { entry: 0, mid: 1, senior: 3 } },
  { style: "Concurrency in design", example: "Make the cache thread-safe", by: { entry: 0, mid: 1, senior: 3 } },
];
const HEAT = ["Rare", "Sometimes", "Often", "Core"];
const HEAT_ALPHA = [0.06, 0.28, 0.55, 0.9];

const LEVEL_COLOR: Record<Level, string> = { entry: "var(--color-easy)", mid: "var(--color-new)", senior: "var(--color-rev)" };

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span
      className="inline-block rounded-full border px-1.5 py-px text-[10px] font-medium leading-4"
      style={{ borderColor: LEVEL_COLOR[level], color: LEVEL_COLOR[level] }}
    >
      {LEVEL_LABEL[level].replace(" level", "")}
    </span>
  );
}

function Card({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-0.5 text-xs text-muted">{note}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function PrepSplit({ role }: { role: Level | null }) {
  return (
    <Card title="Where your prep time should go" note="Suggested split of interview prep by level — guidance, not survey data">
      <ul className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        {AREAS.map((a) => (
          <li key={a.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: a.color }} />
            {a.label}
          </li>
        ))}
      </ul>
      <div className="space-y-3">
        {LEVELS.map((l) => (
          <div key={l} className={role && role !== l ? "opacity-35" : ""}>
            <div className="mb-1 text-xs text-muted">{LEVEL_LABEL[l]}</div>
            <div className="flex h-6 gap-0.5 overflow-hidden rounded">
              {AREAS.map((a) => {
                const v = PREP_SPLIT[l][a.key];
                return (
                  <div
                    key={a.key}
                    title={`${LEVEL_LABEL[l]} · ${a.label}: ${v}%`}
                    className="flex items-center justify-center text-[10.5px] font-semibold text-black/80"
                    style={{ width: `${v}%`, background: a.color }}
                  >
                    {v >= 10 ? `${v}%` : ""}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StyleHeatmap({ role }: { role: Level | null }) {
  return (
    <Card title="How OOP gets tested" note="How often each question style shows up, by level">
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0.5 text-xs">
          <thead>
            <tr>
              <th className="text-left font-normal text-muted">Style</th>
              {LEVELS.map((l) => (
                <th key={l} className={`w-16 text-center font-normal ${role === l ? "text-ink" : "text-muted"}`}>
                  {LEVEL_LABEL[l].replace(" level", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STYLES.map((s) => (
              <tr key={s.style}>
                <td className="py-1 pr-2" title={`e.g. ${s.example}`}>
                  {s.style}
                  <span className="block text-[10.5px] text-muted">e.g. {s.example}</span>
                </td>
                {LEVELS.map((l) => (
                  <td
                    key={l}
                    title={`${s.style} at ${LEVEL_LABEL[l]}: ${HEAT[s.by[l]]}`}
                    className={`rounded text-center text-[10.5px] ${s.by[l] >= 2 ? "font-semibold text-black/80" : "text-muted"} ${role && role !== l ? "opacity-35" : ""}`}
                    style={{ background: `rgb(255 181 71 / ${HEAT_ALPHA[s.by[l]]})` }}
                  >
                    {HEAT[s.by[l]]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Coverage({ topics, role }: { topics: { section: string; levels?: Level[] }[]; role: Level | null }) {
  const sections = [...new Set(topics.map((t) => t.section))];
  const rows = sections.map((s) => {
    const inSection = topics.filter((t) => t.section === s);
    return { section: s, counts: LEVELS.map((l) => inSection.filter((t) => !t.levels?.length || t.levels.includes(l)).length) };
  });
  const max = Math.max(1, ...rows.flatMap((r) => r.counts));
  const totals = LEVELS.map((l) => topics.filter((t) => !t.levels?.length || t.levels.includes(l)).length);
  return (
    <Card title="Topics in this track by level" note="Count of topics tagged for each level, per section — what the role filter keeps">
      <ul className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
        {LEVELS.map((l, i) => (
          <li key={l} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: LEVEL_COLOR[l] }} />
            {LEVEL_LABEL[l]} <span className="tabular-nums text-ink">{totals[i]}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.section} className="grid grid-cols-[8.5rem_1fr] items-center gap-2 text-xs">
            <span className="truncate text-muted" title={r.section}>
              {r.section}
            </span>
            <div className="space-y-0.5">
              {LEVELS.map((l, i) => (
                <div key={l} className={`flex items-center gap-1.5 ${role && role !== l ? "opacity-35" : ""}`} title={`${r.section} · ${LEVEL_LABEL[l]}: ${r.counts[i]} topics`}>
                  <div className="h-1.5 rounded-r" style={{ width: `${(r.counts[i] / max) * 85}%`, minWidth: r.counts[i] ? 4 : 0, background: LEVEL_COLOR[l] }} />
                  <span className="text-[10px] tabular-nums text-muted">{r.counts[i] || ""}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function RoleInsights({ topics, role }: { topics: { section: string; levels?: Level[] }[]; role: Level | null }) {
  return (
    <details open className="group">
      <summary className="mb-3 cursor-pointer select-none text-xs font-medium uppercase tracking-widest text-topic marker:content-none">
        <span className="mr-1 inline-block transition group-open:rotate-90">▸</span> What to expect at your level
      </summary>
      <div className="grid gap-3 lg:grid-cols-3">
        <PrepSplit role={role} />
        <StyleHeatmap role={role} />
        <Coverage topics={topics} role={role} />
      </div>
    </details>
  );
}
