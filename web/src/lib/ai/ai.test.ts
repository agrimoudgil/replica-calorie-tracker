import { describe, expect, it } from "vitest";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { createFakeEstimator } from "./fake";
import { normalizeItems, type RawItem } from "./normalize";

const raw = (over: Partial<RawItem>): RawItem => ({
  name: "Dal tadka",
  name_hi: null,
  quantity: 1,
  unit: "katori",
  grams: 150,
  kcal: 999,
  protein_g: 1,
  carb_g: 1,
  fat_g: 1,
  fiber_g: 1,
  sugar_g: null,
  sat_fat_g: null,
  sodium_mg: null,
  calcium_mg: null,
  iron_mg: null,
  confidence: "high",
  ...over,
});

describe("normalizeItems", () => {
  it("uses catalogue nutrients for known dishes, scaled to the estimated grams", () => {
    const [item] = normalizeItems([raw({})], SEED_FOODS);
    expect(item.foodId).toBe("seed-dal-tadka");
    expect(item.nutrients.kcal).toBe(180); // 120 kcal/100 g × 150 g, not the model's 999
    expect(item.nameHi).toBe("दाल तड़का");
  });

  it("keeps model numbers for unknown dishes but clamps them", () => {
    const [item] = normalizeItems([raw({ name: "Quinoa khichdi", grams: 100, kcal: 5000, protein_g: -2 })], SEED_FOODS);
    expect(item.foodId).toBeNull();
    expect(item.nutrients.kcal).toBe(900);
    expect(item.nutrients.proteinG).toBe(0);
  });

  it("falls back to grams for unknown units, drops blank names and caps the list", () => {
    const items = normalizeItems(
      [raw({ unit: "plate", grams: 220 }), raw({ name: "  " }), ...Array.from({ length: 20 }, () => raw({}))],
      SEED_FOODS,
    );
    expect(items[0].unit).toBe("g");
    expect(items[0].quantity).toBe(220);
    expect(items).toHaveLength(12);
  });
});

describe("fake estimator", () => {
  it("is deterministic per photo and marked as demo", async () => {
    const est = createFakeEstimator();
    const photo = { bytes: new Uint8Array([1, 2, 3]), mediaType: "image/jpeg" as const };
    const a = await est.fromPhoto(photo, { mealType: "lunch", dietType: "vegetarian" });
    const b = await est.fromPhoto(photo, { mealType: "lunch", dietType: "vegetarian" });
    expect(a).toEqual(b);
    expect(a.demo).toBe(true);
    expect(a.items.length).toBeGreaterThan(0);
  });
});
