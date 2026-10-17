import type { DietType, Unit } from "../types";

/* Shared shapes for the seed catalogue (see foods.ts). */

export const VEG: DietType[] = ["vegetarian", "eggetarian", "non_vegetarian"];
export const VEGAN: DietType[] = ["vegan", ...VEG];
export const JAIN_VEGAN: DietType[] = ["jain", ...VEGAN];
export const JAIN_VEG: DietType[] = ["jain", ...VEG];
export const EGG: DietType[] = ["eggetarian", "non_vegetarian"];
export const MEAT: DietType[] = ["non_vegetarian"];

/** A food with its own per-100 g values. */
export type Row = [
  id: string,
  name: string,
  nameHi: string | undefined,
  aliases: string[],
  diet: DietType[],
  units: Partial<Record<Unit, number>>,
  defaultUnit: Unit,
  // kcal, protein, carbs, fat, fibre, sugar, sat fat, sodium mg, calcium mg, iron mg
  n: [number, number, number, number, number, number, number, number, number, number],
];

/**
 * A cooked dish as a typical home recipe: raw ingredients in grams (ids from the
 * catalogue, without "seed-") and the weight of what the pot yields. Its per-100 g
 * values and diet tags are worked out from the ingredients (architecture.md).
 */
export type DishRow = [
  id: string,
  name: string,
  nameHi: string | undefined,
  aliases: string[],
  units: Partial<Record<Unit, number>>,
  defaultUnit: Unit,
  recipe: Array<[ingredient: string, grams: number]>,
  cookedGrams: number,
];
