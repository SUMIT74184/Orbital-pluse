import Link from "next/link";
import { LEVELS, LEVEL_LABEL, type Level } from "@/data/topics";

export type NavTopic = { id: number; title: string; section: string; done: boolean };
export type OutlineItem = { id: string; label: string };

const withRole = (href: string, role: Level | null) => (role ? `${href}?role=${role}` : href);

/**
 * The track's table of contents: sections with their topics, the current topic expanded into
 * its on-page outline (concepts, diagram, each question). Desktop shows it as a sticky column;
 * small screens get the same list folded into a "Browse topics" disclosure.
 */
export function TrackNav({
  trackKey,
  trackName,
  topics,
  currentId,
  outline,
  role,
  hasLevels,
}: {
  trackKey: string;
  trackName: string;
  topics: NavTopic[];
  currentId?: number;
  outline?: OutlineItem[];
  role: Level | null;
  hasLevels: boolean;
}) {
  const done = topics.filter((t) => t.done).length;
  const body = (
    <nav aria-label={`${trackName} topics`} className="space-y-3 text-sm">
      <div>
        <Link href={withRole(`/tracks/${trackKey}`, role)} className={`font-semibold hover:text-topic ${currentId ? "" : "text-topic"}`}>
          {trackName}
        </Link>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-panel-2">
            <div className="h-full rounded-full bg-topic" style={{ width: `${topics.length ? (done / topics.length) * 100 : 0}%` }} />
          </div>
          <span className="font-mono text-[11px] text-muted">
            {done}/{topics.length}
          </span>
        </div>
      </div>
      {hasLevels && (
        <div className="flex flex-wrap gap-1" aria-label="Filter by role level">
          {[null, ...LEVELS].map((l) => (
            <Link
              key={l ?? "all"}
              href={withRole(currentId ? `/tracks/${trackKey}/${currentId}` : `/tracks/${trackKey}`, l)}
              aria-current={role === l ? "true" : undefined}
              className={`rounded-full border px-2 py-0.5 text-[11px] ${role === l ? "border-topic bg-topic/15 text-topic" : "border-line text-muted hover:text-ink"}`}
            >
              {l ? LEVEL_LABEL[l].replace(" level", "") : "All"}
            </Link>
          ))}
        </div>
      )}
      <ol className="space-y-1">
        {[...new Set(topics.map((t) => t.section))].map((section) => {
          const inSection = topics.filter((t) => t.section === section);
          const open = currentId ? inSection.some((t) => t.id === currentId) : inSection.some((t) => !t.done);
          return (
            <li key={section}>
              <details open={open} className="group">
                <summary className="flex cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium uppercase tracking-wide text-muted marker:content-none hover:text-ink">
                  <span className="text-[10px] transition group-open:rotate-90">▸</span>
                  <span className="flex-1">{section}</span>
                  <span className="font-mono text-[10px] normal-case">
                    {inSection.filter((t) => t.done).length}/{inSection.length}
                  </span>
                </summary>
                <ul className="mt-0.5 space-y-px border-l border-line pl-2 ml-2.5">
                  {inSection.map((t) => {
                    const current = t.id === currentId;
                    return (
                      <li key={t.id}>
                        <Link
                          href={withRole(`/tracks/${trackKey}/${t.id}`, role)}
                          aria-current={current ? "page" : undefined}
                          className={`flex items-start gap-2 rounded-md px-2 py-1 leading-snug ${
                            current ? "bg-topic/10 font-medium text-topic" : t.done ? "text-muted hover:text-ink" : "text-ink/85 hover:bg-panel-2 hover:text-ink"
                          }`}
                        >
                          <span
                            aria-hidden
                            className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${t.done ? "bg-pulse" : current ? "bg-topic" : "border border-muted"}`}
                          />
                          <span className={t.done && !current ? "line-through decoration-muted/50" : ""}>{t.title}</span>
                        </Link>
                        {current && outline && outline.length > 0 && (
                          <ul className="my-1 ml-5 space-y-px border-l border-topic/30 pl-2 text-xs">
                            {outline.map((o) => (
                              <li key={o.id}>
                                <a href={`#${o.id}`} className="block truncate rounded px-1.5 py-0.5 text-muted hover:text-ink" title={o.label}>
                                  {o.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </details>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <>
      <details className="card mb-4 p-3 lg:hidden">
        <summary className="cursor-pointer select-none text-sm font-medium">
          Browse {trackName} topics <span className="font-mono text-xs text-muted">{done}/{topics.length}</span>
        </summary>
        <div className="mt-3">{body}</div>
      </details>
      <aside className="hidden lg:block">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto pr-2 [scrollbar-width:thin]">{body}</div>
      </aside>
    </>
  );
}

/** Two columns on desktop: the topic list on the left, the page in the middle. */
export function TrackShell({ nav, children }: { nav: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
      {nav}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
