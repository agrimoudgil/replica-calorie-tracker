import { describe, expect, it } from "vitest";
import { MEAL_SHARE, mealBudgets, suggestMealType } from "./meal-type";

describe("meal budgets", () => {
  it("split the day's calories across meals, in 10 kcal steps", () => {
    expect(mealBudgets(1600)).toEqual({ breakfast: 400, lunch: 480, snack: 240, dinner: 480 });
    expect(mealBudgets(2105)).toEqual({ breakfast: 530, lunch: 630, snack: 320, dinner: 630 });
    expect(Object.values(MEAL_SHARE).reduce((a, b) => a + b, 0)).toBeCloseTo(1);
  });

  it("suggest a meal from the hour", () => {
    expect(suggestMealType(8)).toBe("breakfast");
    expect(suggestMealType(13)).toBe("lunch");
    expect(suggestMealType(17)).toBe("snack");
    expect(suggestMealType(21)).toBe("dinner");
  });
});
