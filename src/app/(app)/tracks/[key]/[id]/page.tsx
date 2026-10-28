import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCatalog } from "@/lib/catalog";
import { loadTrack } from "@/lib/trackView";
import { TopicView } from "@/components/tracks/TopicView";
import { getInterviewQA } from "@/data/interview";
import { getGuide } from "@/data/guides";
import { LANG_COOKIE, parseLang } from "@/data/langs";

export async function generateMetadata({ params }: PageProps<"/tracks/[key]/[id]">) {
  const { key, id } = await params;
  return { title: (await getCatalog()).trackByKey.get(key)?.topics.find((t) => t.id === Number(id))?.title ?? "Topic" };
}

export default async function TopicPage({ params, searchParams }: PageProps<"/tracks/[key]/[id]">) {
  const user = await requireUser();
  const [{ key, id: rawId }, sp, jar] = await Promise.all([params, searchParams, cookies()]);
  const id = Number(rawId);
  const { track, role, topics, nav, isDone, hasLevels } = await loadTrack(user, key, sp.role, id);
  const topic = track.topics.find((t) => t.id === id);
  if (!topic) notFound();

  return (
    <TopicView
      trackKey={key}
      trackName={track.name}
      trackTopics={track.topics}
      topic={topic}
      topics={topics}
      nav={nav}
      role={role}
      hasLevels={hasLevels}
      guide={getGuide(key, id)}
      qa={getInterviewQA(key, id) ?? []}
      doneOn={isDone(id)}
      lang={parseLang(jar.get(LANG_COOKIE)?.value)}
    />
  );
}
