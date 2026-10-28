"use client";

import { useActionState, useState } from "react";
import { changePassword, deleteAccount, updateProfile, type FormState } from "@/app/actions/profile";

const input =
  "w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/20";

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <input {...props} className={input} />
    </label>
  );
}

function Status({ state }: { state: FormState }) {
  if (state?.ok) return <span className="text-sm text-pulse">{state.ok} ✓</span>;
  if (state?.error)
    return (
      <span role="alert" className="text-sm text-hard">
        {state.error}
      </span>
    );
  return null;
}

export function ProfileForms({ name, email }: { name: string; email: string }) {
  const [pState, pAction, pPending] = useActionState<FormState, FormData>(updateProfile, undefined);
  const [wState, wAction, wPending] = useActionState<FormState, FormData>(changePassword, undefined);
  const [dState, dAction, dPending] = useActionState<FormState, FormData>(deleteAccount, undefined);
  const [confirm, setConfirm] = useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form action={pAction} className="card space-y-4 p-5">
        <div>
          <h2 className="font-semibold">Account details</h2>
          <p className="mt-0.5 text-xs text-muted">Your name shows in the header and greeting. Email is used to log in.</p>
        </div>
        <Field label="Name" name="name" defaultValue={name} required minLength={2} autoComplete="name" />
        <Field label="Email" name="email" type="email" defaultValue={email} required autoComplete="email" />
        <div className="flex items-center gap-3">
          <button disabled={pPending} className="rounded-lg bg-pulse px-4 py-2 text-sm font-semibold text-on-accent hover:brightness-110 disabled:opacity-60">
            {pPending ? "Saving…" : "Save details"}
          </button>
          <Status state={pState} />
        </div>
      </form>

      <form action={wAction} className="card space-y-4 p-5">
        <div>
          <h2 className="font-semibold">Change password</h2>
          <p className="mt-0.5 text-xs text-muted">At least 8 characters.</p>
        </div>
        <Field label="Current password" name="current" type="password" required autoComplete="current-password" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" name="next" type="password" required minLength={8} autoComplete="new-password" />
          <Field label="Confirm new password" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div className="flex items-center gap-3">
          <button disabled={wPending} className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:border-muted disabled:opacity-60">
            {wPending ? "Updating…" : "Update password"}
          </button>
          <Status state={wState} />
        </div>
      </form>

      <form action={dAction} className="card space-y-4 border-hard/30 p-5 lg:col-span-2">
        <div>
          <h2 className="font-semibold text-hard">Delete account</h2>
          <p className="mt-0.5 text-xs text-muted">
            Permanently removes your account, solved questions, revision history and topic progress. This can&apos;t be undone.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field
              label={`Type ${email} to confirm`}
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button
            disabled={dPending || confirm.trim().toLowerCase() !== email}
            className="rounded-lg bg-hard px-4 py-2.5 text-sm font-semibold text-on-accent hover:brightness-110 disabled:opacity-40"
          >
            {dPending ? "Deleting…" : "Delete my account"}
          </button>
        </div>
        <Status state={dState} />
      </form>
    </div>
  );
}
