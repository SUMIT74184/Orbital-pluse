import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "./db";
import { EmailLog, User, type EmailKind, type UserDoc } from "./models";
import { toAppUser, type AppUser } from "./auth";
import { getDashboard } from "./plan";
import { key } from "./session";
import { appUrl, EmailError, sendEmail, type Email } from "./email";
import { addDays, dateIn, formatDate, nextSlot, todayIn } from "./dates";

const SUNDAY = 0;
const MAX_ATTEMPTS = 3;
const FIELD = { daily: "reminders.dailyAt", weekly: "reminders.weeklyAt" } as const;

/** Next send times for the given preferences; null for anything switched off. */
export function scheduleFor(r: { daily: boolean; weekly: boolean; hour: number }, timezone: string, now = new Date()) {
  return {
    dailyAt: r.daily ? nextSlot(now, timezone, r.hour) : null,
    weeklyAt: r.weekly ? nextSlot(now, timezone, r.hour, SUNDAY) : null,
  };
}

// ---------- Unsubscribe links ----------

export async function unsubscribeUrl(userId: string) {
  const token = await new SignJWT({ purpose: "unsubscribe" }).setProtectedHeader({ alg: "HS256" }).setSubject(userId).sign(key());
  return appUrl(`/api/reminders/unsubscribe?token=${token}`);
}

export async function readUnsubscribeToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload.purpose === "unsubscribe" && typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

// ---------- Email content ----------

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const DIFF_COLOR = { Easy: "#0f9d74", Medium: "#c27c0e", Hard: "#d64545" } as const;

type Row = { title: string; url?: string; meta: string; color?: string };

function section(heading: string, accent: string, rows: Row[], more = 0) {
  if (!rows.length) return { html: "", text: "" };
  const items = rows
    .map(
      (r) => `<tr><td style="padding:8px 0;border-bottom:1px solid #eef0f3">
        ${r.url ? `<a href="${esc(r.url)}" style="color:#111827;font-weight:600;text-decoration:none">${esc(r.title)}</a>` : `<span style="color:#111827;font-weight:600">${esc(r.title)}</span>`}
        <div style="font-size:12px;color:${r.color ?? "#6b7280"};margin-top:2px">${esc(r.meta)}</div></td></tr>`,
    )
    .join("");
  const moreRow = more ? `<tr><td style="padding:8px 0;font-size:12px;color:#6b7280">+ ${more} more on your dashboard</td></tr>` : "";
  return {
    html: `<h2 style="margin:24px 0 4px;font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:${accent}">${esc(heading)}</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}${moreRow}</table>`,
    text: `\n${heading.toUpperCase()}\n${rows.map((r) => `- ${r.title} (${r.meta})${r.url ? `\n  ${r.url}` : ""}`).join("\n")}${more ? `\n+ ${more} more` : ""}\n`,
  };
}

