import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getTrackStates } from "@/lib/plan";
import { getCatalog, trackOn } from "@/lib/catalog";
import { LEVELS, LEVEL_LABEL, PRACTICE_TRACKS, forLevel, parseLevel } from "@/data/topics";
import { getGuide } from "@/data/guides";

export const metadata = { title: "Tracks" };

export default async function TracksPage({ searchParams }: PageProps<"/tracks">) {
  const user = await requireUser();
  const [done, cat, sp] = await Promise.all([getTrackStates(user), getCatalog(), searchParams]);
  const role = parseLevel(sp.role);
  const q = role ? `?role=${role}` : "";
  const tracks = cat.tracks.filter((t) => !PRACTICE_TRACKS.includes(t.key));
  const practice = cat.tracks.filter((t) => PRACTICE_TRACKS.includes(t.key));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tracks</h1>
        <p className="mt-1 text-sm text-muted">
          Concept tracks for interviews. Each topic has its own page: a plain-language explanation, an example, a diagram, then interview questions.
        </p>
        <nav aria-label="Filter by role level" className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Interviewing for</span>
          {[null, ...LEVELS].map((l) => (
            <Link
              key={l ?? "all"}
              href={l ? `/tracks?role=${l}` : "/tracks"}
              aria-current={role === l ? "true" : undefined}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                role === l ? "border-topic bg-topic/15 text-topic" : "border-line text-muted hover:border-muted hover:text-ink"
              }`}
            >
              {l ? LEVEL_LABEL[l] : "All roles"}
            </Link>
          ))}
        </nav>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tracks.map((track) => {
          const tagged = track.topics.some((t) => t.levels?.length);
          const topics = track.topics.filter(forLevel(role));
          const count = topics.filter((t) => done[`${track.key}:${t.id}`]).length;
          const next = topics.find((t) => !done[`${track.key}:${t.id}`]);
          const guides = track.topics.filter((t) => getGuide(track.key, t.id)).length;
          const sections = [...new Set(topics.map((t) => t.section))];
          return (
            <section key={track.key} id={track.key} className="card relative flex flex-col p-5 transition hover:border-topic/60">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">
                  <Link href={`/tracks/${track.key}${q}`} className="after:absolute after:inset-0">
                    {track.name}
                  </Link>
                </h2>
                <span className="font-mono text-xs text-muted">
                  {count}/{topics.length}
                </span>
              </div>
              {track.description && <p className="mt-1 text-sm text-muted">{track.description}</p>}
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel-2">
                <div className="h-full rounded-full bg-topic" style={{ width: `${topics.length ? (count / topics.length) * 100 : 0}%` }} />
              </div>
              <p className="mt-3 text-xs text-muted">
                {sections.length} sections · {guides ? `${guides} simple guides · ` : ""}
                {role && tagged ? `filtered for ${LEVEL_LABEL[role].toLowerCase()}` : role ? "not tagged by level" : `${topics.length} topics`}
                {!trackOn(user.tracks, track) && " · off in your daily plan"}
              </p>
              {next && (
                <Link
                  href={`/tracks/${track.key}/${next.id}${q}`}
                  className="relative z-10 mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-topic/50 px-3 py-1.5 text-xs text-topic hover:bg-topic/10"
                >
                  {count ? "Continue" : "Start"}: <span className="max-w-[16rem] truncate">{next.title}</span> →
                </Link>
              )}
            </section>
          );
        })}
      </div>

      {practice.length > 0 && (
        <p className="text-sm text-muted">
          Looking for {practice.map((t) => t.name).join(", ")}? It moved to{" "}
          <Link href={`/questions?tab=${practice[0].key}`} className="text-topic hover:underline">
            Questions → {practice[0].name}
          </Link>{" "}
          since you practise it by solving.
        </p>
      )}
    </div>
  );
}
