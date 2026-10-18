import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { Card } from "@/components/admin/AdminCharts";
import { TrackArchive, TrackForm } from "@/components/admin/ContentForms";

export const metadata = { title: "Content" };

export default async function AdminContent() {
  await requireAdmin();
  const cat = await getCatalog();
  const archivedQuestions = cat.byId.size - cat.questions.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Content</h1>
        <p className="mt-1 text-sm text-muted">
          Changes go live for everyone straight away. Archiving hides an item from new plans but keeps everyone&apos;s progress on it.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/content/dsa" className="card block p-5 transition hover:border-new/60">
          <p className="text-xs text-muted">Questions</p>
          <h2 className="mt-1 text-lg font-semibold">DSA</h2>
          <p className="mt-2 text-sm text-muted">
            <span className="font-mono text-ink">{cat.questions.length}</span> questions across{" "}
            <span className="font-mono text-ink">{cat.groups.length}</span> patterns
            {archivedQuestions > 0 && ` · ${archivedQuestions} archived`}
          </p>
        </Link>
        {cat.allTracks.map((t) => (
          <div key={t.key} className={`card relative p-5 transition hover:border-topic/60 ${t.archived ? "opacity-60" : ""}`}>
            <Link href={`/admin/content/tracks/${t.key}`} className="absolute inset-0" aria-label={`Edit ${t.name}`} />
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-muted">
                Track · <span className="font-mono">{t.key}</span>
                {t.defaultOn && " · on by default"}
              </p>
              <div className="relative">
                <TrackArchive trackKey={t.key} archived={t.archived} />
              </div>
            </div>
            <h2 className="mt-1 text-lg font-semibold">{t.name}</h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-mono text-ink">{t.topics.length}</span> topics in{" "}
              <span className="font-mono text-ink">{new Set(t.topics.map((x) => x.section)).size}</span> sections
              {t.archived && " · archived"}
            </p>
          </div>
        ))}
      </div>

      <Card title="New track" sub="e.g. Operating Systems, Computer Networks, LLD, Behavioural. Users get one topic a day from each track they have on.">
        <TrackForm />
      </Card>
    </div>
  );
}