async function layout(user: AppUser, intro: string, body: { html: string; text: string }[]) {
  const dashboard = appUrl("/dashboard");
  const unsub = await unsubscribeUrl(user.id);
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:24px">
  <tr><td>
    <div style="font-size:13px;font-weight:700;color:#0f9d74;letter-spacing:.04em">ORBIT-PLUS</div>
    <p style="font-size:15px;color:#111827;line-height:1.5;margin:12px 0 0">${intro}</p>
    ${body.map((b) => b.html).join("")}
    <p style="margin:28px 0 8px"><a href="${dashboard}" style="display:inline-block;background:#22e584;color:#000;font-weight:700;font-size:14px;padding:10px 18px;border-radius:8px;text-decoration:none">Open dashboard</a></p>
    <p style="font-size:11px;color:#9ca3af;margin-top:24px">You get this because reminders are on in your Orbit-Plus profile.
      <a href="${appUrl("/profile")}" style="color:#9ca3af">Change time</a> · <a href="${unsub}" style="color:#9ca3af">Unsubscribe</a></p>
  </td></tr></table></td></tr></table></body></html>`;
  const text = `${intro.replace(/<[^>]+>/g, "")}\n${body.map((b) => b.text).join("")}\nOpen dashboard: ${dashboard}\n\nChange time: ${appUrl("/profile")}\nUnsubscribe: ${unsub}\n`;
  return {
    html,
    text,
    headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}

const LIST_CAP = 8;
const capped = <T,>(xs: T[]) => ({ shown: xs.slice(0, LIST_CAP), more: Math.max(0, xs.length - LIST_CAP) });

/** Today's to-do list. Returns null when nothing is left to do, unless `force` (used for test emails). */
export async function buildDaily(user: AppUser, force = false): Promise<Omit<Email, "to"> | null> {
  const d = await getDashboard(user);
  const fresh = d.newItems.filter((i) => !i.solvedOn);
  const revs = d.revisions.filter((r) => !r.done);
  const topics = d.topics.filter((t) => !t.done);
  if (!force && !fresh.length && !revs.length && !d.missed.length && !topics.length) return null;

  const f = capped(fresh);
  const r = capped(revs);
  const m = capped(d.missed);
  const sections = [
    section("New today", "#2f7de1", f.shown.map((i) => ({ title: i.q.title, url: i.q.url, meta: `${i.q.difficulty} · ${i.q.pattern}`, color: DIFF_COLOR[i.q.difficulty] })), f.more),
    section(
      "Revise",
      "#7c4ddb",
      r.shown.map((i) => ({
        title: i.q.title,
        url: i.q.url,
        meta: `Revision ${i.revNo}/${i.revTotal}${i.overdueBy > 0 ? ` · ${i.overdueBy} day${i.overdueBy === 1 ? "" : "s"} overdue` : " · due today"}`,
        color: i.overdueBy > 0 ? "#d64545" : undefined,
      })),
      r.more,
    ),
    section("Backlog", "#6b7280", m.shown.map((i) => ({ title: i.q.title, url: i.q.url, meta: `Assigned ${formatDate(i.assignedOn)} · ${i.q.difficulty}` })), m.more),
    section("Topics", "#c27c0e", topics.map((t) => ({ title: t.topic.title, url: t.topic.practice?.[0]?.url, meta: `${t.trackName} · ${t.topic.section}` }))),
  ];

  const parts = [fresh.length && `${fresh.length} new`, revs.length && `${revs.length} revision${revs.length === 1 ? "" : "s"}`, d.missed.length && `${d.missed.length} backlog`].filter(Boolean);
  const subject = `${parts.length ? `Today: ${parts.join(" · ")}` : "You're all caught up"}${d.streak > 0 ? ` · 🔥 ${d.streak}-day streak` : ""}`;
  const intro = `Hi ${esc(user.name.split(" ")[0])}, here's your plan for <b>${formatDate(d.today, { weekday: "long", day: "numeric", month: "short" })}</b>.${
    d.streak > 0 ? ` You're on a ${d.streak}-day streak, keep it going.` : ""
  }`;
  return { subject: force ? `[Test] ${subject}` : subject, ...(await layout(user, intro, sections)) };
}

/** Sunday recap of the 7 days up to yesterday. */
export async function buildWeekly(user: AppUser): Promise<Omit<Email, "to"> | null> {
  const d = await getDashboard(user);
  const end = addDays(d.today, -1);
  const start = addDays(end, -6);
  const week = d.days.filter((x) => x.date >= start && x.date <= end);
  const solved = week.reduce((n, x) => n + x.solved, 0);
  const revised = week.reduce((n, x) => n + x.revised, 0);
  const topics = week.reduce((n, x) => n + x.topics, 0);
  const active = week.filter((x) => x.solved + x.revised + x.topics > 0).length;
  const overdue = d.revisions.filter((r) => !r.done && r.overdueBy > 0).length;

  // Started but furthest from done, among patterns that are on the weekly rotation.
  const scheduled = new Set(user.schedule.flat());
  const weakest = d.stats.byGroup
    .filter((g) => scheduled.has(g.group) && g.solved > 0 && g.solved < g.total)
    .sort((a, b) => a.solved / a.total - b.solved / b.total)[0];

  const stat = (label: string, value: string | number) =>
    `<td style="padding:12px;background:#f7f8fa;border-radius:8px;text-align:center;width:25%"><div style="font-size:22px;font-weight:700;color:#111827">${value}</div><div style="font-size:11px;color:#6b7280">${label}</div></td>`;
  const grid = {
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="6" style="margin-top:16px"><tr>${stat("solved", solved)}${stat(revised === 1 ? "revision" : "revisions", revised)}${stat(topics === 1 ? "topic" : "topics", topics)}${stat("active days", `${active}/7`)}</tr></table>`,
    text: `\nThis week: ${solved} solved · ${plural(revised, "revision")} · ${plural(topics, "topic")} · active ${active}/7 days\n`,
  };
  const notes: Row[] = [
    { title: `${d.stats.solved} of ${d.stats.totalQuestions} questions solved overall`, meta: `${plural(d.stats.revisionsDone, "revision")} done in total` },
    ...(overdue ? [{ title: `${overdue} revision${overdue === 1 ? " is" : "s are"} overdue`, meta: "Clear these first, one review catches up every missed round", color: "#d64545" }] : []),
    ...(weakest ? [{ title: `Needs attention: ${weakest.group}`, meta: `${weakest.solved}/${weakest.total} solved · ${Math.round((weakest.solved / weakest.total) * 100)}%` }] : []),
    ...(d.missed.length ? [{ title: `${d.missed.length} question${d.missed.length === 1 ? "" : "s"} in your backlog`, meta: "Assigned on earlier days, not solved yet" }] : []),
  ];

  const subject = `Your week: ${solved} solved · ${revised} revised · ${active}/7 days active`;
  const intro = `Hi ${esc(user.name.split(" ")[0])}, here's your week of <b>${formatDate(start)} – ${formatDate(end)}</b>.${
    d.streak > 0 ? ` Current streak: ${d.streak} day${d.streak === 1 ? "" : "s"}.` : ""
  }`;
  return { subject, ...(await layout(user, intro, [grid, section("Where you stand", "#0f9d74", notes)])) };
}

