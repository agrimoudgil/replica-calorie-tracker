import type { CheckIn, Meal, Rating } from "@/lib/data/types";
import type { Targets } from "@/lib/nutrition/targets";
import { addDays } from "@/lib/dates";

/*
 * Recovery check-ins: last night's sleep, and energy and soreness today, next to what
 * the person ate. Patterns compare their own days only, and only with enough of them;
 * no scores, no AI.
 */

export const RATINGS = [1, 2, 3, 4, 5] as const satisfies readonly Rating[];
export const ENERGY_LABEL: Record<Rating, string> = { 1: "Very low", 2: "Low", 3: "Okay", 4: "Good", 5: "Great" };
export const SORENESS_LABEL: Record<Rating, string> = { 1: "None", 2: "Mild", 3: "Some", 4: "Sore", 5: "Very sore" };

const hours = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
export const sleepText = (h: number) => `${hours.format(h)} h`;

/** Days in a pattern's window, and the fewest days each side of a comparison needs. */
export const PATTERN_DAYS = 28;
export const MIN_GROUP = 3;
/** Long enough sleep for most adults, and "ate enough": 90% of the calorie target. */
export const GOOD_SLEEP_HOURS = 7;
export const ENOUGH_KCAL = 0.9;

/** What someone ate on one local day; `logged` false when they logged nothing. */
export type DayEating = { date: string; logged: boolean; kcal: number; proteinG: number };

/** Calories and protein per day, for the days that have saved meals. */
export function eatingByDay(meals: Meal[]): DayEating[] {
  const byDate = new Map<string, DayEating>();
  for (const m of meals) {
    const day = byDate.get(m.localDate) ?? { date: m.localDate, logged: true, kcal: 0, proteinG: 0 };
    for (const i of m.items) {
      day.kcal += i.nutrients.kcal;
      day.proteinG += i.nutrients.proteinG;
    }
    byDate.set(m.localDate, day);
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export type Pattern = { id: "sleep-energy" | "kcal-energy" | "protein-soreness"; text: string };

const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
const one = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const days = (n: number) => (n === 1 ? "1 day" : `${n} days`);

/** "Energy: 3.8 of 5 after X (4 days), 2.9 after Y (3 days).", or null without enough days. */
function compare(
  what: string,
  a: { label: string; values: number[] },
  b: { label: string; values: number[] },
): string | null {
  if (a.values.length < MIN_GROUP || b.values.length < MIN_GROUP) return null;
  const [x, y] = [avg(a.values), avg(b.values)];
  const close = Math.abs(x - y) < 0.5;
  return (
    `${close ? `${what} was about the same either way` : what}: ` +
    `${one.format(x)} of 5 after ${a.label} (${days(a.values.length)}), ${one.format(y)} after ${b.label} (${days(b.values.length)}).`
  );
}

/**
 * Up to three plain patterns from the person's own check-ins: sleep and energy the same
 * morning, and the day before's calories and protein against energy and soreness.
 */
export function recoveryPatterns(checkIns: CheckIn[], eating: DayEating[], targets: Pick<Targets, "kcal" | "proteinG">): Pattern[] {
  const ate = new Map(eating.filter((e) => e.logged).map((e) => [e.date, e]));
  const dayBefore = (c: CheckIn) => ate.get(addDays(c.date, -1));
  const out: Pattern[] = [];

  const sleep = compare(
    "Energy",
    { label: `nights of ${GOOD_SLEEP_HOURS} hours or more`, values: checkIns.filter((c) => c.sleepHours >= GOOD_SLEEP_HOURS).map((c) => c.energy) },
    { label: "shorter nights", values: checkIns.filter((c) => c.sleepHours < GOOD_SLEEP_HOURS).map((c) => c.energy) },
  );
  if (sleep) out.push({ id: "sleep-energy", text: sleep });

  const fed = checkIns.filter((c) => dayBefore(c));
  const enough = (c: CheckIn) => dayBefore(c)!.kcal >= ENOUGH_KCAL * targets.kcal;
  const kcal = compare(
    "Energy",
    { label: "days you ate at least 90% of your calorie target", values: fed.filter(enough).map((c) => c.energy) },
    { label: "days you ate less", values: fed.filter((c) => !enough(c)).map((c) => c.energy) },
  );
  if (kcal) out.push({ id: "kcal-energy", text: kcal });

  const metProtein = (c: CheckIn) => dayBefore(c)!.proteinG >= targets.proteinG;
  const protein = compare(
    "Soreness",
    { label: "days you met your protein target", values: fed.filter(metProtein).map((c) => c.soreness) },
    { label: "days below it", values: fed.filter((c) => !metProtein(c)).map((c) => c.soreness) },
  );
  if (protein) out.push({ id: "protein-soreness", text: protein });

  return out;
}
