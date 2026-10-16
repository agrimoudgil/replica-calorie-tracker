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

export type NutrientRow = {
  key: "sodiumMg" | "satFatG" | "sugarG" | "ironMg" | "calciumMg";
  label: string;
  value: number | null;
  unit: "mg" | "g";
  /** goal: reaching it is good; limit: staying under it is good; info: no target. */
  kind: "goal" | "limit" | "info";
  target: number | null;
  note?: string;
  /** Share of the day's items that have this nutrient; below 0.7 the total is likely too low. */
  coverage: number;
};

/**
 * One day's micronutrients against references: iron and calcium (ICMR-NIN 2020) as goals,
 * sodium (WHO, under 2,000 mg) and saturated fat (WHO, under 10% of energy) as limits.
 * Sugar here is total sugar, including milk and fruit, so it gets no target.
 */
export function dailyNutrientRows(
  totals: Partial<Record<NutrientRow["key"], number>>,
  coverage: Record<NutrientRow["key"], number>,
  sex: Sex,
  kcalTarget: number,
): NutrientRow[] {
  const ref = dailyReference(sex);
  const row = (key: NutrientRow["key"], label: string, unit: "mg" | "g", kind: NutrientRow["kind"], target: number | null, note?: string): NutrientRow => ({
    key, label, unit, kind, target, note, value: totals[key] ?? null, coverage: coverage[key],
  });
  return [
    row("ironMg", "Iron", "mg", "goal", ref.ironMg),
    row("calciumMg", "Calcium", "mg", "goal", ref.calciumMg),
    row("sodiumMg", "Sodium", "mg", "limit", ref.sodiumMaxMg, "About 5 g of salt"),
    row("satFatG", "Saturated fat", "g", "limit", Math.round((kcalTarget * 0.1) / 9)),
    row("sugarG", "Sugar", "g", "info", null, "Total sugar, including milk and fruit"),
  ];
}

/** YYYY-MM-DD dates for the `n` days ending on `today`, oldest first. */
export function lastNDates(today: string, n: number): string[] {
  const end = Date.parse(`${today}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) => new Date(end - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}
