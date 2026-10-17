import { describe, expect, it } from "vitest";
import { rankFoods } from "@/lib/data/food-rank";
import { SEED_FOODS, matchFood, normalizeFoodName } from "./foods";
import { changeUnit, gramsFor, rescaleItem, sanitizeNutrients, sumNutrients } from "./portions";
import { healthScore } from "./score";
import { computeTargets } from "./targets";

describe("computeTargets", () => {
  it("uses Mifflin-St Jeor with activity and goal", () => {
    // 30-year-old woman, 160 cm, 60 kg: BMR 1289, × 1.375 = 1772, maintain → 1770
    const t = computeTargets({ sex: "female", age: 30, heightCm: 160, weightKg: 60, activity: "light", goal: "maintain" });
    expect(t.kcal).toBe(1770);
    expect(t.proteinG).toBe(72);
    expect(t.fiberG).toBe(25);
    expect(t.proteinG * 4 + t.carbG * 4 + t.fatG * 9).toBeGreaterThan(t.kcal - 20);
    expect(t.proteinG * 4 + t.carbG * 4 + t.fatG * 9).toBeLessThan(t.kcal + 20);
  });

  it("never goes below 1,200 kcal when losing weight", () => {
    const t = computeTargets({ sex: "female", age: 60, heightCm: 145, weightKg: 40, activity: "sedentary", goal: "lose" });
    expect(t.kcal).toBe(1200);
  });
});

describe("healthScore", () => {
  it("rates a fibre- and protein-rich dish above a sugary sweet", () => {
    const rajma = SEED_FOODS.find((f) => f.id === "seed-rajma")!.per100g;
    const jamun = SEED_FOODS.find((f) => f.id === "seed-gulab-jamun")!.per100g;
    expect(healthScore(rajma)!).toBeGreaterThanOrEqual(8);
    expect(healthScore(jamun)!).toBeLessThanOrEqual(3);
  });

  it("is the same for any portion size and null for near-zero energy", () => {
    const dal = SEED_FOODS.find((f) => f.id === "seed-dal-tadka")!.per100g;
    const double = sumNutrients([dal, dal]);
    expect(healthScore(double)).toBe(healthScore(dal));
    expect(healthScore({ kcal: 2, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 })).toBeNull();
  });

  it("stays within 0–10", () => {
    expect(healthScore({ kcal: 100, proteinG: 50, carbG: 0, fatG: 0, fiberG: 50 })).toBe(10);
    expect(healthScore({ kcal: 100, proteinG: 0, carbG: 25, fatG: 0, fiberG: 0, sugarG: 25, satFatG: 10, sodiumMg: 2000 })).toBe(0);
  });
});

describe("portions", () => {
  const phulka = SEED_FOODS.find((f) => f.id === "seed-phulka")!;

  it("uses the food's own unit weight, then the generic one", () => {
    expect(gramsFor(phulka, "piece", 2)).toBe(70);
    expect(gramsFor(phulka, "katori", 1)).toBe(150);
    expect(gramsFor(null, "glass", 1)).toBe(250);
  });

  it("rescales grams and nutrients together when the quantity changes", () => {
    const item = { quantity: 2, unit: "piece" as const, grams: 70, nutrients: { kcal: 208, proteinG: 6.9, carbG: 38.5, fatG: 2.6, fiberG: 6.3 } };
    const three = rescaleItem(item, 3, "piece");
    expect(three.grams).toBe(105);
    expect(three.nutrients.kcal).toBe(312);
    const inGrams = rescaleItem(item, 35, "g", phulka);
    expect(inGrams.grams).toBe(35);
    expect(inGrams.nutrients.kcal).toBe(104);
  });

  it("keeps the amount of food when the unit changes", () => {
    const item = { quantity: 2, unit: "piece" as const, grams: 70, nutrients: { kcal: 208, proteinG: 6.9, carbG: 38.5, fatG: 2.6, fiberG: 6.3 } };
    const g = changeUnit(item, "g", phulka);
    expect(g.quantity).toBe(70);
    expect(g.grams).toBe(70);
    expect(g.nutrients.kcal).toBe(208);
    const back = changeUnit(g, "piece", phulka);
    expect(back.quantity).toBe(2);
    expect(back.grams).toBe(70);
    const dal = { quantity: 300, unit: "g" as const, grams: 300, nutrients: { kcal: 360, proteinG: 18, carbG: 45, fatG: 12, fiberG: 9 } };
    expect(changeUnit(dal, "katori").quantity).toBe(2);
  });

  it("ignores invalid quantities", () => {
    const item = { quantity: 1, unit: "katori" as const, grams: 150, nutrients: { kcal: 180, proteinG: 9, carbG: 22, fatG: 6, fiberG: 4 } };
    expect(rescaleItem(item, 0, "katori")).toBe(item);
    expect(rescaleItem(item, Number.NaN, "katori")).toBe(item);
  });

  it("clamps impossible estimates", () => {
    const n = sanitizeNutrients({ kcal: 5000, proteinG: -3, carbG: 400, fatG: 10, fiberG: 2 }, 100);
    expect(n.kcal).toBe(900);
    expect(n.proteinG).toBe(0);
    expect(n.carbG).toBe(100);
  });
});

describe("matchFood", () => {
  it("matches names, aliases and Hinglish spellings", () => {
    expect(matchFood("Roti", SEED_FOODS)?.id).toBe("seed-phulka");
    expect(matchFood("chaval", SEED_FOODS)?.id).toBe("seed-rice");
    expect(matchFood("Dal Makhani", SEED_FOODS)?.id).toBe("seed-dal-makhani");
    expect(matchFood("homemade dal tadka", SEED_FOODS)?.id).toBe("seed-dal-tadka");
    expect(matchFood("thai green curry", SEED_FOODS)).toBeNull();
  });

  // BUG-004: an accent split the word ("dāl" became "da l") and nothing matched.
  it("ignores accents on Latin letters but keeps Hindi words whole", () => {
    expect(normalizeFoodName("dāl")).toBe("dal");
    expect(normalizeFoodName("Crème brûlée")).toBe("creme brulee");
    expect(matchFood("dāl", SEED_FOODS)?.id).toBe("seed-dal-tadka");
    expect(normalizeFoodName("दाल मखनी").split(" ")).toHaveLength(2);
    expect(rankFoods(SEED_FOODS, "दाल मखनी", 1)[0]?.id).toBe("seed-dal-makhani");
  });
});
