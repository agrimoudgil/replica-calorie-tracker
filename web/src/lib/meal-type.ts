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

export function parseMealType(value: unknown): MealType | null {
  return typeof value === "string" && (MEAL_TYPES as readonly string[]).includes(value) ? (value as MealType) : null;
}
