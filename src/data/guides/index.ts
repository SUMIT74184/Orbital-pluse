import { SEED_TRACKS } from "@/data/topics";
import type { Code, Lang } from "@/data/langs";
import { DBMS_GUIDES } from "./dbms";
import { OOP_GUIDES } from "./oop";
import { CODE_BASICS_GUIDES } from "./codeBasics";
import { CODE_PATTERN_GUIDES } from "./codePatterns";
import { CODE_COLLECTION_GUIDES } from "./codeCollections";
import { SD_GUIDES } from "./sd";
import { SD_CASE_GUIDES } from "./sdCases";

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
  /** A walk-through: numbered steps, optionally with a flowchart (a QAVisuals name) above them. */
  how?: { visual?: string; steps: string[] };
  /** The terms an interviewer expects you to use, each with a one-line meaning. */
  concepts: { term: string; meaning: string }[];
  /** A worked example, usually code. */
  example?: string;
  /** A side-by-side comparison, for the classic "X vs Y" questions. */
  compare?: { head: string[]; rows: string[][] };
  mistakes?: string[];
  /** One sentence to remember, or to open your interview answer with. */
  remember: string;
  /**
   * Programming track: set when the lesson is about one language only (Java's Collections Framework, Python's
   * tuples...). Its code is written in that language alone, so there is no Java | Python switch.
   */
  lang?: Lang;
  /** Programming track: how each language writes the same thing, one row per task. */
  syntax?: ({ task: string } & Code)[];
  /** Programming track: complete programs with a Java | Python switch. `output` is what they print. */
  code?: (Code & { title: string; note?: string; input?: string; output?: string | Code })[];
  /** Programming track: try-it-yourself problems; the solution stays folded until opened. */
  exercises?: (Code & { q: string; example: string; hint?: string; input?: string; output: string })[];
  /** Programming track, one-language lessons: what the other language uses instead (rows: this language, the other). */
  other?: { note: string; rows?: [string, string][] };
};

// Keyed by the seed topic title, like the interview Q&A.
const BY_TRACK: Record<string, Record<string, TopicGuide>> = {
  oop: OOP_GUIDES,
  dbms: DBMS_GUIDES,
  sd: { ...SD_GUIDES, ...SD_CASE_GUIDES },
  code: { ...CODE_BASICS_GUIDES, ...CODE_COLLECTION_GUIDES, ...CODE_PATTERN_GUIDES },
};

export function getGuide(track: string, topicId: number): TopicGuide | null {
  const title = SEED_TRACKS.find((t) => t.key === track)?.topics.find((t) => t.id === topicId)?.title;
  return (title && BY_TRACK[track]?.[title]) || null;
}
