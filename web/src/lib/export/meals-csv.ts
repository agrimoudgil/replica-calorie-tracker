import { toCsv, type Cell } from "@/lib/csv";
import type { Meal, MealItem } from "@/lib/data/types";
import { MEAL_LABEL } from "@/lib/meal-type";
import { round1, sumKnownNutrients } from "@/lib/nutrition/portions";
import type { Nutrients } from "@/lib/nutrition/types";

/*
 * Fix #3: everything a person logged, as spreadsheets. Saved meals only (drafts never
 * counted), dates and times in their own time zone, unknown values left blank.
 */

const NUTRIENT_COLUMNS: ReadonlyArray<[keyof Nutrients, string]> = [
  ["kcal", "Calories (kcal)"],
  ["proteinG", "Protein (g)"],
  ["carbG", "Carbs (g)"],
  ["fatG", "Fat (g)"],
  ["fiberG", "Fibre (g)"],
  ["sugarG", "Sugar (g)"],
  ["satFatG", "Saturated fat (g)"],
  ["sodiumMg", "Sodium (mg)"],
  ["calciumMg", "Calcium (mg)"],
  ["ironMg", "Iron (mg)"],
];

const SOURCE_LABEL: Record<MealItem["source"], string> = { ai: "AI estimate", db: "Food list", user: "Your numbers" };

export const ITEM_HEADER = [
  "Date", "Time", "Meal", "Food", "Hindi name", "Amount", "Unit", "Grams",
  ...NUTRIENT_COLUMNS.map(([, label]) => label),
  "Numbers from", "Meal score (out of 10)",
] as const;

export const DAY_HEADER = ["Date", "Meals", "Foods", ...NUTRIENT_COLUMNS.map(([, label]) => label)] as const;

const numbers = (n: Nutrients): Cell[] => NUTRIENT_COLUMNS.map(([key]) => {
  const v = n[key];
  return v === undefined ? null : round1(v);
});

const inOrder = (meals: readonly Meal[]) => [...meals].sort((a, b) => Date.parse(a.eatenAt) - Date.parse(b.eatenAt));

/** One row per food logged, oldest first. */
export function mealItemsCsv(meals: readonly Meal[], timeZone: string): string {
  const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone });
  const rows = inOrder(meals).flatMap((m) =>
    [...m.items]
      .sort((a, b) => a.position - b.position)
      .map((i): Cell[] => [
        m.localDate,
        time.format(new Date(m.eatenAt)),
        MEAL_LABEL[m.mealType],
        i.name,
        i.nameHi ?? null,
        i.quantity,
        i.unit,
        round1(i.grams),
        ...numbers(i.nutrients),
        SOURCE_LABEL[i.source],
        m.healthScore,
      ]),
  );
  return toCsv(ITEM_HEADER, rows);
}

/** One row per day with something logged. A mineral is blank on a day where any food has no value for it. */
export function dailyTotalsCsv(meals: readonly Meal[]): string {
  const days = new Map<string, Meal[]>();
  for (const m of inOrder(meals)) days.set(m.localDate, [...(days.get(m.localDate) ?? []), m]);
  const rows = [...days]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]): Cell[] => {
      const items = list.flatMap((m) => m.items);
      return [date, list.length, items.length, ...numbers(sumKnownNutrients(items.map((i) => i.nutrients)))];
    });
  return toCsv(DAY_HEADER, rows);
}
