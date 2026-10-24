import { requireUser } from "@/lib/auth";
import { getRevisionCalendar } from "@/lib/plan";
import { getCatalog } from "@/lib/catalog";
import { weekdayOf } from "@/lib/dates";
import { WeekRotation, groupColor } from "@/components/WeekRotation";
import { RevisionCalendar } from "@/components/RevisionCalendar";

export const metadata = { title: "Revision plan" };

export default async function SchedulePage() {
  const user = await requireUser();
  const [cal, { meta }] = await Promise.all([getRevisionCalendar(user), getCatalog()]);
  const groupColors = Object.fromEntries(meta.groups.map((g) => [g, groupColor(g, meta.groups)]));

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-panel px-5 py-6 sm:px-7">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-rev/15 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rev">Spaced repetition</p>
            <h1 className="mt-1 text-3xl font-semibold">Revision plan</h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted">
              Every solved question comes back on a schedule so it sticks. Pick a day to see what&apos;s due, how long it&apos;ll take and
              which topics bring new questions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-1 font-mono text-xs" aria-label="Revision intervals">
            <span className="rounded-md bg-pulse/15 px-2 py-1 text-pulse">solve</span>
            {user.revisionDays.map((d, i) => (
              <span key={d} className="flex items-center gap-1">
                <span className="text-muted/60">→</span>
                <span className="rounded-md border border-rev/30 bg-rev/10 px-2 py-1 text-rev" title={`Revision ${i + 1}`}>
                  +{d}d
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div id="calendar" className="scroll-mt-20">
      <RevisionCalendar
        today={cal.today}
        from={cal.from}
        to={cal.to}
        items={cal.items}
        overdue={cal.overdue}
        stages={cal.stages}
        mastered={cal.mastered}
        revisionDays={user.revisionDays}
        schedule={user.schedule}
        groupColors={groupColors}
      />
      </div>

      <section id="rotation" className="card scroll-mt-20 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-semibold">Weekly topic rotation</h2>
          <p className="text-xs text-muted">New questions come from that day&apos;s patterns · solved / total</p>
        </div>
        <div className="mt-4">
          <WeekRotation schedule={user.schedule} today={weekdayOf(cal.today)} solvedByGroup={cal.solvedByGroup} meta={meta} />
        </div>
      </section>
    </div>
  );
}
