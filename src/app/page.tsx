import Link from "next/link";
import { Logo } from "@/components/Logo";
import { QUESTIONS, WEEKDAYS, DEFAULT_SCHEDULE, DEFAULT_REVISION_DAYS } from "@/data/catalog";
import { TRACKS } from "@/data/topics";

const ORDER = [1, 2, 3, 4, 5, 6, 0];

export default function Landing() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="rounded-lg px-3 py-2 text-muted hover:text-ink">
            Log in
          </Link>
          <Link href="/signup" className="rounded-lg bg-pulse px-3 py-2 font-semibold text-black hover:brightness-110">
            Sign up
          </Link>
        </nav>
      </header>

      <section className="py-16 text-center sm:py-24">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-pulse">Interview prep, on a heartbeat</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Know exactly what to solve and what to revise — every single day.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted">
          {QUESTIONS.length} curated DSA questions, a weekly topic rotation, spaced revisions on days{" "}
          {DEFAULT_REVISION_DAYS.join(", ")}, plus a daily System Design and MySQL topic.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="rounded-lg bg-pulse px-5 py-3 font-semibold text-black hover:brightness-110">
            Start tracking — it&apos;s free
          </Link>
          <Link href="/login" className="rounded-lg border border-line px-5 py-3 font-medium hover:border-muted">
            I have an account
          </Link>
        </div>
        <svg viewBox="0 0 600 80" className="mx-auto mt-14 w-full max-w-2xl" aria-hidden>
          <path
            d="M0 50 H120 l8 -10 l8 10 H170 l6 8 l10 -52 l10 62 l8 -18 H260 q12 -18 24 0 H330 l6 8 l10 -52 l10 62 l8 -18 H420 q12 -18 24 0 H600"
            pathLength={1}
            fill="none"
            className="ecg-trace stroke-pulse"
            strokeWidth="2.5"
            strokeLinejoin="round"
            style={{ filter: "drop-shadow(0 0 6px rgb(34 229 132 / 0.7))" }}
          />
        </svg>
      </section>

      <section className="grid gap-4 pb-16 sm:grid-cols-3">
        <div className="card p-5">
          <h2 className="font-semibold">Daily target</h2>
          <p className="mt-2 text-sm text-muted">3 new questions a day, picked from that weekday&apos;s topics. Missed ones stay on your list.</p>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">Spaced revision</h2>
          <p className="mt-2 text-sm text-muted">Every solved question comes back after {DEFAULT_REVISION_DAYS.join(", ")} days so it sticks.</p>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold">System Design + MySQL</h2>
          <p className="mt-2 text-sm text-muted">
            {TRACKS.sd.topics.length} system design and {TRACKS.sql.topics.length} MySQL topics, one of each per day.
          </p>
        </div>
        <div className="card p-5 sm:col-span-3">
          <h2 className="font-semibold">Weekly rotation</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-7">
            {ORDER.map((d) => (
              <div key={d} className="rounded-lg bg-panel-2 p-3">
                <div className="font-mono text-xs text-pulse">{WEEKDAYS[d]}</div>
                <div className="mt-1 text-muted">{DEFAULT_SCHEDULE[d].join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
