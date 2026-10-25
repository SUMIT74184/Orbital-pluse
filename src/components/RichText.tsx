// Shared by topic pages: plain text with a tiny markdown subset, rendered on the server.

/** Renders lesson and answer text: blank lines split paragraphs, "- " lines become bullets, ``` or ~~~ fences become code blocks. */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks: ({ kind: "p"; text: string } | { kind: "ul"; items: string[] } | { kind: "code"; text: string })[] = [];
  let para: string[] = [];
  let code: string[] | null = null;
  let indent = 0;
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", text: para.join(" ") });
    para = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("```") || line.startsWith("~~~")) {
      if (code) {
        // A fence that opens on the first line of a template literal has no indent of its own, so trim the common one.
        const pad = Math.min(...code.filter((l) => l.trim()).map((l) => l.length - l.trimStart().length));
        blocks.push({ kind: "code", text: code.map((l) => l.slice(Number.isFinite(pad) ? pad : 0)).join("\n") });
        code = null;
      } else {
        flush();
        code = [];
        // Code keeps its indentation relative to the opening fence.
        indent = raw.length - raw.trimStart().length;
      }
    } else if (code) {
      code.push(raw.slice(Math.min(indent, raw.length - raw.trimStart().length)));
    } else if (!line) {
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
    <div className={`space-y-2 text-sm leading-relaxed text-ink/85 ${className}`}>
      {blocks.map((b, i) =>
        b.kind === "p" ? (
          <p key={i}>
            <Inline text={b.text} />
          </p>
        ) : b.kind === "code" ? (
          <pre key={i} className="overflow-x-auto rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink/90">
            <code>{b.text}</code>
          </pre>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-topic">
            {b.items.map((item, j) => (
              <li key={j}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

/** `backticks` inside prose render as inline code. */
export function Inline({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
      <code key={i} className="rounded bg-bg px-1 py-px font-mono text-[12px] text-topic">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}
