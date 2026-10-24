import Link from "next/link";
import type { AppUser } from "@/lib/auth";
import { getDashboard } from "@/lib/plan";
import { getCatalog } from "@/lib/catalog";
import { diffDays, formatDate } from "@/lib/dates";
import { dailyInterviewQA } from "@/data/interview";
import { Icon, type IconName } from "./Icons";

const DIFF_COLOR = { Easy: "var(--color-easy)", Medium: "var(--color-medium)", Hard: "var(--color-hard)" } as const;

export async function RailContent({ user }: { user: AppUser }) {
  const [d, cat] = await Promise.all([getDashboard(user), getCatalog()]);
  const revs = d.revisions.filter((r) => !r.done);
  const fresh = d.newItems.filter((i) => !i.solvedOn);
  const topics = d.topics.filter((t) => !t.done);
  const left = revs.length + fresh.length + topics.length;
  const goal = user.goal;
  const daysLeft = goal?.targetDate ? diffDays(goal.targetDate, d.today) : null;
  const tip = dailyInterviewQA(d.today);
  const when = (at: Date | null) =>
    at &&
    new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: user.timezone }).format(at);

  return (
    <div>
      <Section title="Today's focus" icon="focus" color="var(--color-new)" meta={`${d.percent}%`}>
        <div className="flex items-center gap-3">
          <Ring percent={d.percent} />
          <div className="min-w-0 text-xs text-muted">
            <p className="text-sm font-medium text-ink">
              {d.done} of {d.total} done
            </p>
            <p>
              {revs.length} revision{revs.length === 1 ? "" : "s"} · {fresh.length} new · {topics.length} topic{topics.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        {left === 0 ? (
          <p className="mt-3 rounded-lg bg-pulse/10 px-3 py-2 text-xs text-pulse">All clear for today. Nice work!</p>
        ) : (
          <ul className="mt-3 space-y-0.5">
            {revs.slice(0, 3).map((r) => (
              <FocusRow
                key={`r${r.q.id}`}
                href={r.q.url}
                color="var(--color-rev)"
                label={r.q.title}
                meta={r.overdueBy > 0 ? `${r.overdueBy}d late` : `R${r.revNo}`}
                late={r.overdueBy > 0}
              />
            ))}
            {fresh.slice(0, 3).map(({ q }) => (
              <FocusRow key={`n${q.id}`} href={q.url} color="var(--color-new)" label={q.title} meta={q.difficulty} />
            ))}
            {topics.slice(0, 2).map((t) => (
              <FocusRow key={`t${t.kind}`} href="/dashboard" color="var(--color-topic)" label={t.topic.title} meta={t.trackName} internal />
            ))}
          </ul>
        )}
        <Link href="/dashboard" className="mt-2 inline-block text-xs text-muted hover:text-ink">
          Open today&apos;s plan →
        </Link>
      </Section>

      <Section title="Streak & progress" icon="flame" color="var(--color-topic)" meta={`${d.streak}d`}>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-semibold tabular-nums">{d.streak}</span>
          <span className="text-xs text-muted">day streak</span>
        </div>
        <Heatmap days={d.days.slice(-28)} />
        <div className="mt-4 space-y-2">
          <Bar label="Solved" done={d.stats.solved} total={d.stats.totalQuestions} color="var(--color-pulse)" />
          {(["Easy", "Medium", "Hard"] as const).map((k) => (
            <Bar key={k} label={k} done={d.stats.byDifficulty[k]} total={cat.diffTotals[k]} color={DIFF_COLOR[k]} />
          ))}
          {d.stats.tracks.map((t) => (
            <Bar key={t.key} label={t.name} done={t.done} total={t.total} color="var(--color-topic)" />
          ))}
        </div>
      </Section>

      <Section title="Goal & reminders" icon="flag" color="var(--color-pulse)">
        {goal ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium">
              {goal.role ?? "Interview prep"}
              {goal.level && <span className="ml-1.5 text-xs font-normal capitalize text-muted">· {goal.level}</span>}
            </p>
            {goal.companies.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {goal.companies.slice(0, 4).map((c) => (
                  <span key={c} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                    {c}
                  </span>
                ))}
                {goal.companies.length > 4 && <span className="px-1 py-0.5 text-[11px] text-muted">+{goal.companies.length - 4}</span>}
              </div>
            )}
            {daysLeft != null && (
              <p className="text-xs text-muted">
                <span className={`font-mono font-semibold ${daysLeft < 0 ? "text-hard" : "text-pulse"}`}>
                  {daysLeft < 0 ? "Target passed" : daysLeft === 0 ? "Today!" : `${daysLeft} days`}
                </span>{" "}
                {daysLeft > 0 && "to go · "}
                {formatDate(goal.targetDate!, { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            {goal.hoursPerWeek != null && <p className="text-xs text-muted">{goal.hoursPerWeek} h / week planned</p>}
          </div>
        ) : (
          <Link href="/profile#goal" className="block rounded-lg border border-dashed border-pulse/40 px-3 py-2.5 text-xs text-muted hover:border-pulse">
            <span className="font-semibold text-pulse">Set a goal</span> — role, companies and a target date give your prep a finish line.
          </Link>
        )}
        <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs">
          <Reminder label="Daily email" on={user.reminders.daily} next={when(user.reminders.dailyAt)} />
          <Reminder label="Weekly summary" on={user.reminders.weekly} next={when(user.reminders.weeklyAt)} />
          <Link href="/profile#reminders" className="inline-block pt-1 text-muted hover:text-ink">
            Manage reminders →
          </Link>
        </div>
      </Section>

      <Section title="Quick actions" icon="zap" color="var(--color-rev)">
        <div className="grid grid-cols-2 gap-2">
          <Action href="/random" icon="dice" label="Random question" external />
          <Action href="/questions?status=due" icon="revision" label="Revisions due" badge={revs.length} />
          <Action href="/questions?status=backlog" icon="inbox" label="Backlog" badge={d.missed.length} />
          <Action href="/schedule" icon="focus" label="Revision plan" />
        </div>
      </Section>

      {tip && (
        <Section title="Interview question" icon="bulb" color="var(--color-medium)" meta={tip.trackName}>
          <p className="text-sm font-medium leading-snug">{tip.q}</p>
          <details className="group/a mt-2">
            <summary className="cursor-pointer list-none text-xs text-muted select-none hover:text-ink [&::-webkit-details-marker]:hidden">
              <span className="group-open/a:hidden">Show answer ▾</span>
              <span className="hidden group-open/a:inline">Hide answer ▴</span>
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-muted">{tip.preview}</p>
          </details>
          <Link href={`/tracks#${tip.track}`} className="mt-2 inline-block text-xs text-muted hover:text-ink">
            {tip.topic} →
          </Link>
        </Section>
      )}
    </div>
  );
}

export function RailSkeleton() {
  return (
    <div className="space-y-6 p-4" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="space-y-2.5">
          <div className="h-3 w-24 animate-pulse rounded bg-panel-2" />
          <div className="h-16 animate-pulse rounded-lg bg-panel-2/70" />
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  icon,
  color,
  meta,
  children,
}: {
  title: string;
  icon: IconName;
  color: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <details open className="group/s border-b border-line">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold select-none hover:bg-panel-2/50 [&::-webkit-details-marker]:hidden">
        <Icon name={icon} className="size-4" style={{ color }} />
        {title}
        <span className="ml-auto max-w-24 truncate font-mono text-[11px] font-normal text-muted">{meta}</span>
        <Icon name="chevron" className="size-3.5 text-muted transition-transform group-open/s:rotate-90" />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

function Ring({ percent }: { percent: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 44 44" className="size-12 shrink-0 -rotate-90" aria-label={`${percent}% of today done`}>
      <circle cx="22" cy="22" r={r} fill="none" strokeWidth="4" className="stroke-panel-2" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        className="stroke-pulse transition-[stroke-dashoffset] duration-700"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent / 100)}
      />
      <text x="22" y="22" dy="0.35em" textAnchor="middle" transform="rotate(90 22 22)" className="fill-ink font-mono text-[10px] font-semibold">
        {percent}
      </text>
    </svg>
  );
}

function FocusRow({
  href,
  color,
  label,
  meta,
  late,
  internal,
}: {
  href: string;
  color: string;
  label: string;
  meta: string;
  late?: boolean;
  internal?: boolean;
}) {
  const body = (
    <>
      <span className="size-1.5 shrink-0 rounded-full" style={{ background: color }} />
      <span className="min-w-0 flex-1 truncate text-ink/90 group-hover/f:text-ink">{label}</span>
      <span className={`shrink-0 font-mono text-[10px] ${late ? "text-hard" : "text-muted"}`}>{meta}</span>
    </>
  );
  const cls = "group/f -mx-2 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs hover:bg-panel-2";
  return (
    <li>
      {internal ? (
        <Link href={href} className={cls}>
          {body}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {body}
        </a>
      )}
    </li>
  );
}

function Heatmap({ days }: { days: { date: string; solved: number; revised: number; topics: number }[] }) {
  const level = (n: number) => (n === 0 ? "bg-panel-2" : n <= 2 ? "bg-pulse/30" : n <= 5 ? "bg-pulse/60" : "bg-pulse");
  return (
    <div className="mt-3">
      <div className="grid grid-cols-14 gap-1">
        {days.map((day) => {
          const n = day.solved + day.revised + day.topics;
          return (
            <span
              key={day.date}
              className={`aspect-square rounded-[3px] ${level(n)}`}
              title={`${formatDate(day.date)}: ${day.solved} solved, ${day.revised} revised, ${day.topics} topics`}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-[10px] text-muted">Last 4 weeks</p>
    </div>
  );
}

function Bar({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px]">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-muted">
          <span className="text-ink">{done}</span>/{total}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel-2">
        <div className="h-full rounded-full" style={{ width: `${total ? Math.min(100, (done / total) * 100) : 0}%`, background: color }} />
      </div>
    </div>
  );
}

function Reminder({ label, on, next }: { label: string; on: boolean; next: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name="bell" className={`size-3.5 ${on ? "text-pulse" : "text-muted/50"}`} />
      <span className={on ? "text-ink" : "text-muted"}>{label}</span>
      <span className="ml-auto text-muted">{on ? next ?? "on" : "off"}</span>
    </div>
  );
}

function Action({
  href,
  icon,
  label,
  badge,
  external,
}: {
  href: string;
  icon: IconName;
  label: string;
  badge?: number;
  external?: boolean;
}) {
  const cls = "relative flex flex-col items-start gap-1.5 rounded-lg border border-line p-2.5 text-xs text-muted transition hover:border-muted hover:text-ink";
  const body = (
    <>
      <Icon name={icon} className="size-4" />
      {label}
      {!!badge && (
        <span className="absolute right-2 top-2 rounded-full bg-panel-2 px-1.5 font-mono text-[10px] text-ink">{badge}</span>
      )}
    </>
  );
  // The random pick is a route handler that redirects to the problem, so it opens in a new tab without prefetching.
  return external ? (
    <a href={href} target="_blank" rel="noopener" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}
