import { formatDate } from "@/lib/dates";
import type { CatalogTrack } from "@/lib/catalog";
import { TopicToggle } from "./Toggles";

/** A track you work through by solving linked problems (MySQL), shown as a tab of the Questions page. */
export function PracticeTrack({ track, done }: { track: CatalogTrack; done: Record<string, string> }) {
  const count = track.topics.filter((t) => done[`${track.key}:${t.id}`]).length;
  const sections = [...new Set(track.topics.map((t) => t.section))];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {track.description && <p className="text-sm text-muted">{track.description}</p>}
        <span className="font-mono text-xs text-muted">
          {count}/{track.topics.length}
        </span>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-panel-2">
          <div className="h-full rounded-full bg-topic" style={{ width: `${track.topics.length ? (count / track.topics.length) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="card divide-y divide-line overflow-hidden">
        {sections.map((section) => {
          const topics = track.topics.filter((t) => t.section === section);
          return (
            <details key={section} open={section === track.topics.find((t) => !done[`${track.key}:${t.id}`])?.section}>
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium hover:bg-panel-2">
                {section}
                <span className="ml-2 font-mono text-xs text-muted">
                  {topics.filter((t) => done[`${track.key}:${t.id}`]).length}/{topics.length}
                </span>
              </summary>
              <ul className="divide-y divide-line border-t border-line">
                {topics.map((t) => {
                  const doneOn = done[`${track.key}:${t.id}`];
                  return (
                    <li key={t.id} id={`topic-${t.id}`} className="flex scroll-mt-20 gap-3 px-4 py-3 target:bg-topic/10">
                      <TopicToggle kind={track.key} id={t.id} done={!!doneOn} />
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium ${doneOn ? "text-muted line-through" : ""}`}>
                          <span className="mr-2 font-mono text-xs text-muted">{track.topics.indexOf(t) + 1}.</span>
                          {t.title}
                        </div>
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
          );
        })}
      </div>
    </div>
  );
}
