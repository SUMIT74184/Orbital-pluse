import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { getContentUsage } from "@/lib/admin";
import { Card } from "@/components/admin/AdminCharts";
import { QuestionForm } from "@/components/admin/ContentForms";
import { QuestionManager } from "@/components/admin/QuestionManager";

export const metadata = { title: "DSA questions" };

export default async function AdminDsa() {
  await requireAdmin();
  const [cat, usage] = await Promise.all([getCatalog(), getContentUsage()]);
  const questions = [...cat.byId.values()].map((q) => ({ ...q, users: usage.questions[q.id] ?? 0 }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/content" className="text-sm text-muted hover:text-ink">
          ← Content
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">DSA questions</h1>
        <p className="mt-1 text-sm text-muted">
          New questions join the pool for their pattern on the days users study it. A brand-new pattern isn&apos;t on anyone&apos;s weekly
          rotation yet: users see it in Settings, and until they place it, it&apos;s used once a day&apos;s own patterns run out.
        </p>
      </div>
      <Card title="Add a question">
        <QuestionForm groups={cat.groups} />
      </Card>
      <QuestionManager questions={questions} groups={cat.groups} />
    </div>
  );
}
