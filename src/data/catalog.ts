import raw from "./questions.json";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Question = {
  id: number;
  pattern: string;
  group: string;
  title: string;
  difficulty: Difficulty;
  companies: string[];
  url: string;
};

// Seed for the questions collection. At runtime questions come from the database (src/lib/catalog.ts).
export const SEED_QUESTIONS = raw as Question[];

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Index = JS weekday (0 = Sunday). The sheet has a few groups the weekly plan
// didn't name (Strings, Bit Manipulation, Math, Trie, OOD); they're slotted next
// to the closest related topic and can be moved in Settings.
export const DEFAULT_SCHEDULE: string[][] = [
  ["Backtracking", "DP 1D", "DP 2D"],
  ["Arrays & Hashing", "Two Pointers", "Strings"],
  ["Binary Search", "Sliding Window", "Bit Manipulation"],
  ["Stack & Queue", "Linked List", "Math"],
  ["Trees", "Trie"],
  ["Heap", "Greedy", "Intervals", "Design (OOD)"],
  ["Graphs"],
];

export const DEFAULT_REVISION_DAYS = [1, 3, 7, 14, 30, 45, 60];
export const DEFAULT_DAILY_TARGET = 3;
