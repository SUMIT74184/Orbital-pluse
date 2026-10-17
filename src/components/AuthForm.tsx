"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { login, signup, type AuthState } from "@/app/actions/auth";
import { Logo } from "./Logo";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const tzRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tzRef.current) tzRef.current.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);

  const isSignup = mode === "signup";
  const input =
    "w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/20";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-semibold">{isSignup ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted">
            {isSignup ? "Start your daily DSA, System Design & MySQL routine." : "Log in to see today's targets."}
          </p>

          <form action={action} className="mt-6 space-y-4">
            {isSignup && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Name</span>
                <input name="name" required minLength={2} defaultValue={state?.fields?.name} className={input} autoComplete="name" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Email</span>
              <input name="email" type="email" required defaultValue={state?.fields?.email} className={input} autoComplete="email" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">Password</span>
              <input
                name="password"
                type="password"
                required
                minLength={isSignup ? 8 : undefined}
                className={input}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </label>
            {isSignup && <input ref={tzRef} type="hidden" name="timezone" />}

            {state?.error && (
              <p role="alert" className="rounded-lg border border-hard/30 bg-hard/10 px-3 py-2 text-sm text-hard">
                {state.error}
              </p>
            )}

            <button
              disabled={pending}
              className="w-full rounded-lg bg-pulse px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Please wait…" : isSignup ? "Create account" : "Log in"}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-pulse hover:underline">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
