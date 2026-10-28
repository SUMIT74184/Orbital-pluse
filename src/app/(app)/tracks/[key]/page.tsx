import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { loadTrack } from "@/lib/trackView";
import { formatDate } from "@/lib/dates";
import { TopicToggle } from "@/components/Toggles";
import { LevelBadge, RoleInsights } from "@/components/RoleInsights";
import { TrackNav, TrackShell } from "@/components/tracks/TrackNav";
import { getInterviewQA } from "@/data/interview";
import { getGuide } from "@/data/guides";
import { LEVEL_LABEL } from "@/data/topics";

export async function generateMetadata({ params }: PageProps<"/tracks/[key]">) {
  const { key } = await params;
  return { title: (await getCatalog()).trackByKey.get(key)?.name ?? "Track" };
}

export default async function TrackPage({ params, searchParams }: PageProps<"/tracks/[key]">) {
  const user = await requireUser();
  const [{ key }, sp] = await Promise.all([params, searchParams]);
  const { track, role, topics, nav, isDone, hasLevels, enabled } = await loadTrack(user, key, sp.role);
  const q = role ? `?role=${role}` : "";
  const next = topics.find((t) => !isDone(t.id));
  const doneCount = topics.filter((t) => isDone(t.id)).length;
  const sections = [...new Set(topics.map((t) => t.section))];

  return (
    <TrackShell nav={<TrackNav trackKey={key} trackName={track.name} topics={nav} role={role} hasLevels={hasLevels} />}>
      <div className="space-y-6">
        <header className="space-y-3">
          <Link href="/tracks" className="text-sm text-muted hover:text-ink">
            ← All tracks
          </Link>
          <h1 className="text-2xl font-semibold">{track.name}</h1>
          {track.description && <p className="max-w-2xl text-sm text-muted">{track.description}</p>}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-mono text-xs text-muted">
              {doneCount}/{topics.length} done{role && hasLevels && ` · ${LEVEL_LABEL[role].toLowerCase()}`}
            </span>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-panel-2">
              <div className="h-full rounded-full bg-topic" style={{ width: `${topics.length ? (doneCount / topics.length) * 100 : 0}%` }} />
            </div>
            {!enabled && <span className="text-xs text-muted">(hidden from dashboard — enable in Settings)</span>}
          </div>
          {next && (
            <Link
              href={`/tracks/${key}/${next.id}${q}`}
              className="inline-flex items-center gap-2 rounded-lg bg-topic px-4 py-2 text-sm font-semibold text-on-accent hover:brightness-110"
            >
              {doneCount ? "Continue" : "Start"}: {next.title} →
            </Link>
          )}
        </header>

        {hasLevels && <RoleInsights topics={track.topics} role={role} />}

        {sections.map((section) => (
          <section key={section} className="space-y-2">
            <h2 className="text-xs font-medium uppercase tracking-widest text-muted">{section}</h2>
            <ul className="card divide-y divide-line overflow-hidden">
              {topics
                .filter((t) => t.section === section)
                .map((t) => {
                  const doneOn = isDone(t.id);
                  const qa = getInterviewQA(key, t.id)?.length ?? 0;
                  const guide = !!getGuide(key, t.id);
                  return (
                    <li key={t.id} className="flex gap-3 px-4 py-3 hover:bg-panel-2/50">
                      <TopicToggle kind={key} id={t.id} done={!!doneOn} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/tracks/${key}/${t.id}${q}`} className={`text-sm font-medium hover:text-topic ${doneOn ? "text-muted line-through" : ""}`}>
                          <span className="mr-2 font-mono text-xs text-muted">{track.topics.indexOf(t) + 1}.</span>
                          {t.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                          {t.levels?.map((l) => <LevelBadge key={l} level={l} />)}
                          {guide && <span className="rounded-full border border-line px-1.5 leading-4">simple guide</span>}
                          {qa > 0 && <span className="rounded-full border border-line px-1.5 leading-4">{qa} Q&amp;A</span>}
                        </div>
                        <p className="mt-1 text-xs text-muted">{t.points.join(" · ")}</p>
                      </div>
                      {doneOn && <span className="shrink-0 text-xs text-muted">{formatDate(doneOn)}</span>}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </TrackShell>
  );
}
