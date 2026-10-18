import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getUserDetail } from "@/lib/admin";
import { formatDate } from "@/lib/dates";
import { Avatar } from "@/components/Avatar";
import { ActivityBars, DifficultyBars, GroupBars } from "@/components/Charts";
import { Card, StatTile, pct, timeAgo } from "@/components/admin/AdminCharts";

export const metadata = { title: "User" };

export default async function AdminUser({ params }: PageProps<"/admin/users/[id]">) {
  await requireAdmin();
  const d = await getUserDetail((await params).id);
  if (!d) notFound();
  const { user: u, stats: s } = d;
  const goal = u.goal;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-sm text-muted hover:text-ink">
        ← All users
      </Link>
      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar name={u.name} seed={u.id} size={60} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{u.name}</h1>
          <p className="truncate text-sm text-muted">{u.email}</p>
          <p className="mt-1 text-xs text-muted">
            Joined {formatDate(u.joined, { day: "numeric", month: "short", year: "numeric" })} · last seen {timeAgo(d.lastSeenAt)} · {u.timezone} ·{" "}
            {u.dailyTarget}/day · reminders {u.reminders.daily ? `daily at ${u.reminders.hour}:00` : "off"}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Solved" value={s.solved} sub={`of ${s.totalQuestions}`} color="var(--color-new)" />
        <StatTile label="Revisions done" value={s.revisionsDone} sub={`${s.revisionsPending} due now`} color="var(--color-rev)" />
        <StatTile label="Active days (30d)" value={d.active30} sub={`${s.activeDays} days with work, all time`} />
        <StatTile
          label="Daily-target hit rate"
          value={pct(d.hitRate?.pct ?? null)}
          sub={d.hitRate ? `${d.hitRate.hit} of ${d.hitRate.total} plan days` : "no plans in 30 days"}
        />
        <StatTile label="Streak" value={s.currentStreak} sub={`best ${s.longestStreak}`} color="var(--color-pulse)" />
        <StatTile label="Mastered" value={s.mastered} sub="every revision done" />
        {s.tracks.map((t) => (
          <StatTile key={t.key} label={t.name} value={t.done} sub={`of ${t.total} topics${t.on ? "" : " · off"}`} color="var(--color-topic)" />
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Goal">
          {goal ? (
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-sm">
              <dt className="text-muted">Role</dt>
              <dd>{goal.role ?? "—"}</dd>
              <dt className="text-muted">Companies</dt>
              <dd>{goal.companies.join(", ") || "—"}</dd>
              <dt className="text-muted">Target date</dt>
              <dd>{goal.targetDate ? formatDate(goal.targetDate, { day: "numeric", month: "short", year: "numeric" }) : "—"}</dd>
              <dt className="text-muted">Level</dt>
              <dd className="capitalize">{goal.level ?? "—"}</dd>
              <dt className="text-muted">Hours / week</dt>
              <dd>{goal.hoursPerWeek ?? "—"}</dd>
              <dt className="text-muted">Interested in</dt>
              <dd>{goal.interests.map((k) => d.areaNames[k] ?? k).join(", ") || "—"}</dd>
            </dl>
          ) : (
            <p className="text-sm text-muted">No goal set yet.</p>
          )}
        </Card>
        <Card title="Recent activity">
          <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1 text-sm">
            {d.events.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-16 shrink-0 text-xs text-muted">{timeAgo(e.at)}</span>
                <span className="capitalize text-muted">{e.type}</span>
                {e.label && <span className="min-w-0 truncate">{e.label}</span>}
              </li>
            ))}
            {!d.events.length && <li className="text-muted">Nothing recorded yet.</li>}
          </ul>
        </Card>
      </div>

      <ActivityBars days={d.days} />
      <div className="grid gap-4 lg:grid-cols-2">
        <GroupBars groups={d.patterns} />
        <Card title="Difficulty">
          <DifficultyBars byDifficulty={s.byDifficulty} totals={d.diffTotals} />
        </Card>
      </div>
    </div>
  );
}
