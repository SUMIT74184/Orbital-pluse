import { requireUser } from "@/lib/auth";
import { getUpcoming } from "@/lib/plan";
import { formatDate } from "@/lib/dates";
import { WEEKDAYS } from "@/data/catalog";
import { DifficultyBadge } from "@/components/QuestionBits";

export const metadata = { title: "Revision plan · DSA Pulse" };

export default async function SchedulePage() {
  const user = await requireUser();
  const { today, overdue, days } = await getUpcoming(user, 14);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Revision plan</h1>
        <p className="mt-1 text-sm text-muted">
          Each solved question returns after{" "}
          {user.revisionDays.map((d, i) => (
            <span key={d}>
              {i > 0 && (i === user.revisionDays.length - 1 ? " and " : ", ")}
              <span className="font-mono text-rev">{d}</span>
            </span>
          ))}{" "}
          days. Here is what&apos;s coming up over the next two weeks.
        </p>
      </div>

      <section className="card p-5">
        <h2 className="font-semibold">Weekly topic rotation</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {[1, 2, 3, 4, 5, 6, 0].map((d) => (
            <div key={d} className="rounded-lg bg-panel-2 p-3 text-sm">
              <div className="font-mono text-xs text-pulse">{WEEKDAYS[d]}</div>
              <div className="mt-1 text-muted">{user.schedule[d]?.join(", ") || "—"}</div>
            </div>
          ))}
        </div>
      </section>

      {overdue.length > 0 && (
        <section className="card border-hard/40 p-5">
          <h2 className="font-semibold text-hard">Overdue ({overdue.length})</h2>
          <p className="mt-1 text-xs text-muted">Clear these from the dashboard — one review covers all missed rounds of a question.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {overdue.map((o) => (
              <li key={`${o.q.id}-${o.revNo}`} className="flex items-center justify-between gap-3 rounded-lg bg-panel-2 px-3 py-2 text-sm">
                <a href={o.q.url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-pulse">
                  {o.q.title}
                </a>
                <span className="shrink-0 font-mono text-xs text-hard">
                  R{o.revNo} · {formatDate(o.due)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((d) => (
          <div key={d.date} className={`card p-4 ${d.date === today ? "border-pulse/50" : ""}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="font-semibold">
                {d.date === today ? "Today" : formatDate(d.date, { weekday: "short", day: "numeric", month: "short" })}
              </h3>
              <span className="font-mono text-xs text-rev">{d.items.length} rev</span>
            </div>
            <p className="mt-0.5 text-xs text-muted">New: {d.groups.join(", ") || "—"}</p>
            {d.items.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {d.items.map((i) => (
                  <li key={i.q.id} className="flex items-center gap-2 text-sm">
                    <span className="w-9 shrink-0 font-mono text-xs text-rev">
                      R{i.revNo}
                    </span>
                    <a href={i.q.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate hover:text-pulse">
                      {i.q.title}
                    </a>
                    <DifficultyBadge d={i.q.difficulty} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted/70">No revisions</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
