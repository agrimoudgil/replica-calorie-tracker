import type { Sex } from "@/lib/nutrition/targets";

/**
 * Daily reference amounts for adults.
 * Iron and calcium: ICMR-NIN Recommended Dietary Allowances (2020) for Indians:
 * iron 19 mg (men) / 29 mg (women), calcium 1,000 mg. "other" uses the higher iron value.
 * Sodium: WHO advises under 2,000 mg a day (about 5 g of salt).
 */
export function dailyReference(sex: Sex) {
  return {
    ironMg: sex === "male" ? 19 : 29,
    calciumMg: 1000,
    sodiumMaxMg: 2000,
  };
}

/** YYYY-MM-DD dates for the `n` days ending on `today`, oldest first. */
export function lastNDates(today: string, n: number): string[] {
  const end = Date.parse(`${today}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) => new Date(end - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}
