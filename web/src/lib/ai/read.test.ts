import { describe, expect, it } from "vitest";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import type { Food } from "@/lib/nutrition/types";
import { createFakeReader } from "./fake";
import { cleanReadItems, matchReadItems } from "./read";
import type { ReadItem } from "./types";

const item = (over: Partial<ReadItem>): ReadItem => ({
  name: "Palak paneer",
  searchName: "spinach cottage cheese curry",
  quantity: 1,
  unit: "katori",
  grams: 150,
  confidence: "high",
  ...over,
});

const worldLassi: Food = {
  id: "usda-170903",
  ownerId: null,
  name: "Yogurt drink, sweetened",
  aliases: [],
  dietTags: [],
  unitGrams: { g: 1, glass: 245 },
  defaultUnit: "glass",
  per100g: { kcal: 75, proteinG: 3, carbG: 12, fatG: 1.5, fiberG: 0 },
  source: "usda",
  verified: true,
};

describe("cleanReadItems", () => {
  it("trims names, rounds amounts, falls back to grams for odd units and caps the list", () => {
    const raw = { name: " Dal ", search_name: "", quantity: 1.3, unit: "katori", grams: 150, confidence: "high" as const };
    const [dal, plate, blank] = cleanReadItems([raw, { ...raw, unit: "plate", quantity: 2, grams: 260 }, { ...raw, name: "  " }]);
    expect(dal).toMatchObject({ name: "Dal", searchName: "Dal", quantity: 1.25, unit: "katori" });
    expect(plate).toMatchObject({ unit: "g", quantity: 2 }); // grams said as a count of 2 stays 2 g; the weight guess is kept in grams
    expect(plate.grams).toBe(260);
    expect(blank).toBeUndefined();
    expect(cleanReadItems(Array.from({ length: 20 }, () => raw))).toHaveLength(12);
  });

  it("never lets a bad number through", () => {
    const [bad] = cleanReadItems([{ name: "Rice", search_name: "rice", quantity: -4, unit: "katori", grams: Number.NaN, confidence: "low" }]);
    expect(bad.quantity).toBe(1);
    expect(bad.grams).toBe(1);
  });
});

describe("matchReadItems", () => {
  const noSearch = async () => [];

  it("uses the catalogue food, its nutrients and its weight for the unit", async () => {
    const { items, unmatched } = await matchReadItems([item({})], SEED_FOODS, noSearch);
    expect(unmatched).toEqual([]);
    expect(items[0]).toMatchObject({ quantity: 1, unit: "katori", portionEstimated: false, heard: "Palak paneer" });
    expect(items[0].food.id).toBe("seed-palak-paneer");
  });

  it("matches a plural to the catalogue food named in the singular", async () => {
    const { items } = await matchReadItems([item({ name: "Eggs", searchName: "egg whole boiled", quantity: 2, unit: "piece" })], SEED_FOODS, noSearch);
    expect(items[0].food.id).toBe("seed-boiled-egg"); // "egg" is its alias; not Egg bhurji
    expect(items[0]).toMatchObject({ quantity: 2, unit: "piece" });
  });

  it("searches (which adds world foods) when the catalogue has no match", async () => {
    const searched: string[] = [];
    const search = async (q: string) => {
      searched.push(q);
      return q === "yogurt drink" ? [worldLassi] : [];
    };
    const { items } = await matchReadItems([item({ name: "Sweet lassi xyz", searchName: "yogurt drink sweetened", unit: "glass" })], SEED_FOODS, search);
    // Not Curd, although "yogurt" is one of Curd's names: exact names, then search, then loose matching.
    expect(searched).toEqual(["sweet lassi xyz", "yogurt drink sweetened", "yogurt drink"]);
    expect(items[0].food.id).toBe("usda-170903");
    expect(items[0]).toMatchObject({ quantity: 1, unit: "glass", portionEstimated: false });
  });

  it("switches to the AI's grams when the food has no weight for the unit said", async () => {
    const { items } = await matchReadItems([item({ name: "Lassi zz", searchName: "yogurt drink", unit: "katori", grams: 180 })], [], async () => [worldLassi]);
    expect(items[0]).toMatchObject({ quantity: 180, unit: "g", portionEstimated: true });
  });

  it("falls back to a dish name contained in what was read only when search finds nothing", async () => {
    const { items } = await matchReadItems([item({ name: "Homestyle rajma", searchName: "zzz" })], SEED_FOODS, noSearch);
    expect(items[0].food.id).toBe("seed-rajma");
  });

  it("ignores search hits that only share a container or a short word", async () => {
    const chili: Food = { ...worldLassi, id: "usda-172110", name: "Chili with beans, microwavable bowls" };
    const searched: string[] = [];
    const { items, unmatched } = await matchReadItems(
      [item({ name: "a bowl of zorblax stew", searchName: "a bowl of zorblax stew" })],
      SEED_FOODS,
      async (q) => {
        searched.push(q);
        return [chili];
      },
    );
    expect(searched).toEqual(["zorblax stew"]); // "a", "bowl" and "of" never become a search
    expect(items).toEqual([]);
    expect(unmatched).toEqual(["a bowl of zorblax stew"]);
  });

  it("reports foods it can't find instead of inventing numbers", async () => {
    const { items, unmatched } = await matchReadItems([item({ name: "Zorblax stew", searchName: "zorblax" })], SEED_FOODS, noSearch);
    expect(items).toEqual([]);
    expect(unmatched).toEqual(["Zorblax stew"]);
  });
});

describe("fake reader", () => {
  it("splits the text, reads leading numbers and is marked demo", async () => {
    const r = await createFakeReader().fromText("2 thai curry, mango aur chips", { mealType: "lunch", dietType: null });
    expect(r.demo).toBe(true);
    expect(r.usage).toEqual({ inputTokens: 0, outputTokens: 0 });
    expect(r.items.map((i) => [i.name, i.quantity])).toEqual([["thai curry", 2], ["mango", 1], ["chips", 1]]);
  });
});
