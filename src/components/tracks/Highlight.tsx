import type { Lang } from "@/data/langs";

// A small syntax highlighter for the Programming track's Java and Python snippets. It only has to colour
// keywords, strings, numbers, comments, types and calls well enough to read, so a tokenising regex is plenty.

type Kind = "kw" | "str" | "num" | "com" | "type" | "fn" | "dec";

const COLOR: Record<Kind, string> = {
  kw: "text-[#c792ea]",
  str: "text-[#c3e88d]",
  num: "text-[#f78c6c]",
  com: "italic text-[#6f7d8c]",
  type: "text-[#ffcb6b]",
  fn: "text-[#82aaff]",
  dec: "text-[#ffcb6b]",
};

const words = (s: string) => new Set(s.split(" "));

const KEYWORDS: Record<Lang, Set<string>> = {
  java: words(
    "abstract assert boolean break byte case catch char class continue default do double else enum extends final finally float for if implements import instanceof int interface long new package private protected public record return short static super switch this throw throws try var void volatile while true false null",
  ),
  python: words(
    "and as assert break case class continue def del elif else except False finally for from global if import in is lambda match None nonlocal not or pass raise return self True try while with yield",
  ),
};

const PY_BUILTINS = words("abs all any bool dict enumerate filter float frozenset id input int isinstance len list map max min object open print range reversed set sorted str sum tuple type zip");

// Groups: 1 comment, 2 string, 3 number, 4 decorator / annotation, 5 identifier. Anything else is plain text.
const TOKEN: Record<Lang, RegExp> = {
  java: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d[\d_]*(?:\.\d+)?[lLfFdD]?\b)|(@\w+)|([A-Za-z_$][\w$]*)/g,
  python:
    /(#[^\n]*)|((?:\b[rbfRBF]{1,2})?(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d[\d_]*(?:\.\d+)?(?:e-?\d+)?j?\b)|(@\w+)|([A-Za-z_]\w*)/g,
};

function kindOf(lang: Lang, word: string, rest: string): Kind | undefined {
  if (KEYWORDS[lang].has(word)) return "kw";
  if (/^\s*\(/.test(rest)) return "fn";
  if (/^[A-Z]/.test(word)) return "type";
  if (lang === "python" && PY_BUILTINS.has(word)) return "fn";
  return undefined;
}

export function tokenize(code: string, lang: Lang): { text: string; kind?: Kind }[] {
  const out: { text: string; kind?: Kind }[] = [];
  const re = new RegExp(TOKEN[lang]);
  let last = 0;
  for (let m = re.exec(code); m; m = re.exec(code)) {
    if (m.index > last) out.push({ text: code.slice(last, m.index) });
    const kind: Kind | undefined = m[1] ? "com" : m[2] ? "str" : m[3] ? "num" : m[4] ? "dec" : kindOf(lang, m[5], code.slice(re.lastIndex, re.lastIndex + 40));
    out.push({ text: m[0], kind });
    last = re.lastIndex;
  }
  if (last < code.length) out.push({ text: code.slice(last) });
  return out;
}

/** Coloured code, to put inside a <pre> or <code>. */
export function Highlight({ code, lang }: { code: string; lang: Lang }) {
  return tokenize(code, lang).map((t, i) =>
    t.kind ? (
      <span key={i} className={COLOR[t.kind]}>
        {t.text}
      </span>
    ) : (
      t.text
    ),
  );
}
