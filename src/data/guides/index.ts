import { SEED_TRACKS } from "@/data/topics";
import { OOP_GUIDES } from "./oop";

/**
 * The "learn it" half of a topic page, written in plain language. Text fields use the same
 * markup as interview answers (see RichText); `visual` names a diagram in QAVisuals.
 */
export type TopicGuide = {
  /** The idea in plain words, as you'd explain it to a friend. */
  simple: string;
  /** An everyday analogy or real-life example. */
  analogy: string;
  visual?: string;
  /** The terms an interviewer expects you to use, each with a one-line meaning. */
  concepts: { term: string; meaning: string }[];
  /** A worked example, usually code. */
  example?: string;
  /** A side-by-side comparison, for the classic "X vs Y" questions. */
  compare?: { head: string[]; rows: string[][] };
  mistakes?: string[];
  /** One sentence to remember, or to open your interview answer with. */
  remember: string;
};

// Keyed by the seed topic title, like the interview Q&A.
const BY_TRACK: Record<string, Record<string, TopicGuide>> = {
  oop: OOP_GUIDES,
};

export function getGuide(track: string, topicId: number): TopicGuide | null {
  const title = SEED_TRACKS.find((t) => t.key === track)?.topics.find((t) => t.id === topicId)?.title;
  return (title && BY_TRACK[track]?.[title]) || null;
}
