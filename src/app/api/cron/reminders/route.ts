import { timingSafeEqual } from "node:crypto";
import { dispatchDue } from "@/lib/reminders";

export const maxDuration = 60;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get("authorization") ?? "";
  if (!secret) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Called hourly by .github/workflows/reminders.yml. Safe to call any number of times:
// each user's slot is claimed atomically, so nobody gets the same email twice.
export async function GET(req: Request) {
  if (!authorized(req)) return new Response("Unauthorized", { status: 401 });
  return Response.json(await dispatchDue());
}
