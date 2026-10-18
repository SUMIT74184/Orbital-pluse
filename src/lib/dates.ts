// Dates are handled as YYYY-MM-DD strings in the user's own timezone, so "today"
// flips at the user's midnight regardless of where the server runs.

export function dateIn(date: Date, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function todayIn(timezone: string): string {
  return dateIn(new Date(), timezone);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function diffDays(a: string, b: string): number {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

/** Milliseconds `timezone` is ahead of UTC at the instant `at`. */
function tzOffset(at: Date, timezone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    })
      .formatToParts(at)
      .map((p) => [p.type, Number(p.value)]),
  );
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUtc - Math.floor(at.getTime() / 1000) * 1000;
}

/** The UTC instant of `hour`:00 on `date` (YYYY-MM-DD) in `timezone`. Re-checks the offset once so DST days land right. */
export function zonedTime(date: string, hour: number, timezone: string): Date {
  const guess = Date.parse(`${date}T${String(hour).padStart(2, "0")}:00:00Z`);
  let at = guess - tzOffset(new Date(guess), timezone);
  at = guess - tzOffset(new Date(at), timezone);
  return new Date(at);
}

/** Next `hour`:00 in `timezone` strictly after `after`; with `weekday` set, only on that weekday (0 = Sunday). */
export function nextSlot(after: Date, timezone: string, hour: number, weekday?: number): Date {
  let day = dateIn(after, timezone);
  for (let i = 0; i < 8; i++, day = addDays(day, 1)) {
    if (weekday !== undefined && weekdayOf(day) !== weekday) continue;
    const at = zonedTime(day, hour, timezone);
    if (at > after) return at;
  }
  throw new Error("unreachable");
}
