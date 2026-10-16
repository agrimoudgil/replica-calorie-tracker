import { describe, expect, it } from "vitest";
import type { Meal, MealItem } from "@/lib/data/types";
import { addDays, localDate, zonedTimeToUtc } from "@/lib/dates";
import { portionText } from "@/lib/format";
import { dailyNutrientRows } from "@/lib/insights/reference";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { recentFoods } from "@/lib/recents";

describe("dates", () => {
  it("adds days across months and years", () => {
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("turns a local wall-clock time into the right UTC instant", () => {
    expect(zonedTimeToUtc("2026-10-15", 13, 0, "Asia/Kolkata")).toBe("2026-10-15T07:30:00.000Z");
    // New York: daylight time in October (UTC-4), standard time in December (UTC-5).
    expect(zonedTimeToUtc("2026-10-15", 13, 0, "America/New_York")).toBe("2026-10-15T17:00:00.000Z");
    expect(zonedTimeToUtc("2026-12-15", 13, 0, "America/New_York")).toBe("2026-12-15T18:00:00.000Z");
    // The instant lands back on the same local day.
    expect(localDate(new Date(zonedTimeToUtc("2026-10-15", 0, 30, "Asia/Kolkata")), "Asia/Kolkata")).toBe("2026-10-15");
  });
});

describe("portionText", () => {
  it("drops the word piece", () => {
    expect(portionText(3, "piece", "Phulka")).toBe("3 phulka");
    expect(portionText(1.5, "katori", "Dal tadka")).toBe("1.5 katori dal tadka");
  });
});

describe("recentFoods", () => {
  const item = (foodId: string, quantity: number, unit: MealItem["unit"]): MealItem => ({
    id: Math.random().toString(), foodId, position: 0, name: foodId, quantity, unit, grams: 1, nutrients: { kcal: 1, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 }, source: "db",
  });
  const meal = (eatenAt: string, items: MealItem[]): Meal => ({
    id: eatenAt, userId: "u", status: "saved", mealType: "lunch", inputMethod: "search", eatenAt, localDate: eatenAt.slice(0, 10),
    photoPath: null, rawText: null, healthScore: null, aiModel: null, items, savedAt: eatenAt, createdAt: "", updatedAt: "",
  });

  it("ranks by how often, then how recently, with the usual portion", () => {
    const meals = [
      meal("2026-10-10T07:00:00Z", [item("seed-phulka", 3, "piece"), item("seed-dal-tadka", 1, "katori")]),
      meal("2026-10-11T07:00:00Z", [item("seed-phulka", 3, "piece"), item("seed-curd", 1, "katori")]),
      meal("2026-10-12T07:00:00Z", [item("seed-phulka", 2, "piece"), item("seed-dal-tadka", 1, "katori")]),
      meal("2026-10-13T07:00:00Z", [item("seed-chai", 1, "glass"), item("not-in-catalogue", 1, "g")]),
    ];
    const r = recentFoods(meals, SEED_FOODS);
    expect(r.map((x) => [x.food.id, x.quantity, x.unit, x.count])).toEqual([
      ["seed-phulka", 3, "piece", 3],
      ["seed-dal-tadka", 1, "katori", 2],
      ["seed-chai", 1, "glass", 1],
      ["seed-curd", 1, "katori", 1],
    ]);
    expect(recentFoods(meals, SEED_FOODS, 2)).toHaveLength(2);
    expect(recentFoods([], SEED_FOODS)).toEqual([]);
  });
});

describe("dailyNutrientRows", () => {
  it("uses Indian and WHO references, scaled to the person", () => {
    const rows = dailyNutrientRows({ ironMg: 12, sodiumMg: 2400 }, { ironMg: 1, calciumMg: 1, sodiumMg: 1, satFatG: 0.5, sugarG: 1 }, "female", 1800);
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
    expect(byKey.ironMg).toMatchObject({ kind: "goal", target: 29, value: 12 });
    expect(byKey.calciumMg).toMatchObject({ kind: "goal", target: 1000, value: null });
    expect(byKey.sodiumMg).toMatchObject({ kind: "limit", target: 2000, value: 2400 });
    expect(byKey.satFatG).toMatchObject({ kind: "limit", target: 20, coverage: 0.5 });
    expect(byKey.sugarG).toMatchObject({ kind: "info", target: null });
    expect(dailyNutrientRows({}, { ironMg: 1, calciumMg: 1, sodiumMg: 1, satFatG: 1, sugarG: 1 }, "male", 2400)[0].target).toBe(19);
  });
});
