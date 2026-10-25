import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { readUnsubscribeToken } from "@/lib/reminders";
import { appUrl } from "@/lib/email";

async function unsubscribe(token: string | null) {
  const userId = token ? await readUnsubscribeToken(token) : null;
  if (!userId) return false;
  await connectDB();
  await User.updateOne(
    { _id: userId },
    { $set: { "reminders.daily": false, "reminders.weekly": false, "reminders.dailyAt": null, "reminders.weeklyAt": null } },
  );
  return true;
}

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0a0e13;color:#e6edf3;font-family:system-ui,sans-serif;padding:16px">
<div style="max-width:420px;background:#10161d;border:1px solid #1f2a36;border-radius:12px;padding:24px">${body}</div></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

// GET only shows a button: mail scanners prefetch links, and that mustn't unsubscribe anyone.
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token || !(await readUnsubscribeToken(token))) return page("Invalid link", "<p>This unsubscribe link isn't valid.</p>", 400);
  return page(
    "Unsubscribe",
    `<h1 style="font-size:18px;margin:0 0 8px">Stop reminder emails?</h1>
<p style="color:#8b98a5;font-size:14px">You won't get daily or weekly emails from Orbit-Plus. You can turn them back on in your profile any time.</p>
<form method="post"><input type="hidden" name="token" value="${token.replace(/[^\w.-]/g, "")}">
<button style="margin-top:12px;background:#ff6a3d;color:#000;font-weight:700;border:0;border-radius:8px;padding:10px 16px;cursor:pointer">Unsubscribe</button></form>`,
  );
}

// Handles the form above and RFC 8058 one-click unsubscribe from mail clients (token in the query string).
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const token = new URL(req.url).searchParams.get("token") ?? (form?.get("token") as string | null);
  if (!(await unsubscribe(token))) return page("Invalid link", "<p>This unsubscribe link isn't valid.</p>", 400);
  return page(
    "Unsubscribed",
    `<h1 style="font-size:18px;margin:0 0 8px">You're unsubscribed</h1>
<p style="color:#8b98a5;font-size:14px">No more reminder emails. <a href="${appUrl("/profile")}" style="color:#ff6a3d">Turn them back on</a></p>`,
  );
}
