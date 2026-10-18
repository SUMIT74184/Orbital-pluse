import { requireUser } from "@/lib/auth";
import { getTrackStates } from "@/lib/plan";
import { formatDate } from "@/lib/dates";
import { getCatalog, trackOn } from "@/lib/catalog";
import { TopicToggle } from "@/components/Toggles";

export const metadata = { title: "Tracks" };

export default async function TracksPage() {
  const user = await requireUser();
  const [done, cat] = await Promise.all([getTrackStates(user), getCatalog()]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Tracks</h1>
        <p className="mt-1 text-sm text-muted">
          The dashboard gives you the next unfinished topic from each track every day. You can also tick topics off here.
        </p>
      </div>
      {cat.tracks.map((track) => {
        const kind = track.key;
        const count = track.topics.filter((t) => done[`${kind}:${t.id}`]).length;
        const enabled = trackOn(user.tracks, track);
        const sections = [...new Set(track.topics.map((t) => t.section))];
        return (
          <section key={kind} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold" title={track.description}>{track.name}</h2>
              <span className="font-mono text-xs text-muted">
                {count}/{track.topics.length}
              </span>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-panel-2">
                <div className="h-full rounded-full bg-topic" style={{ width: `${track.topics.length ? (count / track.topics.length) * 100 : 0}%` }} />
              </div>
              {!enabled && <span className="text-xs text-muted">(hidden from dashboard — enable in Settings)</span>}
            </div>
            <div className="card divide-y divide-line overflow-hidden">
              {sections.map((section) => (
                <details key={section} open={section === track.topics.find((t) => !done[`${kind}:${t.id}`])?.section}>
                  <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium hover:bg-panel-2">
                    {section}
                    <span className="ml-2 font-mono text-xs text-muted">
                      {track.topics.filter((t) => t.section === section && done[`${kind}:${t.id}`]).length}/
                      {track.topics.filter((t) => t.section === section).length}
                    </span>
                  </summary>
                  <ul className="divide-y divide-line border-t border-line">
                    {track.topics
                      .filter((t) => t.section === section)
                      .map((t) => {
                        const doneOn = done[`${kind}:${t.id}`];
                        return (
                          <li key={t.id} className="flex gap-3 px-4 py-3">
                            <TopicToggle kind={kind} id={t.id} done={!!doneOn} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium ${doneOn ? "text-muted line-through" : ""}`}>
                                <span className="mr-2 font-mono text-xs text-muted">{track.topics.indexOf(t) + 1}.</span>
                                {t.title}
                              </p>
                              <p className="mt-0.5 text-xs text-muted">{t.points.join(" · ")}</p>
                              {t.practice && (
                                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                  {t.practice.map((p) => (
                                    <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer" className="text-topic hover:underline">
                                      {p.title} ↗
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            {doneOn && <span className="shrink-0 text-xs text-muted">{formatDate(doneOn)}</span>}
                          </li>
                        );
                      })}
                  </ul>
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
