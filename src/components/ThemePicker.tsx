"use client";

import { useState, useTransition } from "react";
import { saveTheme } from "@/app/actions/settings";
import type { Theme } from "@/data/theme";

// Fixed swatches, so each card previews its own theme whatever theme the page is in now.
const DARK = { bg: "#0a0e13", panel: "#10161d", line: "#1f2a36", ink: "#e6edf3", muted: "#8b98a5", accent: "#ff6a3d" };
const SILVER = { bg: "#c8ccd1", panel: "#d2d5da", line: "#b1b6bd", ink: "#202429", muted: "#4f5761", accent: "#913c16" };

const OPTIONS: { key: Theme; label: string; note: string }[] = [
  { key: "dark", label: "Dark", note: "Deep navy, easy on the eyes in a dark room." },
  { key: "light", label: "Light", note: "Dimmed silver-grey — no white anywhere, so it never glares." },
  { key: "system", label: "System", note: "Follows your device: light by day, dark when it switches." },
];

/** Settings → Appearance. The page changes colour on click; the choice is then saved to the account. */
export function ThemePicker({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState(initial);
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [pending, start] = useTransition();

  function pick(t: Theme) {
    if (t === theme) return;
    const prev = theme;
    setTheme(t);
    setStatus("");
    // The app shell carries data-theme; changing it switches every colour at once (see globals.css).
    document.querySelector("[data-theme]")?.setAttribute("data-theme", t);
    start(async () => {
      const res = await saveTheme(t);
      if (res.error) {
        setTheme(prev);
        document.querySelector("[data-theme]")?.setAttribute("data-theme", prev);
        setStatus("error");
      } else {
        setStatus("saved");
      }
    });
  }

  return (
    <section id="appearance" className="card scroll-mt-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-semibold">Appearance</h2>
          <p className="mt-0.5 text-sm text-muted">Saved to your account, so every device opens in the same theme.</p>
        </div>
        <p className="text-xs text-muted" aria-live="polite">
          {pending ? "Saving…" : status === "saved" ? "Saved ✓" : status === "error" ? "Couldn't save — try again" : ""}
        </p>
      </div>
      <div role="radiogroup" aria-label="Theme" className="mt-4 grid gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const on = o.key === theme;
          return (
            <button
              key={o.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => pick(o.key)}
              className={`rounded-xl border p-2.5 text-left transition ${on ? "border-pulse ring-1 ring-pulse" : "border-line hover:border-muted"}`}
            >
              <Preview theme={o.key} />
              <span className="mt-2.5 flex items-center gap-2 px-0.5 text-sm font-medium">
                <span className={`grid size-4 place-items-center rounded-full border ${on ? "border-pulse" : "border-muted"}`}>
                  {on && <span className="size-2 rounded-full bg-pulse" />}
                </span>
                {o.label}
              </span>
              <span className="mt-0.5 block px-0.5 text-xs leading-relaxed text-muted">{o.note}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/** A tiny drawing of the app (sidebar, heading, two rows) in the theme's colours; System shows both halves. */
function Preview({ theme }: { theme: Theme }) {
  if (theme === "system") {
    return (
      <div className="relative h-20 overflow-hidden rounded-lg border border-line">
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}>
          <Mini c={SILVER} />
        </div>
        <div className="absolute inset-0" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}>
          <Mini c={DARK} />
        </div>
      </div>
    );
  }
  return (
    <div className="h-20 overflow-hidden rounded-lg border border-line">
      <Mini c={theme === "light" ? SILVER : DARK} />
    </div>
  );
}

function Mini({ c }: { c: typeof DARK }) {
  return (
    <div className="flex h-full" style={{ background: c.bg }}>
      <div className="w-1/4 space-y-1.5 border-r p-2" style={{ borderColor: c.line, background: c.panel }}>
        <div className="h-1.5 w-3/4 rounded-full" style={{ background: c.accent }} />
        <div className="h-1 w-full rounded-full" style={{ background: c.muted, opacity: 0.5 }} />
        <div className="h-1 w-2/3 rounded-full" style={{ background: c.muted, opacity: 0.5 }} />
      </div>
      <div className="flex-1 space-y-2 p-2.5">
        <div className="h-2 w-1/2 rounded-full" style={{ background: c.ink, opacity: 0.85 }} />
        <div className="space-y-1.5 rounded-md border p-2" style={{ borderColor: c.line, background: c.panel }}>
          <div className="h-1 w-5/6 rounded-full" style={{ background: c.muted, opacity: 0.6 }} />
          <div className="h-1 w-2/3 rounded-full" style={{ background: c.muted, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}
