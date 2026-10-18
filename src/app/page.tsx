import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { connection } from "next/server";
import { DEFAULT_SCHEDULE, DEFAULT_REVISION_DAYS, DEFAULT_DAILY_TARGET } from "@/data/catalog";
import { getCatalog } from "@/lib/catalog";
import { getUser } from "@/lib/auth";
import { WeekRotation } from "@/components/WeekRotation";
import { Reveal, CountUp } from "@/components/landing/Reveal";
import { OrbitHero, TodayCard, StreakGrid, MiniMarket, RevisionCurve, Ticker, Flame } from "@/components/landing/Visuals";

const WORDS = ["a daily habit", "a streak", "a reflex", "a no-brainer", "a daily habit"];

export default async function Home() {
  await connection(); // the catalog lives in the database, which isn't reachable at build time
  const [cat, user] = await Promise.all([getCatalog(), getUser()]);
  const trackNames = cat.tracks.map((t) => t.name);
  const topicCount = cat.tracks.reduce((n, t) => n + t.topics.length, 0);
  const primary = user
    ? { href: "/dashboard", label: "Continue your streak" }
    : { href: "/signup", label: "Start your streak — free" };

  const ticker = [
    ...cat.meta.groups.map((g) => ({ label: g, value: `${cat.meta.counts[g] ?? 0} Qs` })),
    ...cat.tracks.map((t) => ({ label: t.name, value: `${t.topics.length} topics` })),
  ];

  return (
    <div className="relative flex-1 overflow-x-clip">
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 text-sm text-muted md:flex">
            <a href="#how" className="rounded-lg px-3 py-2 hover:text-ink">How it works</a>
            <a href="#habit" className="rounded-lg px-3 py-2 hover:text-ink">Habit</a>
            <a href="#revision" className="rounded-lg px-3 py-2 hover:text-ink">Revision</a>
            <a href="#week" className="rounded-lg px-3 py-2 hover:text-ink">Weekly plan</a>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <Link href="/dashboard" className="rounded-lg bg-pulse px-3 py-2 font-semibold text-black hover:brightness-110">
                Open dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-3 py-2 text-muted hover:text-ink">Log in</Link>
                <Link href="/signup" className="rounded-lg bg-pulse px-3 py-2 font-semibold text-black hover:brightness-110">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="aurora pointer-events-none absolute -top-40 left-[2%] size-[32rem] rounded-full" style={{ background: "radial-gradient(circle, rgb(34 229 132 / 0.22), transparent 65%)" }} aria-hidden />
        <div className="aurora pointer-events-none absolute top-20 right-0 size-[30rem] rounded-full" style={{ background: "radial-gradient(circle, rgb(76 154 255 / 0.18), transparent 65%)", animationDelay: "-7s" }} aria-hidden />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20 lg:pb-24">
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-pulse/30 bg-pulse/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-pulse">
                <span className="ecg-blink size-1.5 rounded-full bg-pulse" /> Built for placement season
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
                Make interview prep
                <span className="relative mt-1 block h-[1.15em] overflow-hidden">
                  <span className="word-cycle absolute inset-x-0 top-0 flex flex-col">
                    {WORDS.map((w, i) => (
                      <span key={i} className="text-shine block h-[1.15em]">{w}.</span>
                    ))}
                  </span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted lg:mx-0">
                No more “what should I solve today?”. Orbit-Plus hands you {DEFAULT_DAILY_TARGET} DSA questions, the
                revisions that are due, and a {trackNames.join(" + ")} topic — every day. Show up, tick them off, watch the streak grow.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link href={primary.href} className="group rounded-xl bg-pulse px-6 py-3.5 font-semibold text-black shadow-[0_0_40px_-8px_rgb(34_229_132/0.8)] transition hover:brightness-110">
                  {primary.label} <span className="inline-block transition group-hover:translate-x-1">→</span>
                </Link>
                <a href="#how" className="rounded-xl border border-line bg-panel/60 px-6 py-3.5 font-medium transition hover:border-muted">
                  See how it works
                </a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-xs text-muted lg:justify-start">
                <span><span className="text-new">●</span> {DEFAULT_DAILY_TARGET} new / day</span>
                <span><span className="text-rev">●</span> revisions on D{DEFAULT_REVISION_DAYS.join(", D")}</span>
                <span><span className="text-topic">●</span> ~45 min a day</span>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="flex justify-center">
            <div className="float-y w-full max-w-md">
              <OrbitHero />
            </div>
          </Reveal>
        </div>
      </section>

      <Ticker items={ticker} />

      {/* Stats */}
      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-14 sm:px-6 md:grid-cols-4">
        {[
          { n: cat.questions.length, label: "curated DSA questions", color: "text-new" },
          { n: cat.meta.groups.length, label: "patterns, one by one", color: "text-easy" },
          { n: topicCount, label: `${trackNames.join(" & ")} topics`, color: "text-topic" },
          { n: DEFAULT_REVISION_DAYS.length, label: "revision checkpoints", color: "text-rev" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 90}>
            <div className="card lift p-5 text-center">
              <p className={`text-4xl font-semibold tracking-tight ${s.color}`}>
                <CountUp to={s.n} />
              </p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* How a day works */}
      <section id="how" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <SectionLabel>How a day works</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Open. Solve. Tick. Done.</h2>
            <p className="mt-4 text-muted">
              The hardest part of prep isn&apos;t the questions — it&apos;s deciding what to do and actually starting. We removed both.
            </p>
          </Reveal>
          <ol className="mt-8 space-y-4">
            {[
              { t: "Your list is ready when you wake up", d: "Today's patterns come from the weekly rotation, so every day has a clear focus.", c: "bg-new" },
              { t: `Solve ${DEFAULT_DAILY_TARGET} new questions`, d: "Missed one yesterday? It stays on your list — no guilt, no lost progress.", c: "bg-pulse" },
              { t: "Clear what's due for revision", d: "Questions you solved come back at exactly the right time, before you forget them.", c: "bg-rev" },
              { t: `Read one ${trackNames.join(" & one ")} topic`, d: "Ten focused minutes on the stuff interviews love to ask after the DSA round.", c: "bg-topic" },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 100}>
                <li className="flex gap-4">
                  <span className="relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-line bg-panel font-mono text-sm">
                    <span className={`absolute inset-0 rounded-full ${s.c} opacity-15`} />
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{s.t}</p>
                    <p className="mt-1 text-sm text-muted">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal delay={150}>
          <TodayCard />
        </Reveal>
      </section>

      {/* Habit */}
      <section id="habit" className="relative scroll-mt-20 py-16">
        <div className="aurora pointer-events-none absolute top-1/4 left-1/4 size-[36rem] rounded-full" style={{ background: "radial-gradient(circle, rgb(34 229 132 / 0.08), transparent 65%)" }} aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <SectionLabel>Don&apos;t break the chain</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Consistency beats cramming. Every time.</h2>
            <p className="mt-4 text-muted">
              Six months of 45-minute days is ~400 questions and every revision done. Orbit-Plus turns that into something you
              actually want to keep up — like a gym streak, but for your offer letter.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <Reveal>
              <div className="card p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">Current streak</p>
                    <p className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
                      <span className="text-topic"><Flame className="size-7" /></span>
                      <CountUp to={47} /> <span className="text-base font-normal text-muted">days</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted">Solved</p>
                    <p className="text-3xl font-semibold tracking-tight text-pulse"><CountUp to={318} /></p>
                  </div>
                </div>
                <StreakGrid />
              </div>
            </Reveal>
            <div className="grid gap-4">
              <Reveal delay={120}><MiniMarket /></Reveal>
              <Reveal delay={200}>
                <div className="card p-4">
                  <p className="text-sm font-medium">Small days still count</p>
                  <p className="mt-1 text-xs text-muted">
                    Busy with exams? One revision keeps the chain alive. Unfinished questions roll over to tomorrow automatically.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { icon: "🎯", t: "Zero decision fatigue", d: "Open the app, see exactly what to do. Your brain saves its energy for the actual problem." },
              { icon: "📬", t: "Gentle nudges", d: "Opt-in email reminders at the time you choose, so tomorrow-you doesn't forget." },
              { icon: "📈", t: "Progress you can see", d: "Charts per pattern and difficulty show where you're strong and what to push next." },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 100}>
                <div className="card lift h-full p-5">
                  <span className="text-2xl">{f.icon}</span>
                  <p className="mt-3 font-semibold">{f.t}</p>
                  <p className="mt-1 text-sm text-muted">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Revision */}
      <section id="revision" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionLabel>Spaced revision</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Solve it once. Remember it in the interview.</h2>
          <p className="mt-4 text-muted">
            Most people solve a question, feel good, and forget it by next week. Every question you solve here comes back on day{" "}
            {DEFAULT_REVISION_DAYS.join(", ")} — each revisit locks it in longer, until the pattern is second nature.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="card p-5">
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span className="font-mono">memory over time</span>
              <span className="flex items-center gap-3 font-mono">
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-pulse" /> with Orbit-Plus</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-hard/60" /> without</span>
              </span>
            </div>
            <RevisionCurve days={DEFAULT_REVISION_DAYS} />
          </div>
        </Reveal>
      </section>

      {/* Weekly rotation */}
      <section id="week" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <Reveal className="max-w-2xl">
          <SectionLabel>The weekly plan</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A focus for every day of the week.</h2>
          <p className="mt-4 text-muted">Patterns rotate so nothing goes stale. Prefer a different mix? Change it any time in Settings.</p>
        </Reveal>
        <Reveal delay={120} className="mt-8">
          <div className="card p-5">
            <WeekRotation schedule={DEFAULT_SCHEDULE} meta={cat.meta} today={new Date().getDay()} />
          </div>
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-20 sm:px-6">
        <Reveal>
          <div className="glow-border rounded-3xl">
            <div className="relative overflow-hidden rounded-3xl bg-panel px-6 py-14 text-center sm:px-12">
              <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
              <p className="relative font-mono text-xs uppercase tracking-[0.2em] text-pulse">Day 1 starts today</p>
              <h2 className="relative mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
                Future you, with the offer letter, says thanks.
              </h2>
              <p className="relative mx-auto mt-4 max-w-lg text-muted">Free. Takes 30 seconds to sign up. Your first 3 questions are already waiting.</p>
              <Link href={primary.href} className="relative mt-8 inline-block rounded-xl bg-pulse px-7 py-3.5 font-semibold text-black shadow-[0_0_40px_-6px_rgb(34_229_132/0.9)] transition hover:brightness-110">
                {primary.label} →
              </Link>
              <svg viewBox="0 0 600 80" className="relative mx-auto mt-10 w-full max-w-2xl" aria-hidden>
                <path
                  d="M0 50 H120 l8 -10 l8 10 H170 l6 8 l10 -52 l10 62 l8 -18 H260 q12 -18 24 0 H330 l6 8 l10 -52 l10 62 l8 -18 H420 q12 -18 24 0 H600"
                  pathLength={1}
                  fill="none"
                  className="ecg-trace on-reveal stroke-pulse"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 0 6px rgb(34 229 132 / 0.7))" }}
                />
              </svg>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row sm:px-6">
          <Logo />
          <p>Daily DSA, {trackNames.join(" & ")} — one day at a time.</p>
          <div className="flex gap-4">
            {user ? <Link href="/dashboard" className="hover:text-ink">Dashboard</Link> : <Link href="/login" className="hover:text-ink">Log in</Link>}
            <a href="#how" className="hover:text-ink">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.2em] text-pulse">{children}</p>;
}
