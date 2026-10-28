// The languages Programming-track code is shown in. Kept apart from the guides so client components can import it cheaply.
export const LANGS = [
  { key: "java", label: "Java", file: "Main.java", color: "var(--color-java)" },
  { key: "python", label: "Python", file: "main.py", color: "var(--color-python)" },
] as const;
export type Lang = (typeof LANGS)[number]["key"];
/** The same program written once per language. */
export type LangCode = Record<Lang, string>;
/** Code for some of the languages: both in shared lessons, one in a lesson about a single language. */
export type Code = Partial<LangCode>;

export const langOf = (l: Lang) => LANGS.find((x) => x.key === l)!;

/** Remembers the language a reader picked, so every topic page opens on it. */
export const LANG_COOKIE = "lang";

export const parseLang = (v: unknown): Lang => (LANGS.some((l) => l.key === v) ? (v as Lang) : "java");

/** Code is written as indented template literals: drop the blank first and last lines and the indent every line shares. */
export function dedent(code: string) {
  const lines = code.replace(/^\s*\n/, "").trimEnd().split("\n");
  const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length));
  return lines.map((l) => l.slice(Number.isFinite(pad) ? pad : 0)).join("\n");
}
