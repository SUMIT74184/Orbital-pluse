import { SEED_TRACKS } from "@/data/topics";
import { SYSTEM_DESIGN_QA } from "./systemDesign";
import { DBMS_QA } from "./dbms";

/**
 * One interview question with a model answer. In `a`, blank lines separate paragraphs,
 * lines starting with "- " are bullets and `backticks` mark code.
 */
export type InterviewQA = { q: string; a: string };

// Keyed by the seed topic title so an admin renaming a topic doesn't detach its answers.
const BY_TRACK: Record<string, Record<string, InterviewQA[]>> = {
  sd: SYSTEM_DESIGN_QA,
  dbms: DBMS_QA,
};

export function getInterviewQA(track: string, topicId: number): InterviewQA[] | null {
  const qa = BY_TRACK[track];
  const title = SEED_TRACKS.find((t) => t.key === track)?.topics.find((t) => t.id === topicId)?.title;
  return (qa && title && qa[title]) || null;
}

export function hasInterviewQA(track: string, topicId: number) {
  return getInterviewQA(track, topicId) !== null;
}

/** One question a day for the sidebar, cycling through every track's Q&A, with a one-paragraph answer preview. */
export function dailyInterviewQA(date: string) {
  const all = Object.entries(BY_TRACK).flatMap(([track, byTopic]) =>
    Object.entries(byTopic).flatMap(([topic, qas]) => qas.map((qa) => ({ track, topic, ...qa }))),
  );
  if (!all.length) return null;
  const pick = all[Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000) % all.length];
  const first = pick.a
    .split(/\n\s*\n/)[0]
    .split("\n")
    .map((l) => l.trim().replace(/^- /, ""))
    .join(" ")
    .replace(/`/g, "");
  return {
    ...pick,
    trackName: SEED_TRACKS.find((t) => t.key === pick.track)?.name ?? pick.track,
    preview: first.length > 320 ? `${first.slice(0, 320).trimEnd()}…` : first,
  };
}
