import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect width="28" height="28" rx="8" className="fill-pulse/15" />
        <path d="M3 15h6l2-5 3 10 3-13 2 8h6" fill="none" className="stroke-pulse" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>
        DSA <span className="text-pulse">Pulse</span>
      </span>
    </Link>
  );
}
