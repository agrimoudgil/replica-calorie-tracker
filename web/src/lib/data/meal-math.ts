import { healthScore } from "@/lib/nutrition/score";
import { rescaleItem, sumNutrients } from "@/lib/nutrition/portions";
import type { Food } from "@/lib/nutrition/types";
import { DataError, type Meal, type MealItem, type SaveMealInput } from "./types";

export function mealTotals(meal: Pick<Meal, "items">) {
  return sumNutrients(meal.items.map((i) => i.nutrients));
}

export function mealScore(items: MealItem[]): number | null {
  return items.length ? healthScore(sumNutrients(items.map((i) => i.nutrients))) : null;
}

/**
 * Applies the user's edits to a meal's items. The server never trusts nutrient
 * numbers from the client: it rescales each stored item to the new portion.
 */
export function applyItemEdits(meal: Meal, edits: SaveMealInput["items"], foods: readonly Food[]): MealItem[] {
  if (edits.length === 0) throw new DataError("invalid", "A meal needs at least one item.");
  const byId = new Map(meal.items.map((i) => [i.id, i]));
  const seen = new Set<string>();
  return edits.map((edit, position) => {
    const item = byId.get(edit.id);
    if (!item) throw new DataError("invalid", "Unknown item in this meal.");
    if (seen.has(edit.id)) throw new DataError("invalid", "Item listed twice.");
    seen.add(edit.id);
    const food = item.foodId ? (foods.find((f) => f.id === item.foodId) ?? null) : null;
    return { ...rescaleItem(item, edit.quantity, edit.unit, food), position };
  });
}
