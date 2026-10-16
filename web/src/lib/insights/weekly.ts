import type { Meal } from "@/lib/data/types";
import { sumNutrients, zeroNutrients } from "@/lib/nutrition/portions";
import { healthScore } from "@/lib/nutrition/score";
import type { Goal, Sex, Targets } from "@/lib/nutrition/targets";
import type { DietType, Food, Nutrients } from "@/lib/nutrition/types";
import { dailyReference } from "./reference";
import { foodsRichIn } from "./rich-foods";

/*
 * Weekly insights from rules, not AI. Averages use only days with at least one
 * saved meal, so a day you didn't log doesn't look like a day you didn't eat.
 * Every rule needs MIN_DAYS logged days before it speaks.
 */

export const MIN_DAYS = 3;

export type DayStat = { date: string; logged: boolean; kcal: number; score: number | null; hadBreakfast: boolean };

export type Gap = {
  id: "protein" | "fiber" | "iron" | "calcium" | "sodium" | "fat" | "calories_high" | "calories_low" | "breakfast";
  severity: "high" | "medium";
  title: string;
  detail: string;
  tip?: string;
  foods: Food[];
};

export type WeeklyInsights = {
  days: DayStat[];
  loggedDays: number;
  enoughData: boolean;
  average: Nutrients | null;
  averageScore: number | null;
  daysOnTarget: number;
  gaps: Gap[];
  highlights: string[];
};

const fmt = new Intl.NumberFormat("en-IN");
const round = (n: number) => Math.round(n);

/** Share of items that report a nutrient; below 70% we don't judge it. */
function coverage(meals: Meal[], key: keyof Nutrients): number {
  const items = meals.flatMap((m) => m.items);
  return items.length ? items.filter((i) => i.nutrients[key] !== undefined).length / items.length : 0;
}

