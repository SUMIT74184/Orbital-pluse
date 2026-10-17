import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getProfileStats } from "@/lib/plan";
import { formatDate } from "@/lib/dates";
import { QUESTIONS } from "@/data/catalog";
import { TRACKS } from "@/data/topics";
import { Avatar } from "@/components/Avatar";
import { DifficultyBars } from "@/components/Charts";
import { ProfileForms } from "@/components/ProfileForms";

export const metadata = { title: "Profile" };

const DIFF_TOTALS = QUESTIONS.reduce<Record<string, number>>((m, q) => ({ ...m, [q.difficulty]: (m[q.difficulty] ?? 0) + 1 }), {});

export default async function ProfilePage() {
  const user = await requireUser();
  const s = await getProfileStats(user);
  const pct = Math.round((s.solved / s.totalQuestions) * 100);

  return (
    <div className="space-y-6">
      <section className="card relative overflow-hidden p-6">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, rgb(34 229 132 / 0.35), transparent 70%)" }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={user.name} seed={user.id} size={76} />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-semibold">{user.name}</h1>
            <p className="truncate text-sm text-muted">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <Pill>Joined {formatDate(user.joined, { day: "numeric", month: "short", year: "numeric" })}</Pill>
              <Pill>
                {s.memberDays} day{s.memberDays === 1 ? "" : "s"} on Orbit-Plus
              </Pill>
              <Pill>{user.timezone}</Pill>
              <Pill>
                {user.dailyTarget} questions/day · revise on {user.revisionDays.join(", ")}
              </Pill>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
            <div className="text-right">
              <p className="font-mono text-3xl font-semibold tabular-nums text-pulse">{pct}%</p>
              <p className="text-xs text-muted">of the sheet solved</p>
            </div>
            <Link href="/settings" className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-muted hover:text-ink">
              Study settings →
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Solved" value={s.solved} sub={`of ${s.totalQuestions}`} color="var(--color-new)" />
        <Tile label="Revisions done" value={s.revisionsDone} sub={s.revisionsPending ? `${s.revisionsPending} due now` : "all caught up"} color="var(--color-rev)" />
        <Tile label="Mastered" value={s.mastered} sub="all 6 revisions done" color="var(--color-pulse)" />
        <Tile label="Current streak" value={s.currentStreak} sub={`best ${s.longestStreak} day${s.longestStreak === 1 ? "" : "s"}`} color="var(--color-topic)" />
        <Tile label="Active days" value={s.activeDays} sub={`of ${s.memberDays}`} color="var(--color-ink)" />
        <Tile label="System Design" value={s.sdDone} sub={`of ${TRACKS.sd.topics.length} topics`} color="var(--color-topic)" />
        <Tile label="MySQL" value={s.sqlDone} sub={`of ${TRACKS.sql.topics.length} topics`} color="var(--color-topic)" />
        <Tile
          label="Strongest pattern"
          value={s.strongest ? s.strongest.group : "—"}
          sub={s.strongest ? `${Math.round(s.strongest.pct * 100)}% solved` : "solve a few first"}
          color="var(--color-new)"
          small
        />
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Difficulty breakdown</h2>
        <div className="mt-4">
          <DifficultyBars byDifficulty={s.byDifficulty} totals={DIFF_TOTALS} />
        </div>
      </section>

      <ProfileForms name={user.name} email={user.email} />
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-line bg-panel-2 px-2.5 py-1 text-muted">{children}</span>;
}

function Tile({
  label,
  value,
  sub,
  color,
  small,
}: {
  label: string;
  value: number | string;
  sub: string;
  color: string;
  small?: boolean;
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-1 truncate font-semibold tabular-nums ${small ? "text-lg" : "text-2xl"}`} style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}
