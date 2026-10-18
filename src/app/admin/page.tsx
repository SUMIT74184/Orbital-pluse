import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getOverview, type FeedItem } from "@/lib/admin";
import { formatDate } from "@/lib/dates";
import { Card, DayBars, RankBars, StatTile, pct, timeAgo } from "@/components/admin/AdminCharts";

export const metadata = { title: "Overview" };

const VERB: Record<FeedItem["type"], string> = {
  signup: "signed up",
  login: "logged in",
  solve: "solved",
  revise: "revised",
  topic: "finished",
};

export default async function AdminOverview() {
  const admin = await requireAdmin();
  const o = await getOverview(admin);
  const t = o.totals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Last 30 days, up to {formatDate(o.today, { weekday: "short", day: "numeric", month: "short" })} ({admin.timezone}). A user is
          active on a day they open the app.
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Users" value={t.users} sub={`+${t.new7} this week · +${t.new30} in 30 days`} />
        <StatTile label="DAU" value={t.dau} sub="active today" color="var(--color-pulse)" />
        <StatTile label="WAU" value={t.wau} sub="active in 7 days" color="var(--color-pulse)" />
        <StatTile label="MAU" value={t.mau} sub="active in 30 days" color="var(--color-pulse)" />
        <StatTile label="Stickiness" value={pct(t.mau ? t.stickiness : null)} sub="DAU ÷ MAU" />
        <StatTile label="Dormant" value={t.dormant} sub="no visit in 14+ days" color={t.dormant ? "var(--color-hard)" : undefined} />
        <StatTile label="Users with a goal" value={o.goals.withGoal} sub={t.users ? `${pct(o.goals.withGoal / t.users)} of users` : "—"} />
        <StatTile label="Daily-target hit rate" value={pct(o.goals.hitRate)} sub={`over ${o.goals.planDays} plan days`} color="var(--color-new)" />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <DayBars title="Daily active users" days={o.days.map((d) => ({ date: d.date, n: d.active }))} unit="active users" />
        <DayBars title="New signups" days={o.days.map((d) => ({ date: d.date, n: d.signups }))} unit="signups" color="var(--color-new)" />
        <DayBars title="Questions solved" days={o.days.map((d) => ({ date: d.date, n: d.solved }))} unit="solved" color="var(--color-new)" />
        <DayBars title="Revisions done" days={o.days.map((d) => ({ date: d.date, n: d.revised }))} unit="revisions" color="var(--color-rev)" />
      </div>

      <h2 className="pt-2 text-lg font-semibold">What people study</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Most studied DSA patterns" sub="Solves + revisions · active users" className="lg:col-span-2">
          <RankBars
            rows={o.patterns.slice(0, 12).map((p) => ({ label: p.group, n: p.solves + p.revisions, note: `${p.users} user${p.users === 1 ? "" : "s"}` }))}
            empty="Nobody has solved anything in the last 30 days"
          />
        </Card>
        <Card title="Solves by difficulty">
          <RankBars
            rows={(["Easy", "Medium", "Hard"] as const).map((k) => ({ label: k, n: o.byDifficulty[k] }))}
            color="var(--color-medium)"
          />
        </Card>
        <Card title="Most solved questions" className="lg:col-span-2">
          {o.topQuestions.length ? (
            <ol className="divide-y divide-line text-sm">
              {o.topQuestions.map(({ q, n }) => (
                <li key={q!.id} className="flex items-center gap-3 py-2">
                  <span className="w-8 font-mono text-xs text-muted">#{q!.id}</span>
                  <a href={q!.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate hover:text-pulse">
                    {q!.title}
                  </a>
                  <span className="text-xs text-muted">{q!.group}</span>
                  <span className="w-8 text-right font-mono text-xs tabular-nums">{n}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-4 text-center text-sm text-muted">No solves yet</p>
          )}
        </Card>
        <Card title="Most finished track topics">
          <RankBars rows={o.topTopics.map((x) => ({ label: x.title, n: x.n, note: x.track }))} color="var(--color-topic)" />
        </Card>
      </div>

      <Card title="Areas of interest" sub="Declared = picked in their goal · Enabled = gets a daily topic · Active = did something there in 30 days">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-sm">
            <thead className="text-left text-xs text-muted">
              <tr>
                <th className="pb-2 font-medium">Area</th>
                <th className="pb-2 text-right font-medium">Declared</th>
                <th className="pb-2 text-right font-medium">Enabled</th>
                <th className="pb-2 text-right font-medium">Active users</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {o.areas.map((a) => (
                <tr key={a.key}>
                  <td className="py-2">{a.name}</td>
                  <td className="py-2 text-right font-mono tabular-nums">{a.declared}</td>
                  <td className="py-2 text-right font-mono tabular-nums">{a.enabled}</td>
                  <td className="py-2 text-right font-mono tabular-nums text-pulse">{a.activeUsers}</td>
                  <td className="py-2 text-right font-mono tabular-nums">{a.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <h2 className="pt-2 text-lg font-semibold">Goals</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Target roles">
          <RankBars rows={o.goals.roles} color="var(--color-pulse)" empty="No one has set a role" />
        </Card>
        <Card title="Target companies">
          <RankBars rows={o.goals.companies} color="var(--color-pulse)" empty="No companies listed" />
        </Card>
        <Card title="Time to target date">
          <RankBars rows={o.goals.timeline} color="var(--color-pulse)" empty="No target dates" />
        </Card>
        <Card title="Self-rated level">
          <RankBars rows={o.goals.levels.map((l) => ({ ...l, label: l.label[0].toUpperCase() + l.label.slice(1) }))} color="var(--color-pulse)" empty="No levels set" />
        </Card>
        <Card title="Daily question target" sub={o.goals.avgHours != null ? `Average study time: ${o.goals.avgHours.toFixed(1)} h/week` : undefined}>
          <RankBars rows={o.goals.dailyTargets.map((d) => ({ label: `${d.label} / day`, n: d.n }))} color="var(--color-new)" />
        </Card>
        <Card title="Recent activity" sub={<Link href="/admin/users" className="hover:text-ink">All users →</Link>}>
          <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 text-sm">
            {o.recent.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-16 shrink-0 text-xs text-muted">{timeAgo(e.at)}</span>
                <span className="min-w-0">
                  <Link href={`/admin/users/${e.userId}`} className="font-medium hover:text-pulse">
                    {e.userName}
                  </Link>{" "}
                  <span className="text-muted">{VERB[e.type]}</span> {e.label && <span className="text-ink/90">{e.label}</span>}
                </span>
              </li>
            ))}
            {!o.recent.length && <li className="py-4 text-center text-muted">No activity recorded yet</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
