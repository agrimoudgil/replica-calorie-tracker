import { GENERIC_UNIT_GRAMS, MAX_ITEM_GRAMS, gramsFor, nutrientsForGrams, round1, scaleNutrients, sumNutrients } from "@/lib/nutrition/portions";
import { DIET_TYPES, type Food, type Nutrients, type Unit } from "@/lib/nutrition/types";
import { DataError, type Recipe, type RecipeInput, type ServingUnit } from "./types";

/*
 * Recipes: several foods saved as one dish. A recipe is stored as the person's own
 * food (nutrients per 100 g, one serving as its unit) plus its ingredients in grams,
 * so it logs, searches and favourites like any other food.
 */

export const SERVING_UNITS = ["katori", "piece", "glass", "tbsp"] as const satisfies readonly ServingUnit[];
export const MAX_INGREDIENTS = 30;
export const MAX_SERVINGS = 50;

/** Optional nutrients are known for a recipe only if every ingredient reports them. */
const OPTIONAL_KEYS = ["sugarG", "satFatG", "sodiumMg", "calciumMg", "ironMg"] as const;

export type IngredientGrams = { foodId: string; grams: number };

export type RecipeNumbers = {
  /** Ingredients found in `foods`, the same food twice added up. */
  ingredients: Array<{ food: Food; grams: number }>;
  total: Nutrients;
  /** Raw weight of the ingredients. */
  rawGrams: number;
  /** The weight nutrients are spread over: the cooked weight if given, else the raw weight. */
  totalGrams: number;
  servingGrams: number;
  perServing: Nutrients;
};

/** A recipe's numbers as typed so far. Unknown foods are skipped; `buildRecipe` refuses them. */
export function recipeNumbers(input: Pick<RecipeInput, "servings" | "cookedGrams" | "ingredients">, foods: readonly Food[]): RecipeNumbers {
  const byId = new Map(foods.map((f) => [f.id, f]));
  const merged = new Map<string, { food: Food; grams: number }>();
  for (const i of input.ingredients) {
    const food = byId.get(i.foodId);
    if (!food) continue;
    const grams = gramsFor(food, i.unit, i.quantity);
    merged.set(food.id, { food, grams: round1((merged.get(food.id)?.grams ?? 0) + grams) });
  }
  const ingredients = [...merged.values()];
  const parts = ingredients.map((x) => nutrientsForGrams(x.food, x.grams));
  const total = sumNutrients(parts);
  for (const key of OPTIONAL_KEYS) if (parts.some((n) => n[key] === undefined)) delete total[key];
  const rawGrams = round1(ingredients.reduce((sum, x) => sum + x.grams, 0));
  const totalGrams = input.cookedGrams && input.cookedGrams > 0 ? input.cookedGrams : rawGrams;
  const servings = input.servings > 0 ? input.servings : 1;
  return { ingredients, total, rawGrams, totalGrams, servingGrams: round1(totalGrams / servings), perServing: scaleNutrients(total, 1 / servings) };
}

/**
 * Checks a recipe and turns it into a food plus ingredient rows. Every ingredient must be
 * in `foods` (the foods the person can see) and must not be a recipe itself.
 */
export function buildRecipe(ownerId: string, id: string, input: RecipeInput, foods: readonly Food[]): { food: Food; ingredients: IngredientGrams[] } {
  const invalid = (message: string) => new DataError("invalid", message);
  const name = input.name.trim().slice(0, 120);
  if (!name) throw invalid("Give the recipe a name.");
  if (!(input.servings > 0 && input.servings <= MAX_SERVINGS)) throw invalid(`A recipe makes up to ${MAX_SERVINGS} servings.`);
  if (!input.ingredients.length) throw invalid("Add at least one ingredient.");
  if (input.ingredients.length > MAX_INGREDIENTS) throw invalid(`Up to ${MAX_INGREDIENTS} ingredients.`);
  const byId = new Map(foods.map((f) => [f.id, f]));
  for (const i of input.ingredients) {
    const food = byId.get(i.foodId);
    if (!food) throw invalid("One of the ingredients isn't in your food list.");
    if (food.isRecipe || food.id === id) throw invalid("A recipe can't be an ingredient of another recipe.");
  }

  const n = recipeNumbers(input, foods);
  const per100g = scaleNutrients(n.total, 100 / n.totalGrams);
  if (per100g.kcal > 900) throw invalid("The cooked weight looks too low for these ingredients.");
  if (n.servingGrams > MAX_ITEM_GRAMS) throw invalid("One serving would weigh over 3 kg. Make it more servings.");
  if (n.servingGrams < 1) throw invalid("One serving would weigh under 1 g. Make it fewer servings.");

  return {
    food: {
      id,
      ownerId,
      name,
      aliases: [],
      // Fits a diet only if every ingredient does (a custom food has no tags, so it fits none).
      dietTags: DIET_TYPES.filter((d) => n.ingredients.every((x) => x.food.dietTags.includes(d))),
      unitGrams: { g: 1, [input.servingUnit]: n.servingGrams },
      defaultUnit: input.servingUnit,
      per100g,
      source: "user",
      verified: false,
      isRecipe: true,
    },
    ingredients: n.ingredients.map((x) => ({ foodId: x.food.id, grams: x.grams })),
  };
}

/** Ingredients are stored in grams; show them in a household unit when it comes out even. */
export function bestPortion(food: Food, grams: number): { quantity: number; unit: Unit } {
  const own = [food.defaultUnit, ...(Object.keys(food.unitGrams) as Unit[])];
  const generic = SERVING_UNITS.filter((u) => food.unitGrams[u] === undefined);
  for (const unit of [...new Set(own), ...generic]) {
    if (unit === "g") continue;
    const q = (grams / (food.unitGrams[unit] ?? GENERIC_UNIT_GRAMS[unit])) * 4;
    if (q >= 1 && Math.abs(q - Math.round(q)) < 0.02) return { quantity: Math.round(q) / 4, unit };
  }
  return { quantity: Math.round(grams), unit: "g" };
}

/** What a recipe keeps besides its food row (`foods.recipe_servings` and `cooked_grams` in the database). */
export type RecipeMeta = { servings: number; cookedGrams?: number };

export function recipeMeta(input: Pick<RecipeInput, "servings" | "cookedGrams">): RecipeMeta {
  return { servings: input.servings, ...(input.cookedGrams ? { cookedGrams: input.cookedGrams } : {}) };
}

/** Deleting a food that a recipe still uses would change the recipe, so it's refused. */
export function usedInRecipe(recipeName?: string): DataError {
  return new DataError("conflict", `It's an ingredient of ${recipeName ? `your recipe “${recipeName}”` : "one of your recipes"}. Take it out of the recipe first.`);
}

/** A stored recipe for the editor: ingredients biggest first, in household units where possible. */
export function assembleRecipe(food: Food, meta: RecipeMeta, rows: readonly IngredientGrams[], foods: readonly Food[]): Recipe {
  const byId = new Map(foods.map((f) => [f.id, f]));
  const ingredients = rows
    .flatMap((r) => {
      const f = byId.get(r.foodId);
      return f ? [{ food: f, grams: r.grams, ...bestPortion(f, r.grams) }] : [];
    })
    .sort((a, b) => b.grams - a.grams || a.food.name.localeCompare(b.food.name));
  return { food, servings: meta.servings, servingUnit: food.defaultUnit as ServingUnit, cookedGrams: meta.cookedGrams, ingredients };
}
