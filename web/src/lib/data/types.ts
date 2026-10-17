import type { DietType, Food, MealType, Nutrients, Unit } from "@/lib/nutrition/types";
import type { ActivityLevel, Goal, Sex, Targets } from "@/lib/nutrition/targets";

export type { Targets };

export type Profile = {
  id: string;
  displayName: string | null;
  sex: Sex;
  birthYear: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietType: DietType;
  targets: Targets;
  /** true: the person set the targets themselves (Goals & budgets); body details don't change them. */
  targetsCustom: boolean;
  timezone: string;
  onboardedAt: string;
  updatedAt: string;
};

export type ProfileInput = Omit<Profile, "id" | "targets" | "targetsCustom" | "timezone" | "onboardedAt" | "updatedAt"> & {
  timezone?: string;
};

export type InputMethod = "photo" | "voice" | "text" | "search" | "auto";

export type MealItem = {
  id: string;
  foodId: string | null;
  position: number;
  name: string;
  nameHi?: string;
  quantity: number;
  unit: Unit;
  grams: number;
  nutrients: Nutrients;
  source: "ai" | "db" | "user";
  aiConfidence?: "high" | "medium" | "low";
};

export type Meal = {
  id: string;
  userId: string;
  status: "draft" | "saved";
  mealType: MealType;
  inputMethod: InputMethod;
  eatenAt: string;
  localDate: string;
  photoPath: string | null;
  rawText: string | null;
  healthScore: number | null;
  aiModel: string | null;
  items: MealItem[];
  savedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DraftMealInput = {
  id: string;
  mealType: MealType;
  inputMethod: InputMethod;
  eatenAt: string;
  photoPath: string | null;
  rawText: string | null;
  aiModel: string | null;
  items: Omit<MealItem, "id" | "position">[];
};

/** Calories and macros a person types in for a portion. */
export type MacroNumbers = { kcal: number; proteinG: number; carbG: number; fatG: number; fiberG: number };

/** A food someone adds by hand, without a catalogue entry ("Quick add"). */
export type QuickAdd = { name: string } & Partial<MacroNumbers> & { kcal: number };

/**
 * One item in a save. Existing items (by id) can change portion, be renamed, be swapped
 * for another food, or get the person's own numbers. New items come from the catalogue
 * or are quick-added. Items left out are removed.
 */
export type ItemEdit =
  | { id: string; quantity: number; unit: Unit; name?: string; foodId?: string; override?: MacroNumbers }
  | { foodId: string; quantity: number; unit: Unit; name?: string; override?: MacroNumbers }
  | { custom: QuickAdd };

export type SaveMealInput = {
  mealType: MealType;
  items: ItemEdit[];
  /** Optimistic lock: the meal's updatedAt the client last saw. */
  expectedUpdatedAt?: string;
};

/** A food the person creates, described per serving. */
export type NewFoodInput = {
  name: string;
  nameHi?: string;
  unit: Unit;
  /** Grams in one unit (ignored for "g"). */
  gramsPerUnit: number;
  /** Nutrition for one unit, or for 100 g when the unit is "g". */
  perServing: MacroNumbers;
};

/** A unit a recipe's serving can be counted in (not grams). */
export type ServingUnit = Exclude<Unit, "g">;

/** A dish made from several foods, e.g. "My dal": logged one serving at a time like any food. */
export type RecipeInput = {
  name: string;
  /** How many servings the whole pot makes, and what one serving is. */
  servings: number;
  servingUnit: ServingUnit;
  /** Weight of the cooked dish, if weighed. Without it, the ingredients' raw weight is used. */
  cookedGrams?: number;
  ingredients: Array<{ foodId: string; quantity: number; unit: Unit }>;
};

export type RecipeIngredient = { food: Food; grams: number; quantity: number; unit: Unit };

export type Recipe = {
  /** The recipe as a food: per-100 g nutrients, one serving as its default unit. */
  food: Food;
  servings: number;
  servingUnit: ServingUnit;
  cookedGrams?: number;
  ingredients: RecipeIngredient[];
};

export type DaySummary = {
  date: string;
  totals: Nutrients;
  meals: Meal[];
};

export type AiUsage = {
  userId: string;
  kind: "photo" | "text" | "insight" | "next_meal" | "chat";
  model: string;
  inputTokens: number;
  outputTokens: number;
  createdAt: string;
};

export class DataError extends Error {
  constructor(
    public readonly code: "not_found" | "conflict" | "invalid" | "forbidden",
    message: string,
  ) {
    super(message);
    this.name = "DataError";
  }

  /**
   * Matches by name as well as class: the store is cached across dev hot reloads,
   * so its errors can come from an older copy of this class.
   */
  static is(err: unknown): err is DataError {
    return err instanceof DataError || (err instanceof Error && err.name === "DataError" && "code" in err);
  }
}

/**
 * Everything the screens and API routes need from storage. The fake (file-backed)
 * store implements it now; the Supabase store will implement the same contract,
 * so swapping it changes no screen code. Every call takes the acting user's id and
 * never returns another user's rows.
 */
export interface DataLayer {
  getProfile(userId: string): Promise<Profile | null>;
  /** Saves body details. Targets are recomputed from them unless the person set their own. */
  upsertProfile(userId: string, input: ProfileInput): Promise<Profile>;
  /** The person's own targets, or null to go back to the ones worked out from body details. */
  setTargets(userId: string, targets: Targets | null): Promise<Profile>;

  listFoods(userId: string): Promise<Food[]>;
  searchFoods(userId: string, query: string, limit?: number): Promise<Food[]>;
  /** The person's own foods and recipes only (not the shared catalogue). */
  listCustomFoods(userId: string): Promise<Food[]>;
  createCustomFood(userId: string, input: NewFoodInput): Promise<Food>;
  /**
   * Deletes a food or recipe. Meals already logged keep their numbers; the item just
   * loses its link. A food still used in one of the person's recipes is refused.
   */
  deleteCustomFood(userId: string, foodId: string): Promise<void>;

  getRecipe(userId: string, recipeId: string): Promise<Recipe | null>;
  /** Ingredients must be foods the person can see, and not recipes themselves. */
  createRecipe(userId: string, input: RecipeInput): Promise<Recipe>;
  /** Changes the recipe from now on; meals already logged keep their numbers. */
  updateRecipe(userId: string, recipeId: string, input: RecipeInput): Promise<Recipe>;

  createDraftMeal(userId: string, draft: DraftMealInput): Promise<Meal>;
  getMeal(userId: string, mealId: string): Promise<Meal | null>;
  saveMeal(userId: string, mealId: string, input: SaveMealInput): Promise<Meal>;
  deleteMeal(userId: string, mealId: string): Promise<void>;
  getDay(userId: string, localDate: string): Promise<DaySummary>;
  /** Saved meals with items whose local day is between `from` and `to` (inclusive, YYYY-MM-DD). */
  getMealsBetween(userId: string, from: string, to: string): Promise<Meal[]>;

  listFavouriteFoodIds(userId: string): Promise<string[]>;
  /** Stars or un-stars a food the user can see. Idempotent. */
  setFavourite(userId: string, foodId: string, favourite: boolean): Promise<void>;

  savePhoto(userId: string, mealId: string, bytes: Uint8Array): Promise<string>;
  readPhoto(userId: string, mealId: string): Promise<Uint8Array | null>;

  recordAiUsage(usage: AiUsage): Promise<void>;
  countAiUsageSince(userId: string, since: Date): Promise<number>;

  /** Removes the user and everything they own, photos included. Cannot be undone. */
  deleteAccount(userId: string): Promise<void>;
}