// ---------- Dispatcher ----------

type Outcome = "sent" | "skipped" | "failed" | "rate-limited" | "taken";

async function log(userId: AppUser["id"], kind: EmailKind, date: string, status: "sent" | "skipped" | "failed", detail: string | null) {
  await EmailLog.updateOne({ userId, kind, date }, { $set: { status, detail }, $inc: { attempts: status === "failed" ? 1 : 0 } }, { upsert: true });
}

async function processOne(doc: UserDoc, kind: EmailKind, now: Date): Promise<Outcome> {
  const user = toAppUser(doc);
  const field = FIELD[kind];
  const dueAt = kind === "daily" ? user.reminders.dailyAt! : user.reminders.weeklyAt!;
  const next = scheduleFor({ ...user.reminders, daily: true, weekly: true }, user.timezone, now)[kind === "daily" ? "dailyAt" : "weeklyAt"]!;

  // Claim the slot by moving it forward. If another run moved it first, this matches nothing and we back off.
  const claim = await User.updateOne({ _id: doc._id, [field]: dueAt }, { $set: { [field]: next } });
  if (!claim.modifiedCount) return "taken";

  const slotDate = dateIn(dueAt, user.timezone);
  if (slotDate !== todayIn(user.timezone)) {
    await log(user.id, kind, slotDate, "skipped", "missed: no run before the end of that day");
    return "skipped";
  }
  const prior = await EmailLog.findOne({ userId: doc._id, kind, date: slotDate }).lean();
  if (prior?.status === "sent") return "skipped";

  try {
    const email = kind === "daily" ? await buildDaily(user) : await buildWeekly(user);
    if (!email) {
      await log(user.id, kind, slotDate, "skipped", "nothing pending");
      return "skipped";
    }
    await sendEmail({ to: user.email, ...email });
    await log(user.id, kind, slotDate, "sent", null);
    return "sent";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await log(user.id, kind, slotDate, "failed", message);
    // Hand the slot back so the next run retries, a few times at most.
    if ((prior?.attempts ?? 0) + 1 < MAX_ATTEMPTS) await User.updateOne({ _id: doc._id, [field]: next }, { $set: { [field]: dueAt } });
    return err instanceof EmailError && err.rateLimited ? "rate-limited" : "failed";
  }
}

const BATCH = 100;
const PAUSE_MS = 550; // Resend's free tier allows 2 requests a second

/** Sends every reminder that's due. Stops early at the time budget; `more` tells the caller to call again. */
export async function dispatchDue(now = new Date(), budgetMs = 45_000) {
  await connectDB();
  const started = Date.now();
  const counts = { sent: 0, skipped: 0, failed: 0 };
  for (const kind of ["daily", "weekly"] as const) {
    const due = await User.find({ [FIELD[kind]]: { $ne: null, $lte: now } })
      .sort({ [FIELD[kind]]: 1 })
      .limit(BATCH)
      .lean();
    for (const doc of due) {
      if (Date.now() - started > budgetMs) return { ...counts, more: true };
      const outcome = await processOne(doc, kind, now);
      if (outcome === "rate-limited") return { ...counts, failed: counts.failed + 1, more: true };
      if (outcome !== "taken") counts[outcome]++;
      if (outcome === "sent" || outcome === "failed") await new Promise((r) => setTimeout(r, PAUSE_MS));
    }
    if (due.length === BATCH) return { ...counts, more: true };
  }
  return { ...counts, more: false };
}
