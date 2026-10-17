import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { localDate } from "@/lib/dates";
import { isId } from "@/lib/ids";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { rankFoods } from "./food-rank";
import { sumNutrients } from "@/lib/nutrition/portions";
import { suggestedTargets } from "@/lib/nutrition/targets";
import type { Food } from "@/lib/nutrition/types";
import { buildCustomFood } from "./custom-food";
import { applyItemEdits, mealScore } from "./meal-math";
import { assembleRecipe, buildRecipe, recipeMeta, usedInRecipe, type IngredientGrams, type RecipeMeta } from "./recipe";
import { DataError, type AiUsage, type DataLayer, type Meal, type Profile } from "./types";

/*
 * Fake data layer for development before Supabase exists (see architecture.md).
 * Keeps everything in one JSON file and photos on disk under `dir`, which is
 * git-ignored. It follows the same rules the database will enforce: every read
 * and write is scoped to the acting user, saves are idempotent, and stale saves
 * are rejected.
 */

type State = {
  profiles: Record<string, Profile>;
  meals: Record<string, Meal>;
  customFoods: Food[];
  aiUsage: AiUsage[];
  favourites: Record<string, string[]>;
  /** By recipe id: what the database keeps in the recipe columns of foods and in recipe_ingredients. */
  recipes: Record<string, RecipeMeta & { ingredients: IngredientGrams[] }>;
};

