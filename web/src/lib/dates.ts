export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/** The calendar day (YYYY-MM-DD) that an instant falls on in a time zone. */
export function localDate(at: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** Hour of day (0–23) in a time zone, used to suggest the meal type. */
export function localHour(at: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(at));
}

/** YYYY-MM-DD shifted by whole days. */
export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Minutes the zone is ahead of UTC at that instant (IST: 330). */
function zoneOffsetMinutes(at: number, timeZone: string): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
      .formatToParts(new Date(at))
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - Math.floor(at / 1000) * 1000) / 60_000);
}

/** The UTC instant for a wall-clock time on a calendar day in a time zone (DST-safe). */
export function zonedTimeToUtc(date: string, hour: number, minute: number, timeZone: string = DEFAULT_TIMEZONE): string {
  const [y, m, d] = date.split("-").map(Number);
  const wall = Date.UTC(y, m - 1, d, hour, minute);
  let instant = wall - zoneOffsetMinutes(wall, timeZone) * 60_000;
  instant = wall - zoneOffsetMinutes(instant, timeZone) * 60_000; // second pass settles DST edges
  return new Date(instant).toISOString();
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}
