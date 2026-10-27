import { describe, expect, it } from "vitest";
import type { Meal, MealItem } from "@/lib/data/types";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { Targets } from "@/lib/nutrition/targets";
import type { MealType, Unit } from "@/lib/nutrition/types";
import { nextMealIdeas, nextMealType, ideaToQuery } from "./next-meal";
import { lastNDates } from "./reference";
import { foodsRichIn } from "./rich-foods";
import { weeklyInsights } from "./weekly";

const targets: Targets = { kcal: 1800, proteinG: 72, carbG: 250, fatG: 54, fiberG: 25 };
const food = (id: string) => SEED_FOODS.find((f) => f.id === `seed-${id}`)!;

function meal(date: string, mealType: MealType, parts: Array<[string, number, Unit]>): Meal {
  const items: MealItem[] = parts.map(([id, quantity, unit], position) => {
    const f = food(id);
    const grams = gramsFor(f, unit, quantity);
    return { id: `${date}-${mealType}-${position}`, foodId: f.id, position, name: f.name, quantity, unit, grams, nutrients: nutrientsForGrams(f, grams), source: "db" };
  });
  return {
    id: `${date}-${mealType}`, userId: "u", status: "saved", mealType, inputMethod: "search", eatenAt: `${date}T07:00:00Z`, localDate: date,
    photoPath: null, rawText: null, healthScore: null, aiModel: null, items, savedAt: `${date}T07:00:00Z`, createdAt: "", updatedAt: "",
  };
}

const dates = lastNDates("2026-10-16", 7);

describe("lastNDates", () => {
  it("lists 7 days ending today, across a month boundary", () => {
    expect(lastNDates("2026-11-02", 7)).toEqual(["2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
  });
});

describe("weeklyInsights", () => {
  const base = { dates, targets, sex: "female" as const, goal: "maintain" as const, diet: "vegetarian" as const, foods: SEED_FOODS };

  it("waits for 3 logged days before judging", () => {
    const r = weeklyInsights({ ...base, meals: [meal(dates[6], "lunch", [["rice", 1, "katori"]]), meal(dates[5], "lunch", [["rice", 1, "katori"]])] });
    expect(r.loggedDays).toBe(2);
    expect(r.enoughData).toBe(false);
    expect(r.gaps).toEqual([]);
    expect(r.days.map((d) => d.logged)).toEqual([false, false, false, false, false, true, true]);
  });

  it("averages only logged days and spots low protein, fibre and missed breakfasts", () => {
    // Carb-heavy days: rice + aloo paratha, no breakfast.
    const meals = dates.slice(2).flatMap((d) => [meal(d, "lunch", [["rice", 2, "katori"], ["aloo-gobi", 1, "katori"]]), meal(d, "dinner", [["aloo-paratha", 2, "piece"]])]);
    const r = weeklyInsights({ ...base, meals });
    expect(r.loggedDays).toBe(5);
    expect(r.average!.kcal).toBeCloseTo(meals.slice(0, 2).flatMap((m) => m.items).reduce((s, i) => s + i.nutrients.kcal, 0), 0);
    const ids = r.gaps.map((g) => g.id);
    expect(ids).toEqual(expect.arrayContaining(["protein", "fiber", "breakfast"]));
    const protein = r.gaps.find((g) => g.id === "protein")!;
    expect(protein.foods.length).toBeGreaterThan(0);
    expect(protein.foods.every((f) => f.dietTags.includes("vegetarian"))).toBe(true);
  });

  it("flags high calories and salt, and praises a balanced, complete week", () => {
    const heavy = dates.map((d) => meal(d, "dinner", [["samosa", 4, "piece"], ["paneer-butter-masala", 2, "katori"], ["phulka", 4, "piece"]]));
    const r = weeklyInsights({ ...base, meals: heavy });
    expect(r.gaps[0].severity).toBe("high");
    expect(r.gaps.map((g) => g.id)).toEqual(expect.arrayContaining(["calories_high", "fat"]));
    expect(r.highlights).toContain("You logged every day this week.");
  });

  it("never suggests foods outside the diet", () => {
    for (const diet of ["vegetarian", "vegan", "jain"] as const) {
      for (const n of ["proteinG", "fiberG", "ironMg", "calciumMg"] as const) {
        expect(foodsRichIn(n, SEED_FOODS, diet).every((f) => f.dietTags.includes(diet))).toBe(true);
      }
    }
    // Most protein per usual serving: a chicken portion (roast chicken about 37 g, a grilled breast about 34 g).
    expect(["seed-roast-chicken", "seed-grilled-chicken"]).toContain(foodsRichIn("proteinG", SEED_FOODS, "non_vegetarian")[0].id);
    expect(foodsRichIn("proteinG", SEED_FOODS, "vegetarian").map((f) => f.id)).not.toContain("seed-gulab-jamun");
  });
});

describe("nextMealIdeas", () => {
  it("picks the next meal not yet logged", () => {
    expect(nextMealType("breakfast", new Set(["breakfast"]))).toBe("lunch");
    expect(nextMealType("dinner", new Set(["dinner"]))).toBe("snack");
  });

  it("gives diet-safe plates that fit the remaining calories", () => {
    const today = [meal(dates[6], "breakfast", [["poha", 1, "katori"], ["chai", 1, "glass"]])];
    const r = nextMealIdeas({ hourType: "lunch", todayMeals: today, targets, diet: "vegetarian", foods: SEED_FOODS });
    expect(r.mealType).toBe("lunch");
    expect(r.state).toBe("ideas");
    expect(r.ideas.length).toBeGreaterThanOrEqual(2);
    for (const idea of r.ideas) {
      expect(idea.items.every((i) => i.food.dietTags.includes("vegetarian"))).toBe(true);
      expect(idea.nutrients.kcal).toBeLessThanOrEqual(targets.kcal * 0.35 * 1.2 * 1.15);
      expect(idea.reason).toMatch(/protein|fibre|kcal/);
    }
    expect(r.ideas.flatMap((i) => i.items.map((x) => x.food.id))).not.toContain("seed-chicken-curry");
    expect(ideaToQuery(r.ideas[0])).toMatch(/^seed-[a-z-]+:\d+(\.\d+)?:[a-z]+(,seed-[a-z-]+:\d+(\.\d+)?:[a-z]+)*$/);
  });

  it("switches to light snacks when little is left, and stops when the target is met", () => {
    const big = [meal(dates[6], "lunch", [["paneer-butter-masala", 4, "katori"], ["jeera-rice", 4, "katori"]])];
    const eaten = big[0].items.reduce((s, i) => s + i.nutrients.kcal, 0);
    const near = nextMealIdeas({ hourType: "dinner", todayMeals: big, targets: { ...targets, kcal: Math.round(eaten + 120) }, diet: "vegetarian", foods: SEED_FOODS });
    expect(near.state).toBe("light");
    expect(near.ideas.every((i) => i.nutrients.kcal <= 120 * 1.15)).toBe(true);
    const over = nextMealIdeas({ hourType: "dinner", todayMeals: big, targets, diet: "vegetarian", foods: SEED_FOODS });
    expect(over.state).toBe("done");
    expect(over.ideas).toEqual([]);
  });
});
