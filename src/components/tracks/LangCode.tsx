"use client";

import { createContext, use, useState } from "react";
import { YEAR } from "@/components/nav/cookies";
import { LANGS, LANG_COOKIE, type Code, type Lang } from "@/data/langs";
import { Highlight } from "./Highlight";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "java", setLang: () => {} });

/** Every code block on the page switches together; the choice is kept in a cookie so the server renders it next time. */
export function LangProvider({ initial, children }: { initial: Lang; children: React.ReactNode }) {
  const [lang, set] = useState(initial);
  const setLang = (l: Lang) => {
    set(l);
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=${YEAR}; samesite=lax`;
  };
  return <LangContext value={{ lang, setLang }}>{children}</LangContext>;
}

/**
 * A program in an editor-style window: one file tab per language it is written in (clicking one switches
 * every block on the page), a copy button, line numbers, and the sample input and output it runs with.
 */
export function CodeTabs({ code, input, output }: { code: Code; input?: string; output?: string | Code }) {
  const { lang: chosen, setLang } = use(LangContext);
  const [copied, setCopied] = useState(false);
  const langs = LANGS.filter((l) => code[l.key] !== undefined);
  // A one-language lesson shows its language whatever the reader picked elsewhere.
  const cur = langs.find((l) => l.key === chosen) ?? langs[0];
  const text = code[cur.key] ?? "";
  const out = typeof output === "string" ? output : output?.[cur.key];
  const lines = text.split("\n").length;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (http, permissions); selecting the code by hand still works.
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-code shadow-lg shadow-black/10">
      <div className="flex items-end border-b border-line bg-panel-2/80 pl-1.5 pr-1">
        <div role="tablist" aria-label="Language" className="-mb-px flex">
          {langs.map((l) => {
            const on = l.key === cur.key;
            return (
              <button
                key={l.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setLang(l.key)}
                disabled={langs.length === 1}
                className={`mt-1.5 flex items-center gap-2 rounded-t-lg border-x border-t px-3.5 py-1.5 font-mono text-[12px] transition ${
                  on ? "border-line bg-code text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
                style={on ? { boxShadow: `inset 0 2px 0 ${l.color}` } : undefined}
              >
                <span className="size-2 rounded-full" style={{ background: l.color, opacity: on ? 1 : 0.5 }} />
                {l.file}
                <span className="font-sans text-[10.5px] text-muted">{l.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={copy}
          className="mb-1 ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] text-muted transition hover:bg-line/60 hover:text-ink"
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            {copied ? <path d="M3 8.5l3 3 7-7" /> : <><rect x="5" y="5" width="8.5" height="8.5" rx="1.5" /><path d="M10.5 5V3.5A1.5 1.5 0 009 2H3.5A1.5 1.5 0 002 3.5V9A1.5 1.5 0 003.5 10.5H5" /></>}
          </svg>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex font-mono text-[12.5px] leading-6">
        <pre aria-hidden className="select-none border-r border-line/60 py-3 pl-3 pr-2.5 text-right text-code-gutter">
          {Array.from({ length: lines }, (_, n) => n + 1).join("\n")}
        </pre>
        <pre className="min-w-0 flex-1 overflow-x-auto py-3 pl-4 pr-4 text-code-ink">
          <code>
            <Highlight code={text} lang={cur.key} />
          </code>
        </pre>
      </div>
      {(input || out) && (
        <div className={`grid border-t border-line bg-panel/80 ${input && out ? "divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0" : ""}`}>
          {input && <Stream label="Input" text={input} />}
          {out && <Stream label="Output" text={out} />}
        </div>
      )}
    </div>
  );
}

function Stream({ label, text }: { label: string; text: string }) {
  return (
    <div className="min-w-0 px-4 py-2.5">
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
        <span className="font-mono text-new">{label === "Input" ? "›" : "$"}</span>
        {label}
      </p>
      <pre className="mt-1 overflow-x-auto font-mono text-[12.5px] leading-6 text-ink/85">{text}</pre>
    </div>
  );
}
