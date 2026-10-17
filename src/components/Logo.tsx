import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="16" className="fill-pulse/15" />
        <ellipse cx="32" cy="32" rx="25" ry="11" fill="none" className="stroke-pulse" strokeWidth="3.5" transform="rotate(-28 32 32)" />
        <circle cx="32" cy="32" r="10" className="fill-pulse" />
        <path d="M32 26.5v11M26.5 32h11" className="stroke-bg" strokeWidth="3.2" strokeLinecap="round" />
        <circle cx="53" cy="20" r="3.6" className="fill-new" />
      </svg>
      <span>
        Orbit<span className="text-pulse">-Plus</span>
      </span>
    </Link>
  );
}
