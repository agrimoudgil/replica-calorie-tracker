import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { DietType, Food, Nutrients } from "@/lib/nutrition/types";

export type RichNutrient = "proteinG" | "fiberG" | "ironMg" | "calciumMg";

/** A usual serving (one of the food's default unit) and its nutrients. */
export function servingOf(food: Food) {
  const grams = gramsFor(food, food.defaultUnit, 1);
  return { grams, nutrients: nutrientsForGrams(food, grams) };
}

export function fitsDiet(food: Food, diet: DietType | null): boolean {
  return !diet || food.dietTags.includes(diet);
}

/** Sweets and fats are never suggested to fix a gap, however much of a nutrient they have. */
function isTreatOrFat(n: Nutrients): boolean {
  if (n.kcal <= 0) return true;
  const sugarShare = ((n.sugarG ?? 0) * 4) / n.kcal;
  const fatShare = (n.fatG * 9) / n.kcal;
  return sugarShare > 0.3 || fatShare > 0.65;
}

/** Foods that fit the diet with the most of `nutrient` per usual serving, best first. */
export function foodsRichIn(nutrient: RichNutrient, foods: readonly Food[], diet: DietType | null, limit = 3): Food[] {
  return foods
    .filter((f) => fitsDiet(f, diet) && !isTreatOrFat(f.per100g) && f.per100g[nutrient] !== undefined)
    .map((f) => ({ f, amount: servingOf(f).nutrients[nutrient] ?? 0 }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount || a.f.name.localeCompare(b.f.name))
    .slice(0, limit)
    .map((x) => x.f);
}
