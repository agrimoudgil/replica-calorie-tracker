import { describe, expect, it } from "vitest";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { customFoodSchema, saveMealSchema } from "@/lib/api/schemas";
import { buildCustomFood } from "./custom-food";
import { applyItemEdits, cleanMacros, isQuickAdd, itemFromFood } from "./meal-math";
import type { Meal } from "./types";

const phulka = SEED_FOODS.find((f) => f.id === "seed-phulka")!;
const meal: Meal = {
  id: "m", userId: "u", status: "draft", mealType: "lunch", inputMethod: "photo", eatenAt: "", localDate: "", photoPath: null, rawText: null,
  healthScore: null, aiModel: "x", savedAt: null, createdAt: "", updatedAt: "",
  items: [
    { ...itemFromFood(phulka, 2, "piece"), id: "a", position: 0, source: "ai", aiConfidence: "low" },
    { id: "b", position: 1, foodId: null, name: "Mystery curry", quantity: 1, unit: "katori", grams: 150, nutrients: { kcal: 200, proteinG: 5, carbG: 10, fatG: 15, fiberG: 2 }, source: "ai" },
  ],
};

describe("applyItemEdits", () => {
  it("renames and swaps an item to a catalogue food, dropping the AI confidence", () => {
    const [b] = applyItemEdits(meal, [{ id: "b", quantity: 1, unit: "katori", foodId: "seed-dal-makhani", name: "Maa ki dal" }], SEED_FOODS);
    expect(b).toMatchObject({ id: "b", foodId: "seed-dal-makhani", name: "Maa ki dal", grams: 150, source: "db" });
    expect(b.nutrients.kcal).toBe(240);
    expect(b.aiConfidence).toBeUndefined();
  });

  it("applies the person's own numbers and keeps the portion", () => {
    const [a] = applyItemEdits(meal, [{ id: "a", quantity: 2, unit: "piece", override: { kcal: 180, proteinG: 6, carbG: 36, fatG: 2, fiberG: 5 } }], SEED_FOODS);
    expect(a).toMatchObject({ quantity: 2, grams: 70, source: "user", nutrients: { kcal: 180, proteinG: 6, carbG: 36, fatG: 2, fiberG: 5 } });
    expect(a.nutrients.ironMg).toBeDefined(); // untouched micronutrients stay
  });

  it("adds catalogue foods and quick adds as new items in order", () => {
    const items = applyItemEdits(meal, [
      { id: "a", quantity: 2, unit: "piece" },
      { foodId: "seed-curd", quantity: 1, unit: "katori" },
      { custom: { name: "Office canteen thali", kcal: 650, proteinG: 18 } },
    ], SEED_FOODS);
    expect(items.map((i) => [i.name, i.position, i.source])).toEqual([["Phulka", 0, "ai"], ["Curd", 1, "db"], ["Office canteen thali", 2, "user"]]);
    expect(items[2]).toMatchObject({ foodId: null, quantity: 1, nutrients: { kcal: 650, proteinG: 18, carbG: 0 } });
    expect(isQuickAdd(items[2])).toBe(true);
    expect(new Set(items.map((i) => i.id)).size).toBe(3);
  });

  it("refuses unknown foods and items", () => {
    expect(() => applyItemEdits(meal, [{ id: "a", quantity: 1, unit: "piece", foodId: "someone-elses-food" }], SEED_FOODS)).toThrow("isn't in your food list");
    expect(() => applyItemEdits(meal, [{ foodId: "nope", quantity: 1, unit: "g" }], SEED_FOODS)).toThrow("isn't in your food list");
    expect(() => applyItemEdits(meal, [{ id: "zzz", quantity: 1, unit: "g" }], SEED_FOODS)).toThrow("Unknown item");
  });

  it("does not rescale a quick add", () => {
    const quick = applyItemEdits(meal, [{ custom: { name: "Snack", kcal: 300 } }], SEED_FOODS)[0];
    const withQuick: Meal = { ...meal, items: [quick] };
    expect(applyItemEdits(withQuick, [{ id: quick.id, quantity: 5, unit: "katori" }], SEED_FOODS)[0].nutrients.kcal).toBe(300);
  });

  it("keeps typed numbers in sane ranges", () => {
    expect(cleanMacros({ kcal: 30000, proteinG: -5, carbG: Number.NaN })).toEqual({ kcal: 5000, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 });
  });
});

describe("custom foods", () => {
  it("stores nutrition per 100 g from one serving", () => {
    const f = buildCustomFood("u", "f1", { name: " Mom's thepla ", unit: "piece", gramsPerUnit: 40, perServing: { kcal: 120, proteinG: 3, carbG: 16, fatG: 5, fiberG: 2 } });
    expect(f).toMatchObject({ name: "Mom's thepla", ownerId: "u", source: "user", defaultUnit: "piece", unitGrams: { g: 1, piece: 40 } });
    expect(f.per100g).toMatchObject({ kcal: 300, proteinG: 7.5, carbG: 40, fatG: 12.5, fiberG: 5 });
  });

  it("refuses impossible servings", () => {
    expect(() => buildCustomFood("u", "f", { name: "x", unit: "piece", gramsPerUnit: 10, perServing: { kcal: 200, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 } })).toThrow("pure fat");
    expect(() => buildCustomFood("u", "f", { name: "x", unit: "piece", gramsPerUnit: 10, perServing: { kcal: 50, proteinG: 5, carbG: 5, fatG: 5, fiberG: 0 } })).toThrow("add up to more");
  });

  it("validates the request shape", () => {
    expect(customFoodSchema.safeParse({ name: "", unit: "piece", gramsPerUnit: 40, perServing: { kcal: 1, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 } }).success).toBe(false);
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [{ custom: { name: "x", kcal: 100 } }] }).success).toBe(true);
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [{ foodId: "seed-curd", quantity: 1, unit: "katori" }] }).success).toBe(true);
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [{ foodId: "seed-curd", quantity: 1, unit: "katori", kcal: 5 }] }).success).toBe(false);
  });
});
