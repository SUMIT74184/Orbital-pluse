import { requireUser } from "@/lib/auth";
import { getQuestionStates } from "@/lib/plan";
import { QuestionsTable } from "@/components/QuestionsTable";

export const metadata = { title: "Questions · DSA Pulse" };

export default async function QuestionsPage({ searchParams }: PageProps<"/questions">) {
  const user = await requireUser();
  const [{ today, states, backlog }, sp] = await Promise.all([getQuestionStates(user), searchParams]);
  const status = typeof sp.status === "string" ? sp.status : "all";
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">All questions</h1>
        <p className="mt-1 text-sm text-muted">
          Solve anything ahead of schedule here — it will join your revision cycle from today.
        </p>
      </div>
      <QuestionsTable today={today} states={states} backlog={backlog} initialStatus={status} />
    </div>
  );
}
