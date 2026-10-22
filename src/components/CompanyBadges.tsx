"use client";

import { useState } from "react";
import { OTHER_SECTOR, SECTORS, companyHue, companyInitials, companyLogos, sectorOf, type Sector } from "@/lib/companies";

export function CompanyIcon({ name, size = 20 }: { name: string; size?: number }) {
  const sources = companyLogos(name);
  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];
  // Guarded so onError and the ref check can't both advance past the same source.
  const next = () => setAttempt((a) => (a === attempt ? a + 1 : a));
  // A miss on the first source is a 16px placeholder rather than an error. The ref catches images that
  // finished loading before hydration, when onLoad/onError never fire.
  const check = (img: HTMLImageElement | null) => {
    if (img?.complete && (img.naturalWidth === 0 || (attempt === 0 && img.naturalWidth <= 16))) next();
  };
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- tiny remote favicons; next/image would need remotePatterns and buys nothing here
      <img
        key={src}
        ref={check}
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onLoad={(e) => check(e.currentTarget)}
        onError={next}
        className="shrink-0 rounded-full bg-white object-contain p-[2px]"
        style={{ width: size, height: size }}
      />
    );
  }
  const hue = companyHue(name);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-semibold leading-none"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue} 55% 22%)`, color: `hsl(${hue} 85% 78%)` }}
    >
      {companyInitials(name)}
    </span>
  );
}

/** Overlapping logos plus a "+N" count. Purely visual; wrap it in a button to make it interactive. */
export function CompanyStack({ companies, max = 5, size = 22 }: { companies: string[]; max?: number; size?: number }) {
  const shown = companies.slice(0, max);
  const rest = companies.length - shown.length;
  return (
    <span className="flex items-center">
      <span className="flex -space-x-1.5">
        {shown.map((c) => (
          <span key={c} title={c} className="rounded-full ring-2 ring-panel">
            <CompanyIcon name={c} size={size} />
          </span>
        ))}
      </span>
      {rest > 0 && <span className="ml-1.5 text-[11px] text-muted">+{rest}</span>}
    </span>
  );
}

/** Every company that asks a question, grouped under its sector. */
export function CompanyBreakdown({ companies, highlight }: { companies: string[]; highlight?: (c: string) => boolean }) {
  const groups = new Map<Sector, string[]>();
  for (const c of companies) {
    const s = sectorOf(c);
    if (!groups.has(s)) groups.set(s, []);
    groups.get(s)!.push(c);
  }
  const order = [...SECTORS, OTHER_SECTOR];
  const rows = [...groups].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  return (
    <div className="space-y-2">
      {rows.map(([s, cs]) => (
        <div key={s.key} className="flex flex-col gap-1.5 sm:flex-row sm:items-start">
          <span className="w-44 shrink-0 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted">
            {s.label} <span className="opacity-60">{cs.length}</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cs.map((c) => (
              <span
                key={c}
                className={`flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2 text-[11px] ${
                  highlight?.(c) ? "border-pulse bg-pulse/10 text-ink" : "border-line bg-panel-2 text-ink"
                }`}
              >
                <CompanyIcon name={c} size={16} />
                {c}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Logo strip of the companies that ask this question, most frequent first; "+N" opens the full list. */
export function CompanyBadges({ companies, max = 6 }: { companies: string[]; max?: number }) {
  const [open, setOpen] = useState(false);
  if (companies.length === 0) return null;

  if (open) {
    return (
      <div className="mt-2 space-y-2">
        <CompanyBreakdown companies={companies} />
        <button onClick={() => setOpen(false)} className="text-[11px] text-muted hover:text-ink">
          Show less
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      title={companies.join(", ")}
      aria-label={`Asked at ${companies.length} companies: ${companies.join(", ")}`}
      className="mt-1.5 flex items-center hover:opacity-80"
    >
      <CompanyStack companies={companies} max={max} size={20} />
    </button>
  );
}
