import type { DietType, Food, MealType, Nutrients, Unit } from "@/lib/nutrition/types";
import type { ActivityLevel, Goal, Sex, Targets } from "@/lib/nutrition/targets";

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
  timezone: string;
  onboardedAt: string;
  updatedAt: string;
};

export type ProfileInput = Omit<Profile, "id" | "targets" | "timezone" | "onboardedAt" | "updatedAt"> & {
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

export type SaveMealInput = {
  mealType: MealType;
  /** Items kept from the draft, with their new portions. Items left out are removed. */
  items: Array<{ id: string; quantity: number; unit: Unit }>;
  /** Optimistic lock: the meal's updatedAt the client last saw. */
  expectedUpdatedAt?: string;
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
  upsertProfile(userId: string, input: ProfileInput): Promise<Profile>;

  listFoods(userId: string): Promise<Food[]>;
  searchFoods(userId: string, query: string, limit?: number): Promise<Food[]>;

  createDraftMeal(userId: string, draft: DraftMealInput): Promise<Meal>;
  getMeal(userId: string, mealId: string): Promise<Meal | null>;
  saveMeal(userId: string, mealId: string, input: SaveMealInput): Promise<Meal>;
  deleteMeal(userId: string, mealId: string): Promise<void>;
  getDay(userId: string, localDate: string): Promise<DaySummary>;

  savePhoto(userId: string, mealId: string, bytes: Uint8Array): Promise<string>;
  readPhoto(userId: string, mealId: string): Promise<Uint8Array | null>;

  recordAiUsage(usage: AiUsage): Promise<void>;
  countAiUsageSince(userId: string, since: Date): Promise<number>;

  /** Removes the user and everything they own, photos included. Cannot be undone. */
  deleteAccount(userId: string): Promise<void>;
}
