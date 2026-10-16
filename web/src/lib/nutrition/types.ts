/** Nutrient amounts. In a Food they are per 100 g; in a MealItem they are for the eaten portion. */
export type Nutrients = {
  kcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG: number;
  sugarG?: number;
  satFatG?: number;
  sodiumMg?: number;
  calciumMg?: number;
  ironMg?: number;
};

export const NUTRIENT_KEYS = [
  "kcal",
  "proteinG",
  "carbG",
  "fatG",
  "fiberG",
  "sugarG",
  "satFatG",
  "sodiumMg",
  "calciumMg",
  "ironMg",
] as const satisfies ReadonlyArray<keyof Nutrients>;

export const UNITS = ["katori", "piece", "glass", "tbsp", "g"] as const;
export type Unit = (typeof UNITS)[number];

export const MEAL_TYPES = ["breakfast", "lunch", "snack", "dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const DIET_TYPES = ["vegetarian", "eggetarian", "non_vegetarian", "vegan", "jain"] as const;
export type DietType = (typeof DIET_TYPES)[number];

export type Food = {
  id: string;
  ownerId: string | null;
  name: string;
  nameHi?: string;
  aliases: string[];
  dietTags: DietType[];
  /** Grams in one of each household unit this food is usually eaten in. */
  unitGrams: Partial<Record<Unit, number>>;
  defaultUnit: Unit;
  per100g: Nutrients;
  source: "usda" | "off" | "ifct" | "ai" | "user";
  verified: boolean;
  /** A person's recipe: nutrients worked out from its ingredients. */
  isRecipe?: boolean;
};
