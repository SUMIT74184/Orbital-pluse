"use client";

import { useRef, useState } from "react";
import type { InterviewQA } from "@/data/interview";

/** Renders an answer: blank lines split paragraphs, "- " lines become bullets. */
function Answer({ text }: { text: string }) {
  const blocks: ({ kind: "p"; text: string } | { kind: "ul"; items: string[] })[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
    para = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith("- ")) {
      flush();
      const last = blocks[blocks.length - 1];
      if (last?.kind === "ul") last.items.push(line.slice(2));
      else blocks.push({ kind: "ul", items: [line.slice(2)] });
    } else {
      // A plain line right after a bullet list starts a new paragraph.
      para.push(line);
    }
  }
  flush();

  return (
    <div className="space-y-2 text-sm leading-relaxed text-ink/85">
      {blocks.map((b, i) =>
        b.kind === "p" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-topic">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

/**
 * A topic title that opens a modal of interview questions with model answers.
 * The Q&A content is loaded on first open so it stays out of the page bundle.
 */
export function TopicInterview({
  kind,
  id,
  title,
  section,
  className = "",
}: {
  kind: string;
  id: number;
  title: string;
  section: string;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [qa, setQa] = useState<InterviewQA[] | null>(null);
  const [revealed, setRevealed] = useState(true);

  async function open() {
    dialog.current?.showModal();
    if (!qa) {
      const { getInterviewQA } = await import("@/data/interview");
      setQa(getInterviewQA(kind, id) ?? []);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        title="Open interview questions"
        className={`text-left decoration-topic/50 underline-offset-4 hover:text-topic hover:underline ${className}`}
      >
        {title}
        <span className="ml-2 inline-block rounded border border-topic/40 px-1.5 py-px align-middle text-[10px] font-medium uppercase tracking-wide text-topic no-underline">
          Q&amp;A
        </span>
      </button>
      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto max-h-[85vh] w-[min(46rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-panel p-0 text-ink backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="flex max-h-[85vh] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-widest text-topic">{section} · interview Q&amp;A</p>
              <h2 className="mt-1 text-lg font-semibold">{title}</h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {qa && qa.length > 0 && (
                <button
                  type="button"
                  onClick={() => setRevealed((r) => !r)}
                  className="rounded-md border border-line px-2.5 py-1 text-xs text-muted hover:border-topic hover:text-topic"
                >
                  {revealed ? "Hide answers" : "Show answers"}
                </button>
              )}
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="Close"
                className="grid h-7 w-7 place-items-center rounded-md text-muted hover:bg-panel-2 hover:text-ink"
              >
                ✕
              </button>
            </div>
          </header>
          <div className="overflow-y-auto px-5 py-4">
            {!qa ? (
              <p className="py-6 text-center text-sm text-muted">Loading…</p>
            ) : qa.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No interview questions for this topic yet.</p>
            ) : (
              <ol className="space-y-3">
                {qa.map((item, i) => (
                  // Re-mount on toggle so every answer follows the Show/Hide all button.
                  <li key={`${i}-${revealed}`}>
                    <details open={revealed} className="group rounded-xl border border-line bg-panel-2/60">
                      <summary className="flex cursor-pointer select-none gap-3 px-4 py-3 text-sm font-medium marker:content-none">
                        <span className="font-mono text-xs text-topic">Q{i + 1}</span>
                        <span className="flex-1">{item.q}</span>
                        <span className="text-xs text-muted transition group-open:rotate-90">▸</span>
                      </summary>
                      <div className="border-t border-line px-4 py-3">
                        <Answer text={item.a} />
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
