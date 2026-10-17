import { MEAL_TYPES, type MealType } from "@/lib/nutrition/types";

/** Display names. Lives here (not in a client component file) so server pages can read it. */
export const MEAL_LABEL: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack: "Snack",
  dinner: "Dinner",
};

/** A sensible default meal type for the local hour; the user can always change it. */
export function suggestMealType(hour: number): MealType {
  if (hour >= 4 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 19) return "snack";
  return "dinner";
}

/** How the day's calories are split across meals, for the per-meal budgets on Today. */
export const MEAL_SHARE: Record<MealType, number> = { breakfast: 0.25, lunch: 0.3, snack: 0.15, dinner: 0.3 };

/** Each meal's calorie budget, rounded to 10 kcal (1,600 kcal → 400 / 480 / 240 / 480). */
export function mealBudgets(dailyKcal: number): Record<MealType, number> {
  return Object.fromEntries(MEAL_TYPES.map((t) => [t, Math.round((dailyKcal * MEAL_SHARE[t]) / 10) * 10])) as Record<MealType, number>;
}

export function parseMealType(value: unknown): MealType | null {
  return typeof value === "string" && (MEAL_TYPES as readonly string[]).includes(value) ? (value as MealType) : null;
}
