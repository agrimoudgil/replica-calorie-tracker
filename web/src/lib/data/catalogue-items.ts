import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { Food, Unit } from "@/lib/nutrition/types";
import { DataError, type MealItem } from "./types";

/** Meal items from catalogue foods. Nutrients always come from the catalogue, never the client. */
export function catalogueItems(
  inputs: Array<{ foodId: string; quantity: number; unit: Unit }>,
  foods: readonly Food[],
): Omit<MealItem, "id" | "position">[] {
  const byId = new Map(foods.map((f) => [f.id, f]));
  return inputs.map((input) => {
    const food = byId.get(input.foodId);
    if (!food) throw new DataError("invalid", "One of the foods isn't in the food list any more. Remove it and try again.");
    const grams = gramsFor(food, input.unit, input.quantity);
    return {
      foodId: food.id,
      name: food.name,
      nameHi: food.nameHi,
      quantity: input.quantity,
      unit: input.unit,
      grams,
      nutrients: nutrientsForGrams(food, grams),
      source: "db",
    };
  });
}
