import { requireUser } from "@/lib/auth";
import { getQuestionStates } from "@/lib/plan";
import { getCatalog } from "@/lib/catalog";
import { QuestionsTable } from "@/components/QuestionsTable";

export const metadata = { title: "Questions" };

export default async function QuestionsPage({ searchParams }: PageProps<"/questions">) {
  const user = await requireUser();
  const [{ today, states, backlog }, cat, sp] = await Promise.all([getQuestionStates(user), getCatalog(), searchParams]);
  // Archived questions stay listed only for people who already solved them.
  const questions = [...cat.byId.values()].filter((q) => !q.archived || states[q.id]);
  const status = typeof sp.status === "string" ? sp.status : "all";
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">All questions</h1>
        <p className="mt-1 text-sm text-muted">
          Solve anything ahead of schedule here — it will join your revision cycle from today.
        </p>
      </div>
      <QuestionsTable key={status} questions={questions} groups={cat.groups} today={today} states={states} backlog={backlog} initialStatus={status} />
    </div>
  );
}
