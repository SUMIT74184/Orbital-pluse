import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getQuestionStates, getTrackStates } from "@/lib/plan";
import { getCatalog } from "@/lib/catalog";
import { QuestionsTable } from "@/components/QuestionsTable";
import { PracticeTrack } from "@/components/PracticeTrack";
import { PRACTICE_TRACKS } from "@/data/topics";

export const metadata = { title: "Questions" };

export default async function QuestionsPage({ searchParams }: PageProps<"/questions">) {
  const user = await requireUser();
  const [{ today, states, backlog }, cat, sp, done] = await Promise.all([getQuestionStates(user), getCatalog(), searchParams, getTrackStates(user)]);
  // Archived questions stay listed only for people who already solved them.
  const questions = [...cat.byId.values()].filter((q) => !q.archived || states[q.id]);
  const status = typeof sp.status === "string" ? sp.status : "all";
  const practice = cat.tracks.filter((t) => PRACTICE_TRACKS.includes(t.key));
  const tab = practice.find((t) => t.key === sp.tab);
  const tabs = [{ href: "/questions", label: "DSA", active: !tab }, ...practice.map((t) => ({ href: `/questions?tab=${t.key}`, label: t.name, active: t === tab }))];
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{tab ? `${tab.name} practice` : "All questions"}</h1>
        <p className="mt-1 text-sm text-muted">
          {tab
            ? "Work through each topic and its practice problems; ticking a topic counts towards your daily plan."
            : "Solve anything ahead of schedule here — it will join your revision cycle from today."}
        </p>
      </div>
      {tabs.length > 1 && (
        <nav aria-label="Question sets" className="flex gap-1 border-b border-line">
          {tabs.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={t.active ? "page" : undefined}
              className={`-mb-px border-b-2 px-4 py-2 text-sm ${t.active ? "border-topic font-medium text-ink" : "border-transparent text-muted hover:text-ink"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
      {tab ? (
        <PracticeTrack track={tab} done={done} />
      ) : (
        <QuestionsTable key={status} questions={questions} groups={cat.groups} today={today} states={states} backlog={backlog} initialStatus={status} />
      )}
    </div>
  );
}
