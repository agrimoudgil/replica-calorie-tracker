import type { Meal } from "@/lib/data/types";
import { gramsFor, nutrientsForGrams, sumNutrients } from "@/lib/nutrition/portions";
import type { Targets } from "@/lib/nutrition/targets";
import { MEAL_TYPES, type DietType, type Food, type MealType, type Nutrients, type Unit } from "@/lib/nutrition/types";
import { fitsDiet } from "./rich-foods";

/*
 * Next-meal ideas from rules: everyday Indian plates from the catalogue, filtered by
 * diet, scaled to fit what's left of today's calories, ranked by the nutrient you're
 * shortest on today. No AI.
 */

type Part = [foodId: string, quantity: number, unit: Unit];

const PLATES: Record<MealType, Part[][]> = {
  breakfast: [
    [["seed-poha", 1, "katori"], ["seed-chai", 1, "glass"]],
    [["seed-idli", 3, "piece"], ["seed-sambar", 1, "katori"]],
    [["seed-moong-chilla", 2, "piece"], ["seed-curd", 1, "katori"]],
    [["seed-upma", 1, "katori"], ["seed-chai", 1, "glass"]],
    [["seed-aloo-paratha", 1, "piece"], ["seed-curd", 1, "katori"]],
    [["seed-boiled-egg", 2, "piece"], ["seed-phulka", 1, "piece"], ["seed-chai", 1, "glass"]],
  ],
  lunch: [
    [["seed-phulka", 2, "piece"], ["seed-dal-tadka", 1, "katori"], ["seed-mixed-sabzi", 1, "katori"], ["seed-salad", 1, "katori"]],
    [["seed-rice", 1, "katori"], ["seed-rajma", 1, "katori"], ["seed-salad", 1, "katori"]],
    [["seed-phulka", 2, "piece"], ["seed-paneer-bhurji", 1, "katori"], ["seed-salad", 1, "katori"]],
    [["seed-rice", 1, "katori"], ["seed-sambar", 1, "katori"], ["seed-bhindi", 1, "katori"]],
    [["seed-phulka", 2, "piece"], ["seed-chole", 1, "katori"], ["seed-curd", 1, "katori"]],
    [["seed-rice", 1, "katori"], ["seed-chicken-curry", 1, "katori"], ["seed-salad", 1, "katori"]],
  ],
  snack: [
    [["seed-banana", 1, "piece"]],
    [["seed-curd", 1, "katori"]],
    [["seed-apple", 1, "piece"]],
    [["seed-moong-chilla", 1, "piece"]],
    [["seed-milk", 1, "glass"]],
    [["seed-boiled-egg", 2, "piece"]],
  ],
  dinner: [
    [["seed-phulka", 2, "piece"], ["seed-palak-paneer", 1, "katori"]],
    [["seed-phulka", 2, "piece"], ["seed-dal-tadka", 1, "katori"], ["seed-aloo-gobi", 1, "katori"]],
    [["seed-masala-dosa", 1, "piece"], ["seed-sambar", 1, "katori"]],
    [["seed-rice", 1, "katori"], ["seed-dal-tadka", 1, "katori"], ["seed-salad", 1, "katori"]],
    [["seed-moong-chilla", 2, "piece"], ["seed-salad", 1, "katori"], ["seed-curd", 1, "katori"]],
    [["seed-phulka", 2, "piece"], ["seed-chicken-curry", 1, "katori"], ["seed-salad", 1, "katori"]],
  ],
};

/** Usual share of the day's calories for each meal. */
const SHARE: Record<MealType, number> = { breakfast: 0.25, lunch: 0.35, snack: 0.1, dinner: 0.3 };
const STEP: Record<Unit, number> = { piece: 1, katori: 0.5, glass: 0.5, tbsp: 1, g: 10 };
const LIGHT_KCAL = 150;

export type IdeaItem = { food: Food; quantity: number; unit: Unit; kcal: number };
export type MealIdea = { title: string; items: IdeaItem[]; nutrients: Nutrients; reason: string };
export type NextMeal = {
  mealType: MealType;
  remainingKcal: number;
  state: "ideas" | "light" | "done";
  ideas: MealIdea[];
};

