import Link from "next/link";
import { TopicToggle } from "@/components/Toggles";
import { LevelBadge } from "@/components/RoleInsights";
import { RichText, Inline } from "@/components/RichText";
import { QAVisual } from "@/components/QAVisuals";
import { TrackNav, TrackShell, type NavTopic, type OutlineItem } from "@/components/tracks/TrackNav";
import { CodeTabs, LangProvider } from "@/components/tracks/LangCode";
import { Highlight } from "@/components/tracks/Highlight";
import { formatDate } from "@/lib/dates";
import type { CatalogTopic } from "@/lib/catalog";
import type { InterviewQA } from "@/data/interview";
import type { TopicGuide } from "@/data/guides";
import type { Level } from "@/data/topics";
import { LANGS, dedent, langOf, type Code, type Lang } from "@/data/langs";

/** A topic's page: the plain-language guide, then interview questions, with the track's topic list alongside. */
export function TopicView({
  trackKey: key,
  trackName,
  trackTopics,
  topic,
  topics,
  nav,
  role,
  hasLevels,
  guide,
  qa,
  doneOn,
  lang,
}: {
  trackKey: string;
  trackName: string;
  /** Every live topic in the track, for numbering. */
  trackTopics: CatalogTopic[];
  topic: CatalogTopic;
  /** Topics after the role filter, for previous / next. */
  topics: CatalogTopic[];
  nav: NavTopic[];
  role: Level | null;
  hasLevels: boolean;
  guide: TopicGuide | null;
  qa: InterviewQA[];
  doneOn?: string;
  /** Which language code blocks open on (Programming track). */
  lang: Lang;
}) {
  const id = topic.id;
  const i = topics.findIndex((t) => t.id === id);
  const prev = topics[i - 1];
  const next = topics[i + 1];
  const q = role ? `?role=${role}` : "";
  // Programming track: the languages this lesson's code is in, and for a one-language lesson, the other one.
  const only = guide?.lang ? langOf(guide.lang) : null;
  const langs = only ? [only] : LANGS;
  const other = only && LANGS.find((l) => l.key !== only.key)!;

  const outline: OutlineItem[] = [
    ...(guide
      ? [
          { id: "simple", label: "In simple words" },
          { id: "analogy", label: "Real-life example" },
          ...(guide.visual ? [{ id: "diagram", label: "Diagram" }] : []),
          ...(guide.how ? [{ id: "how", label: "How it works" }] : []),
          { id: "concepts", label: "Key concepts" },
          ...(guide.syntax ? [{ id: "syntax", label: only ? `${only.label} cheat sheet` : "Syntax: Java vs Python" }] : []),
          ...(guide.code?.length ? [{ id: "code", label: "Code" }] : []),
          ...(guide.example ? [{ id: "example", label: "Example" }] : []),
          ...(guide.compare ? [{ id: "compare", label: "Side by side" }] : []),
          ...(guide.mistakes?.length ? [{ id: "mistakes", label: "Common mistakes" }] : []),
          ...(guide.exercises?.length ? [{ id: "try", label: "Try it yourself" }] : []),
          ...(guide.other && other ? [{ id: "other", label: `In ${other.label}` }] : []),
        ]
      : []),
    ...qa.map((x, n) => ({ id: `q-${n + 1}`, label: `Q${n + 1}. ${x.q}` })),
    ...(topic.practice?.length ? [{ id: "read", label: "Read & practise" }] : []),
  ];

  return (
    <TrackShell nav={<TrackNav trackKey={key} trackName={trackName} topics={nav} currentId={id} outline={outline} role={role} hasLevels={hasLevels} />}>
      <LangProvider initial={lang}>
      <article className="mx-auto max-w-3xl space-y-6 pb-10">
        <header className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-topic">
            <Link href={`/tracks/${key}${q}`} className="hover:underline">
              {trackName}
            </Link>{" "}
            › {topic.section} · topic {trackTopics.indexOf(topic) + 1}/{trackTopics.length}
          </p>
          <h1 className="text-2xl font-semibold leading-tight sm:text-3xl">{topic.title}</h1>
          {only && other && (
            <p className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: `${only.color}55`, background: `${only.color}12` }}>
              <span className="rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-bg" style={{ background: only.color }}>
                {only.label} only
              </span>
              <span className="text-ink/85">
                Everything on this page is {only.label}. {guide?.other ? `The last section shows what ${other.label} uses instead.` : ""}
              </span>
            </p>
          )}
          {topic.levels?.length ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
              Asked at {topic.levels.map((l) => <LevelBadge key={l} level={l} />)}
            </div>
          ) : null}
          <div className="flex items-center gap-2.5 text-sm">
            <TopicToggle kind={key} id={id} done={!!doneOn} />
            <span className={doneOn ? "text-pulse" : "text-muted"}>{doneOn ? `Done on ${formatDate(doneOn)}` : "Mark as done when you can explain it"}</span>
          </div>
          {topic.points.length > 0 && (
            <div className="rounded-xl border border-line bg-panel/60 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">You&apos;ll be able to explain</p>
              <ul className="mt-1.5 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {topic.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-topic">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {guide && (
          <>
            <Block id="simple" title="In simple words">
              <RichText text={guide.simple} className="text-[15px]" />
            </Block>
            <Block id="analogy" title="Real-life example" accent="var(--color-pulse)">
              <RichText text={guide.analogy} />
            </Block>
            {guide.visual && (
              <Block id="diagram" title="Diagram">
                <QAVisual name={guide.visual} />
              </Block>
            )}
            {guide.how && (
              <Block id="how" title="How it works, step by step" accent="var(--color-new)">
                {guide.how.visual && <QAVisual name={guide.how.visual} />}
                <ol className="mt-3 space-y-2">
                  {guide.how.steps.map((step, n) => (
                    <li key={n} className="flex gap-3 text-sm">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-new/60 font-mono text-[10.5px] text-new">{n + 1}</span>
                      <span className="leading-relaxed">
                        <Inline text={step} />
                      </span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}
            <Block id="concepts" title="Key concepts">
              <dl className="grid gap-2 sm:grid-cols-2">
                {guide.concepts.map((c) => (
                  <div key={c.term} className="rounded-lg border border-line bg-bg/50 px-3 py-2">
                    <dt className="text-sm font-semibold text-topic">{c.term}</dt>
                    <dd className="mt-0.5 text-sm text-ink/80">
                      <Inline text={c.meaning} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Block>
            {guide.syntax && (
              <Block id="syntax" title={only ? `${only.label} cheat sheet` : "Syntax: Java vs Python"}>
                <div className="overflow-x-auto">
                  <table className={`w-full border-collapse text-sm ${only ? "min-w-[24rem]" : "min-w-[30rem]"}`}>
                    <thead>
                      <tr>
                        <th className="border-b border-line px-3 py-2 text-left font-semibold text-muted">To do this</th>
                        {langs.map((l) => (
                          <th key={l.key} className="border-b border-line px-3 py-2 text-left font-semibold">
                            <span className="flex items-center gap-2" style={{ color: l.color }}>
                              <span className="size-2 rounded-full" style={{ background: l.color }} />
                              {l.label}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {guide.syntax.map((r) => (
                        <tr key={r.task} className="border-b border-line/60 last:border-0">
                          <td className="px-3 py-2 align-top text-ink/85">
                            <Inline text={r.task} />
                          </td>
                          {langs.map((l) => (
                            <td key={l.key} className="whitespace-pre px-3 py-2 align-top font-mono text-[12px] text-[#d6deeb]">
                              <Highlight code={r[l.key] ?? ""} lang={l.key} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Block>
            )}
            {guide.code?.length ? (
              <Block id="code" title="Code" accent="var(--color-new)">
                <div className="space-y-5">
                  {guide.code.map((c) => (
                    <div key={c.title} className="space-y-2">
                      <h3 className="text-sm font-semibold">{c.title}</h3>
                      {c.note && <RichText text={c.note} />}
                      <CodeTabs code={dedentCode(c)} input={c.input && dedent(c.input)} output={c.output && (typeof c.output === "string" ? dedent(c.output) : dedentCode(c.output))} />
                    </div>
                  ))}
                </div>
              </Block>
            ) : null}
            {guide.example && (
              <Block id="example" title="Example">
                <RichText text={guide.example} />
              </Block>
            )}
            {guide.compare && (
              <Block id="compare" title="Side by side">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[28rem] border-collapse text-sm">
                    <thead>
                      <tr>
                        {guide.compare.head.map((h, n) => (
                          <th key={n} className={`border-b border-line px-3 py-2 text-left font-semibold ${n ? "text-topic" : "text-muted"}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {guide.compare.rows.map((r, n) => (
                        <tr key={n} className="border-b border-line/60 last:border-0">
                          {r.map((cell, m) => (
                            <td key={m} className={`px-3 py-2 align-top ${m ? "text-ink/85" : "font-medium text-muted"}`}>
                              <Inline text={cell} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Block>
            )}
            {guide.mistakes?.length ? (
              <Block id="mistakes" title="Common mistakes" accent="var(--color-hard)">
                <ul className="space-y-1.5 text-sm">
                  {guide.mistakes.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="text-hard">✗</span>
                      <span>
                        <Inline text={m} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Block>
            ) : null}
            <div className="rounded-xl border border-topic/40 bg-topic/10 px-4 py-3 text-sm">
              <span className="mr-2 font-semibold text-topic">Remember:</span>
              <Inline text={guide.remember} />
            </div>
            {guide.exercises?.length ? (
              <Block id="try" title="Try it yourself" accent="var(--color-pulse)">
                <ol className="space-y-5">
                  {guide.exercises.map((ex, n) => (
                    <li key={n} className="space-y-2">
                      <p className="flex gap-2 text-sm font-medium">
                        <span className="font-mono text-xs leading-5 text-pulse">#{n + 1}</span>
                        <span>
                          <Inline text={ex.q} />
                        </span>
                      </p>
                      <pre className="overflow-x-auto rounded-lg border border-line bg-[#0d1117] px-4 py-2.5 font-mono text-[12.5px] leading-6 text-ink/85">{dedent(ex.example)}</pre>
                      {ex.hint && (
                        <details className="text-sm">
                          <summary className="cursor-pointer select-none text-muted hover:text-ink">Hint</summary>
                          <p className="mt-1.5 pl-4 text-ink/85">
                            <Inline text={ex.hint} />
                          </p>
                        </details>
                      )}
                      <details className="text-sm">
                        <summary className="cursor-pointer select-none font-medium text-topic hover:underline">Show solution</summary>
                        <div className="mt-2">
                          <CodeTabs code={dedentCode(ex)} input={ex.input && dedent(ex.input)} output={dedent(ex.output)} />
                        </div>
                      </details>
                    </li>
                  ))}
                </ol>
              </Block>
            ) : null}
            {guide.other && only && other && (
              <Block id="other" title={`In ${other.label}`} accent={other.color}>
                <RichText text={guide.other.note} />
                {guide.other.rows?.length ? (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[24rem] border-collapse text-sm">
                      <thead>
                        <tr>
                          {[only, other].map((l) => (
                            <th key={l.key} className="border-b border-line px-3 py-2 text-left font-semibold" style={{ color: l.color }}>
                              {l.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {guide.other.rows.map((r, n) => (
                          <tr key={n} className="border-b border-line/60 last:border-0">
                            {r.map((cell, m) => (
                              <td key={m} className="px-3 py-2 align-top text-ink/85">
                                <Inline text={cell} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </Block>
            )}
          </>
        )}

        {qa.length > 0 && (
          <section className="space-y-3">
            <h2 className="pt-2 text-lg font-semibold">Interview questions</h2>
            {qa.map((item, n) => (
              <details key={n} id={`q-${n + 1}`} open className="group scroll-mt-4 rounded-xl border border-line bg-panel">
                <summary className="flex cursor-pointer select-none gap-3 px-4 py-3 text-[15px] font-medium marker:content-none">
                  <span className="font-mono text-xs leading-6 text-topic">Q{n + 1}</span>
                  <span className="flex-1">{item.q}</span>
                  <span className="text-xs leading-6 text-muted transition group-open:rotate-90">▸</span>
                </summary>
                <div className="space-y-3 border-t border-line px-4 py-3">
                  {item.short && (
                    <p className="rounded-lg bg-pulse/10 px-3 py-2 text-sm">
                      <span className="mr-1.5 font-semibold text-pulse">In short:</span>
                      <Inline text={item.short} />
                    </p>
                  )}
                  {item.visual && item.visual !== guide?.visual && item.visual !== guide?.how?.visual && <QAVisual name={item.visual} />}
                  <RichText text={item.a} />
                </div>
              </details>
            ))}
          </section>
        )}

        {topic.practice?.length ? (
          <Block id="read" title="Read & practise">
            <div className="flex flex-wrap gap-2">
              {topic.practice.map((p) => (
                <a
                  key={p.url}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-line px-2.5 py-1.5 text-xs hover:border-topic hover:text-topic"
                >
                  {p.title} ↗
                </a>
              ))}
            </div>
          </Block>
        ) : null}

        <nav className="grid gap-3 border-t border-line pt-5 sm:grid-cols-2" aria-label="Previous and next topic">
          {prev ? (
            <Link href={`/tracks/${key}/${prev.id}${q}`} className="card px-4 py-3 hover:border-topic">
              <span className="text-xs text-muted">← Previous</span>
              <span className="mt-0.5 block text-sm font-medium">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/tracks/${key}/${next.id}${q}`} className="card px-4 py-3 text-right hover:border-topic">
              <span className="text-xs text-muted">Next →</span>
              <span className="mt-0.5 block text-sm font-medium">{next.title}</span>
            </Link>
          )}
        </nav>
      </article>
      </LangProvider>
    </TrackShell>
  );
}

/** Dedents each language's version, keeping only the languages the snippet is written in. */
const dedentCode = (c: Code): Code =>
  Object.fromEntries(
    LANGS.flatMap((l) => {
      const v = c[l.key];
      return v === undefined ? [] : [[l.key, dedent(v)]];
    }),
  );

function Block({ id, title, accent = "var(--color-topic)", children }: { id: string; title: string; accent?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted">
        <span className="h-3.5 w-1 rounded-full" style={{ background: accent }} />
        {title}
      </h2>
      <div className="card px-4 py-3.5">{children}</div>
    </section>
  );
}
