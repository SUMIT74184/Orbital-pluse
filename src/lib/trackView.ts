import "server-only";
import { notFound, redirect } from "next/navigation";
import { getTrackStates } from "./plan";
import { getCatalog, trackOn } from "./catalog";
import { PRACTICE_TRACKS, forLevel, parseLevel } from "@/data/topics";
import type { NavTopic } from "@/components/tracks/TrackNav";
import type { AppUser } from "./auth";


/** Everything a track or topic page needs: the track, the role filter and the user's progress. */
export async function loadTrack(user: AppUser, key: string, roleParam: unknown, keepId?: number) {
  const [done, cat] = await Promise.all([getTrackStates(user), getCatalog()]);
  const track = cat.trackByKey.get(key);
  if (!track || track.archived) notFound();
  if (PRACTICE_TRACKS.includes(key)) redirect(`/questions?tab=${key}`);
  const role = parseLevel(roleParam);
  const show = forLevel(role);
  // The open topic stays listed even when the role filter would hide it.
  const topics = track.topics.filter((t) => show(t) || t.id === keepId);
  const isDone = (id: number) => done[`${key}:${id}`];
  const nav: NavTopic[] = topics.map((t) => ({ id: t.id, title: t.title, section: t.section, done: !!isDone(t.id) }));
  return {
    track,
    role,
    topics,
    nav,
    isDone,
    hasLevels: track.topics.some((t) => t.levels?.length),
    enabled: trackOn(user.tracks, track),
  };
}
