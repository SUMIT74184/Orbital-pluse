import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboard } from "@/lib/plan";
import { formatDate } from "@/lib/dates";
import { getCatalog } from "@/lib/catalog";
import { MarketChart } from "@/components/MarketChart";
import { ActivityBars, DifficultyBars, PatternRadar, TodayProgress } from "@/components/Charts";
import { ReviseToggle, SolveToggle, TopicToggle } from "@/components/Toggles";
import { QuestionTitle } from "@/components/QuestionBits";

export const metadata = { title: "Dashboard" };

function greeting(timezone: string) {
  const h = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: timezone }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function Dashboard() {
  const user = await requireUser();
  const [d, cat] = await Promise.all([getDashboard(user), getCatalog()]);
  const newDone = d.newItems.filter((i) => i.solvedOn).length;
  const revDone = d.revisions.filter((r) => r.done).length;
  const trackDone = d.stats.tracks.reduce((n, t) => n + t.done, 0);
  const trackTotal = d.stats.tracks.reduce((n, t) => n + t.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            {formatDate(d.today, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            {greeting(user.timezone)}, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted self-center mr-1">Today&apos;s DSA topics:</span>
          {d.weekdayGroups.length ? (
            d.weekdayGroups.map((g) => (
              <span key={g} className="rounded-full border border-new/30 bg-new/10 px-2.5 py-1 text-xs text-new">
                {g}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted">none set — see Settings</span>
          )}
        </div>
      </div>

      {!user.goal && (
        <Link
          href="/profile#goal"
          className="card flex flex-wrap items-center justify-between gap-2 border-pulse/30 px-4 py-3 text-sm hover:border-pulse/60"
        >
          <span>
            <span className="font-semibold text-pulse">Set your goal</span>
            <span className="text-muted"> — target role, companies and date, so your prep has a finish line.</span>
          </span>
          <span className="text-xs text-muted">Profile →</span>
        </Link>
      )}

      {/* Where you stand today, next to the pattern radar. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <TodayProgress
            percent={d.percent}
            done={d.done}
            total={d.total}
            parts={[
              { label: "New questions", done: newDone, total: d.newItems.length, color: "var(--color-new)" },
              { label: "Revisions", done: revDone, total: d.revisions.length, color: "var(--color-rev)" },
              ...d.topics.map((t) => ({ label: t.trackName, done: t.done ? 1 : 0, total: 1, color: "var(--color-topic)" })),
            ]}
          />
          <section className="card grid flex-1 grid-cols-2 content-between gap-4 p-5">
            <Stat label="Solved" value={`${d.stats.solved}`} sub={`of ${d.stats.totalQuestions}`} />
            <Stat label="Streak" value={`${d.streak}`} sub={d.streak === 1 ? "day" : "days"} />
            <Stat label="Revisions" value={`${d.stats.revisionsDone}`} sub={`of ${d.stats.revisionsTotal} scheduled`} />
            <Stat
              label={d.stats.tracks.length === 2 ? d.stats.tracks.map((t) => t.name).join(" / ") : "Track topics"}
              value={d.stats.tracks.length === 2 ? d.stats.tracks.map((t) => t.done).join(" / ") : `${trackDone}`}
              sub={`of ${d.stats.tracks.length === 2 ? d.stats.tracks.map((t) => t.total).join(" / ") : trackTotal}`}
            />
            <div className="col-span-2">
              <DifficultyBars byDifficulty={d.stats.byDifficulty} totals={cat.diffTotals} />
            </div>
          </section>
        </div>
        <PatternRadar groups={d.stats.byGroup} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Panel title="New questions" accent="var(--color-new)" count={`${newDone}/${d.newItems.length}`}>
            {d.newItems.length === 0 ? (
              <Empty>Every question in the sheet is assigned — legend. Keep revising!</Empty>
            ) : (
              d.newItems.map(({ q, solvedOn }) => (
                <Row key={q.id}>
                  <SolveToggle qid={q.id} solved={!!solvedOn} />
                  <QuestionTitle q={q} muted={!!solvedOn} />
                </Row>
              ))
            )}
          </Panel>

          <Panel
            title="Revise today"
            accent="var(--color-rev)"
            count={`${revDone}/${d.revisions.length}`}
            action={<Link href="/schedule" className="text-xs text-muted hover:text-ink">Upcoming →</Link>}
          >
            {d.revisions.length === 0 ? (
              <Empty>Nothing due. Revisions show up {user.revisionDays.join(", ")} days after you solve a question.</Empty>
            ) : (
              d.revisions.map((r) => (
                <Row key={r.q.id}>
                  <ReviseToggle qid={r.q.id} done={r.done} />
                  <div className="min-w-0 flex-1">
                    <QuestionTitle q={r.q} muted={r.done} />
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <div className="font-mono text-rev">
                      R{r.revNo}/{r.revTotal}
                    </div>
                    {!r.done && r.overdueBy > 0 && <div className="text-hard">{r.overdueBy}d late</div>}
                  </div>
                </Row>
              ))
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          {d.topics.map((t) => (
            <Panel
              key={t.kind}
              title={`${t.trackName} · topic ${t.position || "–"}/${t.trackTotal}`}
              accent="var(--color-topic)"
              count={t.done ? "done" : "today"}
            >
              <div className="flex gap-3 px-4 py-3.5">
                <TopicToggle kind={t.kind} id={t.topic.id} done={t.done} />
                <div className="min-w-0">
                  <p className={`font-medium ${t.done ? "text-muted line-through" : ""}`}>{t.topic.title}</p>
                  <p className="text-xs text-muted">{t.topic.section}</p>
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-sm text-muted marker:text-topic">
                    {t.topic.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  {t.topic.practice && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {t.topic.practice.map((p) => (
                        <a
                          key={p.url}
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-line px-2 py-1 text-xs hover:border-topic hover:text-topic"
                        >
                          {p.title} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          ))}

          {d.missed.length > 0 && (
            <Panel title="Backlog from earlier days" accent="var(--color-hard)" count={`${d.missed.length}`}>
              {d.missed.slice(0, 8).map(({ q, assignedOn }) => (
                <Row key={q.id}>
                  <SolveToggle qid={q.id} solved={false} />
                  <div className="min-w-0 flex-1">
                    <QuestionTitle q={q} />
                  </div>
                  <span className="shrink-0 text-xs text-muted">{formatDate(assignedOn)}</span>
                </Row>
              ))}
              {d.missed.length > 8 && (
                <Link href="/questions?status=backlog" className="block px-4 py-2.5 text-xs text-muted hover:text-ink">
                  +{d.missed.length - 8} more in Questions →
                </Link>
              )}
            </Panel>
          )}
        </div>
      </div>

      {/* Trends over time. */}
      <MarketChart
        days={d.days}
        joined={user.joined}
        streak={d.streak}
        targetPoints={user.dailyTarget * 3 + d.stats.tracks.filter((t) => t.on).length * 2}
      />
      <ActivityBars days={d.days.slice(-14)} />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

function Panel({
  title,
  accent,
  count,
  action,
  children,
}: {
  title: string;
  accent: string;
  count: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <h2 className="font-semibold">{title}</h2>
        <span className="rounded-full bg-panel-2 px-2 py-0.5 font-mono text-xs text-muted">{count}</span>
        <div className="ml-auto">{action}</div>
      </div>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-start gap-3 px-4 py-3">{children}</div>;
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-4 py-6 text-center text-sm text-muted">{children}</p>;
}
