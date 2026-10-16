import { healthScore } from "@/lib/nutrition/score";
import { gramsFor, nutrientsForGrams, rescaleItem, round1, sumNutrients } from "@/lib/nutrition/portions";
import type { Food, Nutrients } from "@/lib/nutrition/types";
import { DataError, type ItemEdit, type MacroNumbers, type Meal, type MealItem, type QuickAdd } from "./types";

export function mealTotals(meal: Pick<Meal, "items">) {
  return sumNutrients(meal.items.map((i) => i.nutrients));
}

export function mealScore(items: Pick<MealItem, "nutrients">[]): number | null {
  return items.length ? healthScore(sumNutrients(items.map((i) => i.nutrients))) : null;
}

/** Quick-added items have no real weight; this nominal one keeps the database rules happy. */
export const QUICK_ADD_GRAMS = 100;

const LIMITS = { kcal: 5000, proteinG: 500, carbG: 1000, fatG: 500, fiberG: 200 } as const;

/** People's own numbers, kept within sane ranges (no negatives, no typos like 30000 kcal). */
export function cleanMacros(m: Partial<MacroNumbers>): MacroNumbers {
  const out = { kcal: 0, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 };
  for (const key of Object.keys(out) as Array<keyof MacroNumbers>) {
    const v = Number(m[key] ?? 0);
    out[key] = Number.isFinite(v) ? Math.min(Math.max(round1(v), 0), LIMITS[key]) : 0;
  }
  return out;
}

/** A catalogue food as a meal item, at this portion. */
export function itemFromFood(food: Food, quantity: number, unit: MealItem["unit"]): Omit<MealItem, "id" | "position"> {
  const grams = gramsFor(food, unit, quantity);
  return { foodId: food.id, name: food.name, nameHi: food.nameHi, quantity, unit, grams, nutrients: nutrientsForGrams(food, grams), source: "db" };
}

/** A quick-added item: the person's own name and numbers, one serving. */
export function quickAddItem(q: QuickAdd): Omit<MealItem, "id" | "position"> {
  const name = q.name.trim().slice(0, 120) || "Quick add";
  return { foodId: null, name, quantity: 1, unit: "piece", grams: QUICK_ADD_GRAMS, nutrients: cleanMacros(q), source: "user" };
}

/** True for quick-added items (no catalogue food, numbers typed by the person). */
export const isQuickAdd = (item: Pick<MealItem, "foodId" | "source">) => item.foodId === null && item.source === "user";

/**
 * Applies the person's edits to a meal. The server never trusts nutrient numbers it
 * didn't compute or the person didn't type as an override: portions are rescaled from
 * stored items, swaps and new items come from the catalogue the person can see.
 */
export function applyItemEdits(meal: Meal, edits: ItemEdit[], foods: readonly Food[]): MealItem[] {
  if (edits.length === 0) throw new DataError("invalid", "A meal needs at least one item.");
  const byId = new Map(meal.items.map((i) => [i.id, i]));
  const foodById = new Map(foods.map((f) => [f.id, f]));
  const mustFood = (id: string) => {
    const food = foodById.get(id);
    if (!food) throw new DataError("invalid", "One of the foods isn't in your food list.");
    return food;
  };
  const seen = new Set<string>();

  return edits.map((edit, position): MealItem => {
    if ("custom" in edit) return { ...quickAddItem(edit.custom), id: crypto.randomUUID(), position };
    if (!("id" in edit)) {
      const added: MealItem = { ...itemFromFood(mustFood(edit.foodId), edit.quantity, edit.unit), id: crypto.randomUUID(), position };
      return withNameAndNumbers(added, edit.name, edit.override);
    }

    const item = byId.get(edit.id);
    if (!item) throw new DataError("invalid", "Unknown item in this meal.");
    if (seen.has(edit.id)) throw new DataError("invalid", "Item listed twice.");
    seen.add(edit.id);

    let next: MealItem;
    if (edit.foodId && edit.foodId !== item.foodId) {
      next = { ...item, ...itemFromFood(mustFood(edit.foodId), edit.quantity, edit.unit), aiConfidence: undefined };
    } else if (isQuickAdd(item)) {
      next = item; // a quick add has no portion to scale
    } else {
      next = rescaleItem(item, edit.quantity, edit.unit, item.foodId ? (foodById.get(item.foodId) ?? null) : null);
    }
    return { ...withNameAndNumbers(next, edit.name, edit.override), position };
  });
}

/** A new name and/or the person's own numbers for this portion (micronutrients are kept). */
export function withNameAndNumbers<T extends Omit<MealItem, "id" | "position">>(item: T, name?: string, override?: MacroNumbers): T {
  let next = item;
  if (name !== undefined && name.trim()) next = { ...next, name: name.trim().slice(0, 120) };
  if (override) {
    const own: Nutrients = { ...next.nutrients, ...cleanMacros(override) };
    next = { ...next, nutrients: own, source: "user", aiConfidence: undefined };
  }
  return next;
}
