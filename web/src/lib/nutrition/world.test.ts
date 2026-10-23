import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createFileStore } from "@/lib/data/file-store";
import { mergeSearch, rankWorldFoods } from "@/lib/data/food-rank";
import { SEED_FOODS } from "./foods";
import { gramsFor, nutrientsForGrams } from "./portions";
import { WORLD_ID_PREFIX, worldFoods } from "./world";

const all = worldFoods();
const byName = (start: string) => all.find((f) => f.name.startsWith(start))!;

describe("world foods (USDA FoodData Central)", () => {
  it("has thousands of foods with unique ids, sane names and units", () => {
    expect(all.length).toBeGreaterThan(7000);
    expect(new Set(all.map((f) => f.id)).size).toBe(all.length);
    // Shared names are unique in the database (ignoring case), including against Oswald's own foods.
    const names = [...all, ...SEED_FOODS].map((f) => f.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    for (const f of all) {
      expect(f.id.startsWith(WORLD_ID_PREFIX)).toBe(true);
      expect(f.name.length).toBeGreaterThan(0);
      expect(f.name.length).toBeLessThanOrEqual(120);
      expect(f.source).toBe("usda");
      expect(f.dietTags).toEqual([]); // diet fit unknown: never in meal ideas
      expect(f.unitGrams[f.defaultUnit]).toBeGreaterThan(0);
      for (const g of Object.values(f.unitGrams)) {
        expect(g!).toBeGreaterThanOrEqual(1);
        expect(g!).toBeLessThanOrEqual(2000);
      }
    }
  });

  it("has believable numbers per 100 g", () => {
    let consistent = 0;
    let counted = 0;
    for (const { per100g: n } of all) {
      expect(n.kcal).toBeGreaterThanOrEqual(0);
      expect(n.kcal).toBeLessThanOrEqual(950);
      expect(n.proteinG + n.carbG + n.fatG).toBeLessThanOrEqual(101);
      if (n.kcal < 40) continue;
      counted++;
      const fromMacros = n.proteinG * 4 + Math.max(0, n.carbG - n.fiberG) * 4 + n.fiberG * 2 + n.fatG * 9;
      if (Math.abs(fromMacros - n.kcal) <= Math.max(25, n.kcal * 0.25)) consistent++;
    }
    expect(consistent / counted).toBeGreaterThan(0.95); // the rest: alcohol, sugar alcohols, rounding
  });

  it("knows everyday foods from around the world, in sensible portions", () => {
    expect(byName("McDONALD'S, BIG MAC").unitGrams.piece).toBe(219);
    expect(byName("Croissants, butter").unitGrams.piece).toBe(57); // a medium one, not the miniature
    expect(byName("Bananas, raw").unitGrams.piece).toBe(118);
    expect(byName("Rice, white, long-grain, regular, enriched, cooked").per100g.kcal).toBe(130);
    const milk = byName("Milk, whole, 3.25% milkfat, with added vitamin D");
    expect(milk.defaultUnit).toBe("glass");
    expect(Math.round(nutrientsForGrams(milk, gramsFor(milk, "glass", 1)).kcal)).toBeGreaterThan(140);
  });
});

describe("searching world foods", () => {
  it("finds every word in any order, plain foods first", () => {
    const found = rankWorldFoods(all, "white rice cooked", 5);
    expect(found[0].name.startsWith("Rice, white")).toBe(true);
    expect(rankWorldFoods(all, "rice white cooked", 5).map((f) => f.id).sort()).toEqual(found.map((f) => f.id).sort());
    expect(rankWorldFoods(all, "big mac", 3)[0].name).toBe("McDONALD'S, BIG MAC");
  });

  it("keeps a few places for world foods even when the catalogue fills the list", () => {
    const cat = Array.from({ length: 12 }, (_, i) => ({ ...all[0], id: `seed-${i}` }));
    const world = all.slice(0, 6);
    const merged = mergeSearch(cat, world, 12);
    expect(merged).toHaveLength(12);
    expect(merged.slice(0, 8).every((f) => f.id.startsWith("seed-"))).toBe(true);
    expect(merged.slice(8).every((f) => f.source === "usda")).toBe(true);
    expect(mergeSearch(cat.slice(0, 3), world, 12)).toHaveLength(9); // 3 of ours, then 6 world
  });

  it("in the store: Oswald's foods first, world foods after; not in the everyday list; usable in meals", async () => {
    const db = createFileStore(fs.mkdtempSync(path.join(os.tmpdir(), "rct-world-")));
    const user = randomUUID();
    await db.upsertProfile(user, { displayName: null, sex: "female", birthYear: 1994, heightCm: 160, weightKg: 60, activityLevel: "light", goal: "maintain", dietType: "vegetarian" });

    expect((await db.listFoods(user)).some((f) => f.source === "usda")).toBe(false);
    const rice = await db.searchFoods(user, "rice", 12);
    expect(rice[0].source).not.toBe("usda");
    expect(rice.some((f) => f.source === "usda")).toBe(true);

    const bigMac = byName("McDONALD'S, BIG MAC");
    expect((await db.getFoods(user, [bigMac.id, "seed-phulka"])).map((f) => f.id).sort()).toEqual([bigMac.id, "seed-phulka"].sort());
    const meal = await db.createDraftMeal(user, { id: randomUUID(), mealType: "lunch", inputMethod: "search", eatenAt: new Date().toISOString(), photoPath: null, rawText: null, aiModel: null, items: [] });
    const saved = await db.saveMeal(user, meal.id, { mealType: "lunch", items: [{ foodId: bigMac.id, quantity: 1, unit: "piece" }] });
    expect(saved.items[0].name).toBe("McDONALD'S, BIG MAC");
    expect(Math.round(saved.items[0].nutrients.kcal)).toBe(Math.round(bigMac.per100g.kcal * 2.19));
  });
});
