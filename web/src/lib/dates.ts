export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/** The calendar day (YYYY-MM-DD) that an instant falls on in a time zone. */
export function localDate(at: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(at);
}

/** Hour of day (0–23) in a time zone, used to suggest the meal type. */
export function localHour(at: Date, timeZone: string = DEFAULT_TIMEZONE): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", hourCycle: "h23" }).format(at));
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}
