import "server-only";

export type Email = { to: string; subject: string; html: string; text: string; headers?: Record<string, string> };

export class EmailError extends Error {
  constructor(
    message: string,
    /** Provider is throttling us: stop this run and let the next one pick up the rest. */
    readonly rateLimited = false,
  ) {
    super(message);
  }
}

// Resend's REST API directly; swapping providers only means changing this function.
export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new EmailError("RESEND_API_KEY is not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Orbit-Plus <onboarding@resend.dev>",
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
      headers: email.headers,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new EmailError(`Resend ${res.status}: ${body.slice(0, 300)}`, res.status === 429);
  }
}

export function appUrl(path = "") {
  const base =
    process.env.APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path}`;
}