export function weeklyInsights(input: {
  dates: string[];
  meals: Meal[];
  targets: Targets;
  sex: Sex;
  goal: Goal;
  diet: DietType | null;
  foods: readonly Food[];
}): WeeklyInsights {
  const { dates, meals, targets: t, diet, foods } = input;
  const ref = dailyReference(input.sex);

  const days: DayStat[] = dates.map((date) => {
    const dayMeals = meals.filter((m) => m.localDate === date);
    const totals = sumNutrients(dayMeals.flatMap((m) => m.items.map((i) => i.nutrients)));
    return {
      date,
      logged: dayMeals.length > 0,
      kcal: round(totals.kcal),
      score: dayMeals.length ? healthScore(totals) : null,
      hadBreakfast: dayMeals.some((m) => m.mealType === "breakfast"),
    };
  });

  const loggedDates = new Set(days.filter((d) => d.logged).map((d) => d.date));
  const loggedMeals = meals.filter((m) => loggedDates.has(m.localDate));
  const loggedDays = loggedDates.size;
  const enoughData = loggedDays >= MIN_DAYS;

  const sum = sumNutrients(loggedMeals.flatMap((m) => m.items.map((i) => i.nutrients)));
  const average: Nutrients | null = loggedDays ? zeroNutrients() : null;
  if (average) {
    for (const key of Object.keys(sum) as Array<keyof Nutrients>) {
      const v = sum[key];
      if (v !== undefined) average[key] = Math.round((v / loggedDays) * 10) / 10;
    }
  }
  const scores = days.map((d) => d.score).filter((s): s is number => s !== null);
  const averageScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;
  const daysOnTarget = days.filter((d) => d.logged && Math.abs(d.kcal - t.kcal) <= t.kcal * 0.1).length;

  const gaps: Gap[] = [];
  const highlights: string[] = [];
  if (!enoughData || !average) return { days, loggedDays, enoughData, average, averageScore, daysOnTarget, gaps, highlights };

  // ---- gaps ---------------------------------------------------------------
  if (average.kcal > t.kcal * 1.1 && input.goal !== "gain") {
    gaps.push({
      id: "calories_high", severity: "high", title: "Above your calorie target",
      detail: `You averaged ${fmt.format(round(average.kcal))} kcal a day; your target is ${fmt.format(t.kcal)}.`,
      tip: "Smaller portions of rice and roti, and fewer fried snacks, close most of this gap.", foods: [],
    });
  } else if (average.kcal < t.kcal * 0.7) {
    gaps.push({
      id: "calories_low", severity: "medium", title: "Far below your calorie target",
      detail: `Logged meals average ${fmt.format(round(average.kcal))} kcal against ${fmt.format(t.kcal)}. If some meals or snacks aren't logged, these numbers will look low.`,
      foods: [],
    });
  }
  if (average.proteinG < t.proteinG * 0.8) {
    gaps.push({
      id: "protein", severity: average.proteinG < t.proteinG * 0.6 ? "high" : "medium", title: "Protein is low",
      detail: `About ${round(average.proteinG)} g a day; your target is ${t.proteinG} g.`,
      foods: foodsRichIn("proteinG", foods, diet),
    });
  }
  if (average.fiberG < t.fiberG * 0.8) {
    gaps.push({
      id: "fiber", severity: "medium", title: "Fibre is low",
      detail: `About ${round(average.fiberG)} g a day; aim for ${t.fiberG} g.`,
      foods: foodsRichIn("fiberG", foods, diet),
    });
  }
  if (average.ironMg !== undefined && coverage(loggedMeals, "ironMg") >= 0.7 && average.ironMg < ref.ironMg * 0.7) {
    gaps.push({
      id: "iron", severity: "medium", title: "Iron looks low",
      detail: `About ${average.ironMg.toFixed(1)} mg a day; the Indian guideline is ${ref.ironMg} mg. These are estimates; needs differ from person to person.`,
      tip: "A squeeze of lemon (vitamin C) helps your body absorb iron from dal and greens.",
      foods: foodsRichIn("ironMg", foods, diet),
    });
  }
  if (average.calciumMg !== undefined && coverage(loggedMeals, "calciumMg") >= 0.7 && average.calciumMg < ref.calciumMg * 0.7) {
    gaps.push({
      id: "calcium", severity: "medium", title: "Calcium looks low",
      detail: `About ${fmt.format(round(average.calciumMg))} mg a day; the Indian guideline is ${fmt.format(ref.calciumMg)} mg.`,
      foods: foodsRichIn("calciumMg", foods, diet),
    });
  }
  if (average.sodiumMg !== undefined && coverage(loggedMeals, "sodiumMg") >= 0.7 && average.sodiumMg > ref.sodiumMaxMg) {
    gaps.push({
      id: "sodium", severity: average.sodiumMg > ref.sodiumMaxMg * 1.5 ? "high" : "medium", title: "Salt is on the high side",
      detail: `About ${fmt.format(round(average.sodiumMg))} mg of sodium a day; WHO advises under ${fmt.format(ref.sodiumMaxMg)} mg.`,
      tip: "Pickles, papad, namkeen and packaged snacks add the most. Try less salt in the tadka.", foods: [],
    });
  }
  if (average.fatG > t.fatG * 1.2) {
    gaps.push({
      id: "fat", severity: "medium", title: "Fat is above target",
      detail: `About ${round(average.fatG)} g a day; your target is ${t.fatG} g.`,
      tip: "Fried snacks, extra ghee and creamy gravies are the usual sources.", foods: [],
    });
  }
  const loggedWithoutBreakfast = days.filter((d) => d.logged && !d.hadBreakfast).length;
  if (loggedWithoutBreakfast >= 3) {
    gaps.push({
      id: "breakfast", severity: "medium", title: "Breakfast is often missing",
      detail: `No breakfast logged on ${loggedWithoutBreakfast} of ${loggedDays} days.`,
      tip: "Even a small breakfast like poha, idli or a moong chilla makes the rest of the day easier.", foods: [],
    });
  }
  gaps.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1));

  // ---- highlights ------------------------------------------------------------
  if (loggedDays === dates.length) highlights.push(`You logged every day this week.`);
  if (daysOnTarget >= 2) highlights.push(`Within 10% of your calorie target on ${daysOnTarget} of ${loggedDays} days.`);
  if (average.proteinG >= t.proteinG) highlights.push(`Protein target met: about ${round(average.proteinG)} g a day.`);
  if (average.fiberG >= t.fiberG) highlights.push(`Fibre target met: about ${round(average.fiberG)} g a day.`);
  if (averageScore !== null && averageScore >= 7) highlights.push(`Your days scored ${averageScore}/10 on average.`);

  return { days, loggedDays, enoughData, average, averageScore, daysOnTarget, gaps, highlights };
}