export function createFileStore(dir: string): DataLayer {
  const file = path.join(dir, "store.json");
  let state: State | null = null;

  const load = (): State => {
    if (state) return state;
    try {
      state = JSON.parse(fs.readFileSync(file, "utf8")) as State;
    } catch {
      state = { profiles: {}, meals: {}, customFoods: [], aiUsage: [], favourites: {}, recipes: {} };
    }
    state.favourites ??= {}; // stores written before favourites existed
    state.recipes ??= {}; // ...or before recipes existed
    return state;
  };

  const persist = () => {
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state));
    fs.renameSync(tmp, file);
  };

  const requireId = (value: string, what: string) => {
    if (!isId(value)) throw new DataError("invalid", `Bad ${what} id.`);
  };

  const ownMeal = (userId: string, mealId: string): Meal | null => {
    const meal = load().meals[mealId];
    return meal && meal.userId === userId ? meal : null;
  };

  const foodsFor = (userId: string): Food[] => [
    ...SEED_FOODS,
    ...load().customFoods.filter((f) => f.ownerId === userId),
  ];

  const photoPath = (userId: string, mealId: string) => {
    requireId(userId, "user");
    requireId(mealId, "meal");
    return path.join(dir, "photos", userId, `${mealId}.jpg`);
  };

  return {
    async getProfile(userId) {
      const p = load().profiles[userId];
      return p ? { ...p, targetsCustom: p.targetsCustom === true } : null; // older stores lack the flag
    },

    async upsertProfile(userId, input) {
      requireId(userId, "user");
      const s = load();
      const now = new Date();
      const existing = s.profiles[userId];
      const custom = existing?.targetsCustom === true;
      const profile: Profile = {
        ...input,
        id: userId,
        timezone: input.timezone ?? existing?.timezone ?? "Asia/Kolkata",
        // The person's own targets stay; otherwise they follow the body details.
        targets: custom ? existing.targets : suggestedTargets(input, now),
        targetsCustom: custom,
        onboardedAt: existing?.onboardedAt ?? now.toISOString(),
        updatedAt: now.toISOString(),
      };
      s.profiles[userId] = profile;
      persist();
      return profile;
    },

    async setTargets(userId, targets) {
      const s = load();
      const existing = s.profiles[userId];
      if (!existing) throw new DataError("not_found", "Set up your profile first.");
      const now = new Date();
      const profile: Profile = {
        ...existing,
        targets: targets ?? suggestedTargets(existing, now),
        targetsCustom: targets !== null,
        updatedAt: now.toISOString(),
      };
      s.profiles[userId] = profile;
      persist();
      return profile;
    },

    async listFoods(userId) {
      return foodsFor(userId);
    },

    async searchFoods(userId, query, limit = 20) {
      return rankFoods(foodsFor(userId), query, limit);
    },

    async listCustomFoods(userId) {
      return load().customFoods.filter((f) => f.ownerId === userId).sort((a, b) => a.name.localeCompare(b.name));
    },

    async createCustomFood(userId, input) {
      requireId(userId, "user");
      const food = buildCustomFood(userId, randomUUID(), input);
      load().customFoods.push(food);
      persist();
      return food;
    },

    async deleteCustomFood(userId, foodId) {
      const s = load();
      const index = s.customFoods.findIndex((f) => f.id === foodId && f.ownerId === userId);
      if (index < 0) throw new DataError("not_found", "That food isn't one of yours.");
      const usedIn = s.customFoods.find((f) => f.ownerId === userId && s.recipes[f.id]?.ingredients.some((i) => i.foodId === foodId));
      if (usedIn) throw usedInRecipe(usedIn.name);
      s.customFoods.splice(index, 1);
      delete s.recipes[foodId];
      for (const meal of Object.values(s.meals)) {
        if (meal.userId !== userId) continue;
        for (const item of meal.items) if (item.foodId === foodId) item.foodId = null; // like ON DELETE SET NULL
      }
      for (const [uid, ids] of Object.entries(s.favourites)) s.favourites[uid] = ids.filter((id) => id !== foodId);
      persist();
    },

    async getRecipe(userId, recipeId) {
      const food = load().customFoods.find((f) => f.id === recipeId && f.ownerId === userId && f.isRecipe);
      const stored = food && load().recipes[food.id];
      return food && stored ? assembleRecipe(food, stored, stored.ingredients, foodsFor(userId)) : null;
    },

    async createRecipe(userId, input) {
      requireId(userId, "user");
      const built = buildRecipe(userId, randomUUID(), input, foodsFor(userId));
      const s = load();
      s.customFoods.push(built.food);
      s.recipes[built.food.id] = { ...recipeMeta(input), ingredients: built.ingredients };
      persist();
      return assembleRecipe(built.food, s.recipes[built.food.id], built.ingredients, foodsFor(userId));
    },

    async updateRecipe(userId, recipeId, input) {
      const s = load();
      const index = s.customFoods.findIndex((f) => f.id === recipeId && f.ownerId === userId && f.isRecipe);
      if (index < 0) throw new DataError("not_found", "That recipe isn't one of yours.");
      const built = buildRecipe(userId, recipeId, input, foodsFor(userId));
      s.customFoods[index] = built.food;
      s.recipes[recipeId] = { ...recipeMeta(input), ingredients: built.ingredients };
      persist();
      return assembleRecipe(built.food, s.recipes[recipeId], built.ingredients, foodsFor(userId));
    },

    async createDraftMeal(userId, draft) {
      requireId(userId, "user");
      requireId(draft.id, "meal");
      const s = load();
      const existing = s.meals[draft.id];
      if (existing) {
        if (existing.userId !== userId) throw new DataError("conflict", "Meal id already used.");
        return existing; // a retried request returns the meal it already created
      }
      const tz = s.profiles[userId]?.timezone;
      const now = new Date().toISOString();
      const items = draft.items.map((item, position) => ({ ...item, id: randomUUID(), position }));
      const meal: Meal = {
        id: draft.id,
        userId,
        status: "draft",
        mealType: draft.mealType,
        inputMethod: draft.inputMethod,
        eatenAt: draft.eatenAt,
        localDate: localDate(new Date(draft.eatenAt), tz),
        photoPath: draft.photoPath,
        rawText: draft.rawText,
        healthScore: mealScore(items),
        aiModel: draft.aiModel,
        items,
        savedAt: null,
        createdAt: now,
        updatedAt: now,
      };
      s.meals[meal.id] = meal;
      persist();
      return meal;
    },

    async getMeal(userId, mealId) {
      return ownMeal(userId, mealId);
    },

    async saveMeal(userId, mealId, input) {
      const meal = ownMeal(userId, mealId);
      if (!meal) throw new DataError("not_found", "Meal not found.");
      if (input.expectedUpdatedAt && input.expectedUpdatedAt !== meal.updatedAt) {
        throw new DataError("conflict", "This meal changed somewhere else. Reload to see the latest.");
      }
      const items = applyItemEdits(meal, input.items, foodsFor(userId));
      const now = new Date().toISOString();
      const saved: Meal = {
        ...meal,
        status: "saved",
        mealType: input.mealType,
        items,
        healthScore: mealScore(items),
        savedAt: meal.savedAt ?? now,
        updatedAt: now,
      };
      load().meals[mealId] = saved;
      persist();
      return saved;
    },

    async deleteMeal(userId, mealId) {
      const meal = ownMeal(userId, mealId);
      if (!meal) throw new DataError("not_found", "Meal not found.");
      delete load().meals[mealId];
      persist();
      if (meal.photoPath) fs.rmSync(photoPath(userId, mealId), { force: true });
    },

    async getDay(userId, date) {
      const meals = Object.values(load().meals)
        .filter((m) => m.userId === userId && m.status === "saved" && m.localDate === date)
        .sort((a, b) => a.eatenAt.localeCompare(b.eatenAt));
      return { date, meals, totals: sumNutrients(meals.flatMap((m) => m.items.map((i) => i.nutrients))) };
    },

    async listFavouriteFoodIds(userId) {
      return [...(load().favourites[userId] ?? [])];
    },

    async setFavourite(userId, foodId, favourite) {
      requireId(userId, "user");
      if (!foodsFor(userId).some((f) => f.id === foodId)) throw new DataError("not_found", "That food isn't in your food list.");
      const s = load();
      const current = new Set(s.favourites[userId] ?? []);
      if (favourite) current.add(foodId);
      else current.delete(foodId);
      s.favourites[userId] = [...current];
      persist();
    },

    async getMealsBetween(userId, from, to) {
      return Object.values(load().meals)
        .filter((m) => m.userId === userId && m.status === "saved" && m.localDate >= from && m.localDate <= to)
        .sort((a, b) => a.eatenAt.localeCompare(b.eatenAt));
    },

    async savePhoto(userId, mealId, bytes) {
      const p = photoPath(userId, mealId);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, bytes);
      return `${userId}/${mealId}.jpg`;
    },

    async readPhoto(userId, mealId) {
      if (!ownMeal(userId, mealId)) return null;
      try {
        return new Uint8Array(fs.readFileSync(photoPath(userId, mealId)));
      } catch {
        return null;
      }
    },

    async recordAiUsage(usage) {
      load().aiUsage.push(usage);
      persist();
    },

    async countAiUsageSince(userId, since) {
      const t = since.toISOString();
      return load().aiUsage.filter((u) => u.userId === userId && u.createdAt >= t).length;
    },

    async deleteAccount(userId) {
      requireId(userId, "user");
      const s = load();
      delete s.profiles[userId];
      for (const [id, meal] of Object.entries(s.meals)) if (meal.userId === userId) delete s.meals[id];
      for (const f of s.customFoods) if (f.ownerId === userId) delete s.recipes[f.id];
      s.customFoods = s.customFoods.filter((f) => f.ownerId !== userId);
      s.aiUsage = s.aiUsage.filter((u) => u.userId !== userId);
      delete s.favourites[userId];
      persist();
      fs.rmSync(path.join(dir, "photos", userId), { recursive: true, force: true });
    },
  };
}