/** The next meal not yet logged today, starting from the one that fits the hour. */
export function nextMealType(hourType: MealType, loggedToday: Set<MealType>): MealType {
  const start = MEAL_TYPES.indexOf(hourType);
  for (let i = start; i < MEAL_TYPES.length; i++) if (!loggedToday.has(MEAL_TYPES[i])) return MEAL_TYPES[i];
  return "snack";
}

function build(parts: Part[], scale: number, foods: Map<string, Food>): MealIdea | null {
  const items: IdeaItem[] = [];
  for (const [id, quantity, unit] of parts) {
    const food = foods.get(id);
    if (!food) return null;
    const q = Math.max(STEP[unit], Math.round((quantity * scale) / STEP[unit]) * STEP[unit]);
    items.push({ food, quantity: q, unit, kcal: nutrientsForGrams(food, gramsFor(food, unit, q)).kcal });
  }
  const nutrients = sumNutrients(items.map((i) => nutrientsForGrams(i.food, gramsFor(i.food, i.unit, i.quantity))));
  return { title: items.map((i) => i.food.name).join(", "), items, nutrients, reason: "" };
}

export function nextMealIdeas(input: {
  hourType: MealType;
  todayMeals: Meal[];
  targets: Targets;
  diet: DietType | null;
  foods: readonly Food[];
  limit?: number;
}): NextMeal {
  const { targets: t, diet } = input;
  const foods = new Map(input.foods.filter((f) => fitsDiet(f, diet)).map((f) => [f.id, f]));
  const eaten = sumNutrients(input.todayMeals.flatMap((m) => m.items.map((i) => i.nutrients)));
  const logged = new Set(input.todayMeals.map((m) => m.mealType));
  const mealType = nextMealType(input.hourType, logged);
  const remainingKcal = Math.round(t.kcal - eaten.kcal);
  const proteinLeft = Math.max(0, t.proteinG - eaten.proteinG);
  const fiberLeft = Math.max(0, t.fiberG - eaten.fiberG);
  const limit = input.limit ?? 3;

  if (remainingKcal <= 0) return { mealType, remainingKcal, state: "done", ideas: [] };

  const light = remainingKcal < LIGHT_KCAL;
  const type: MealType = light ? "snack" : mealType;
  const budget = light ? remainingKcal : Math.min(remainingKcal, t.kcal * SHARE[type] * (type === "dinner" ? 1.5 : 1.2));
  // Rank by whichever is shorter today, relative to its target.
  const focus: "proteinG" | "fiberG" = proteinLeft / t.proteinG >= fiberLeft / t.fiberG ? "proteinG" : "fiberG";
  const eatenToday = new Set(input.todayMeals.flatMap((m) => m.items.map((i) => i.foodId)));

  const ideas: Array<{ idea: MealIdea; rank: number }> = [];
  for (const parts of PLATES[type]) {
    const base = build(parts, 1, foods);
    if (!base) continue; // a food outside the diet, or missing from the catalogue
    const scale = Math.min(1.5, Math.max(0.5, budget / base.nutrients.kcal));
    const idea = build(parts, scale, foods)!;
    if (idea.nutrients.kcal > budget * 1.15 || idea.nutrients.kcal < budget * 0.35) continue;
    const variety = idea.items.filter((i) => !eatenToday.has(i.food.id)).length / idea.items.length;
    const density = (idea.nutrients[focus] / Math.max(idea.nutrients.kcal, 1)) * 100;
    const need = focus === "proteinG" ? proteinLeft : fiberLeft;
    const label = focus === "proteinG" ? "protein" : "fibre";
    idea.reason =
      need > 0
        ? `Adds ${Math.round(idea.nutrients[focus])} g ${label}; you still need about ${Math.round(need)} g today.`
        : `Fits the ${Math.round(remainingKcal)} kcal you have left today.`;
    ideas.push({ idea, rank: density + variety });
  }

  ideas.sort((a, b) => b.rank - a.rank);
  return {
    mealType: type,
    remainingKcal,
    state: light ? "light" : "ideas",
    ideas: ideas.slice(0, limit).map((x) => x.idea),
  };
}

/** Query value for /log/search?items=… so an idea opens pre-filled. */
export function ideaToQuery(idea: MealIdea): string {
  return idea.items.map((i) => `${i.food.id}:${i.quantity}:${i.unit}`).join(",");
}
