import { describe, expect, it } from "vitest";
import { recipeSchema } from "@/lib/api/schemas";
import { foodsRichIn } from "@/lib/insights/rich-foods";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import type { Food } from "@/lib/nutrition/types";
import { buildCustomFood } from "./custom-food";
import { itemFromFood } from "./meal-math";
import { assembleRecipe, bestPortion, buildRecipe, recipeMeta } from "./recipe";
import type { RecipeInput } from "./types";

const food = (id: string) => SEED_FOODS.find((f) => f.id === `seed-${id}`)!;

// 1 katori raw toor dal (130 g), 1 onion (110 g), 1 tomato (100 g), 1 tbsp oil (14 g) = 354 g raw.
const dal: RecipeInput = {
  name: "  My dal  ",
  servings: 4,
  servingUnit: "katori",
  ingredients: [
    { foodId: "seed-raw-toor-dal", quantity: 1, unit: "katori" },
    { foodId: "seed-onion", quantity: 1, unit: "piece" },
    { foodId: "seed-tomato", quantity: 1, unit: "piece" },
    { foodId: "seed-oil", quantity: 1, unit: "tbsp" },
  ],
};
const kcal100 = (id: string) => food(id).per100g.kcal;
const wholeKcal = kcal100("raw-toor-dal") * 1.3 + kcal100("onion") * 1.1 + kcal100("tomato") + kcal100("oil") * 0.14;

describe("recipes", () => {
  it("turns ingredients into a food whose serving is a quarter of the pot", () => {
    const { food: r, ingredients } = buildRecipe("u1", "r1", dal, SEED_FOODS);
    expect(r).toMatchObject({ id: "r1", ownerId: "u1", name: "My dal", isRecipe: true, source: "user", defaultUnit: "katori" });
    expect(r.unitGrams.katori).toBe(88.5); // 354 g / 4
    expect(ingredients).toHaveLength(4);
    const serving = itemFromFood(r, 1, "katori");
    expect(serving.nutrients.kcal).toBeCloseTo(wholeKcal / 4, 0);
    // Onion isn't Jain, so the dal isn't either; it's still vegan and vegetarian.
    expect(r.dietTags).toContain("vegan");
    expect(r.dietTags).not.toContain("jain");
  });

  it("uses the cooked weight when given, so logging by grams is right", () => {
    const { food: r } = buildRecipe("u1", "r1", { ...dal, cookedGrams: 900 }, SEED_FOODS);
    expect(r.unitGrams.katori).toBe(225);
    expect(r.per100g.kcal).toBeCloseTo(wholeKcal / 9, 0);
    expect(itemFromFood(r, 1, "katori").nutrients.kcal).toBeCloseTo(wholeKcal / 4, 0);
  });

  it("keeps a mineral only when every ingredient reports it", () => {
    expect(buildRecipe("u1", "r1", dal, SEED_FOODS).food.per100g.ironMg).toBeGreaterThan(0);
    const masala: Food = { ...buildCustomFood("u1", "own-masala", { name: "Home masala", unit: "tbsp", gramsPerUnit: 6, perServing: { kcal: 20, proteinG: 1, carbG: 3, fatG: 0.5, fiberG: 1 } }) };
    const withOwn = buildRecipe("u1", "r1", { ...dal, ingredients: [...dal.ingredients, { foodId: masala.id, quantity: 1, unit: "tbsp" }] }, [...SEED_FOODS, masala]);
    expect(withOwn.food.per100g.ironMg).toBeUndefined();
    expect(withOwn.food.dietTags).toEqual([]); // a custom food fits no diet we can vouch for
  });

  it("adds up the same food listed twice", () => {
    const twice = buildRecipe("u1", "r1", { ...dal, ingredients: [...dal.ingredients, { foodId: "seed-oil", quantity: 1, unit: "tbsp" }] }, SEED_FOODS);
    expect(twice.ingredients.find((i) => i.foodId === "seed-oil")?.grams).toBe(28);
    expect(twice.ingredients).toHaveLength(4);
  });

  it("refuses foods you can't see, recipes inside recipes and impossible sizes", () => {
    const inner = buildRecipe("u1", "inner", dal, SEED_FOODS).food;
    expect(() => buildRecipe("u1", "r1", { ...dal, ingredients: [{ foodId: "someone-elses", quantity: 1, unit: "g" }] }, SEED_FOODS)).toThrow("isn't in your food list");
    expect(() => buildRecipe("u1", "r1", { ...dal, ingredients: [{ foodId: "inner", quantity: 1, unit: "katori" }] }, [...SEED_FOODS, inner])).toThrow("can't be an ingredient");
    expect(() => buildRecipe("u1", "r1", { ...dal, ingredients: [] }, SEED_FOODS)).toThrow("at least one");
    expect(() => buildRecipe("u1", "r1", { ...dal, servings: 0 }, SEED_FOODS)).toThrow("servings");
    expect(() => buildRecipe("u1", "r1", { ...dal, cookedGrams: 50 }, SEED_FOODS)).toThrow("cooked weight looks too low");
    expect(() => buildRecipe("u1", "r1", { ...dal, servings: 1, cookedGrams: 4000 }, SEED_FOODS)).toThrow("over 3 kg");
  });

  it("shows stored grams back in household units when they come out even", () => {
    expect(bestPortion(food("raw-toor-dal"), 130)).toEqual({ quantity: 1, unit: "katori" });
    expect(bestPortion(food("oil"), 28)).toEqual({ quantity: 2, unit: "tbsp" });
    expect(bestPortion(food("onion"), 55)).toEqual({ quantity: 0.5, unit: "piece" });
    expect(bestPortion(food("onion"), 37)).toEqual({ quantity: 37, unit: "g" });
  });

  it("keeps servings, and the cooked weight only when given", () => {
    expect(recipeMeta({ servings: 4, cookedGrams: 900 })).toEqual({ servings: 4, cookedGrams: 900 });
    expect(recipeMeta({ servings: 2.5 })).toEqual({ servings: 2.5 });
    expect(recipeMeta({ servings: 2, cookedGrams: 0 })).toEqual({ servings: 2 });
  });

  it("assembles a stored recipe biggest ingredient first", () => {
    const built = buildRecipe("u1", "r1", dal, SEED_FOODS);
    const r = assembleRecipe(built.food, { servings: 4 }, built.ingredients, SEED_FOODS);
    expect(r.ingredients.map((i) => [i.food.name, i.quantity, i.unit])).toEqual([
      ["Toor dal (raw)", 1, "katori"],
      ["Onion", 1, "piece"],
      ["Tomato", 1, "piece"],
      ["Cooking oil", 1, "tbsp"],
    ]);
    expect(r).toMatchObject({ servings: 4, servingUnit: "katori" });
  });

  it("checks recipe requests and never suggests raw ingredients as a meal", () => {
    expect(recipeSchema.safeParse(dal).success).toBe(true);
    expect(recipeSchema.safeParse({ ...dal, servingUnit: "g" }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...dal, ingredients: Array.from({ length: 31 }, () => dal.ingredients[0]) }).success).toBe(false);
    expect(foodsRichIn("proteinG", SEED_FOODS, "vegetarian", 10).map((f) => f.id)).not.toContain("seed-raw-toor-dal");
  });
});
