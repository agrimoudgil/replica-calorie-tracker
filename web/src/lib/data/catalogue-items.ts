import type { Food, Unit } from "@/lib/nutrition/types";
import { aiEstimateItem, itemFromFood, quickAddItem, withNameAndNumbers } from "./meal-math";
import { DataError, type AiEstimate, type MacroNumbers, type MealItem, type QuickAdd } from "./types";

export type NewItemInput =
  | { foodId: string; quantity: number; unit: Unit; name?: string; override?: MacroNumbers }
  | { custom: QuickAdd }
  | { estimate: AiEstimate };

/** Meal items for a new meal: catalogue foods (nutrients from the catalogue unless the person typed their own), quick adds or AI estimates. */
export function catalogueItems(inputs: NewItemInput[], foods: readonly Food[]): Omit<MealItem, "id" | "position">[] {
  const byId = new Map(foods.map((f) => [f.id, f]));
  return inputs.map((input) => {
    if ("custom" in input) return quickAddItem(input.custom);
    if ("estimate" in input) return aiEstimateItem(input.estimate);
    const food = byId.get(input.foodId);
    if (!food) throw new DataError("invalid", "One of the foods isn't in the food list any more. Remove it and try again.");
    return withNameAndNumbers(itemFromFood(food, input.quantity, input.unit), input.name, input.override);
  });
}
