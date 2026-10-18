import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { getContentUsage } from "@/lib/admin";
import { Card } from "@/components/admin/AdminCharts";
import { TopicForm, TrackArchive, TrackForm } from "@/components/admin/ContentForms";
import { TopicManager } from "@/components/admin/TopicManager";

export const metadata = { title: "Track" };

export default async function AdminTrack({ params }: PageProps<"/admin/content/tracks/[key]">) {
  await requireAdmin();
  const { key } = await params;
  const [cat, usage] = await Promise.all([getCatalog(), getContentUsage()]);
  const track = cat.trackByKey.get(key);
  if (!track) notFound();
  const sections = [...new Set(track.allTopics.map((t) => t.section))];
  const topics = track.allTopics.map((t) => ({ ...t, users: usage.topics[`${key}:${t.id}`] ?? 0 }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/content" className="text-sm text-muted hover:text-ink">
          ← Content
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{track.name}</h1>
          <span className="font-mono text-xs text-muted">{key}</span>
          {track.archived && <span className="text-xs text-hard">archived: hidden from users</span>}
          <div className="ml-auto">
            <TrackArchive trackKey={key} archived={track.archived} />
          </div>
        </div>
        <p className="mt-1 text-sm text-muted">
          Each user gets the first topic here they haven&apos;t finished, one a day. Reordering changes what comes next for everyone.
        </p>
      </div>
      <Card title="Track details">
        <TrackForm initial={{ key, name: track.name, description: track.description, defaultOn: track.defaultOn }} />
      </Card>
      <Card title="Add a topic" sub="Added at the end of the track.">
        <TopicForm track={key} sections={sections} />
      </Card>
      <TopicManager track={key} topics={topics} sections={sections} />
    </div>
  );
}
