import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { localDate } from "@/lib/dates";
import { isId } from "@/lib/ids";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { rankFoods } from "./food-rank";
import { sumNutrients } from "@/lib/nutrition/portions";
import { computeTargets, ageOn } from "@/lib/nutrition/targets";
import type { Food } from "@/lib/nutrition/types";
import { applyItemEdits, mealScore } from "./meal-math";
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
};

export function createFileStore(dir: string): DataLayer {
  const file = path.join(dir, "store.json");
  let state: State | null = null;

  const load = (): State => {
    if (state) return state;
    try {
      state = JSON.parse(fs.readFileSync(file, "utf8")) as State;
    } catch {
      state = { profiles: {}, meals: {}, customFoods: [], aiUsage: [] };
    }
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
      return load().profiles[userId] ?? null;
    },

    async upsertProfile(userId, input) {
      requireId(userId, "user");
      const s = load();
      const now = new Date();
      const existing = s.profiles[userId];
      const profile: Profile = {
        ...input,
        id: userId,
        timezone: input.timezone ?? existing?.timezone ?? "Asia/Kolkata",
        targets: computeTargets({
          sex: input.sex,
          age: ageOn(input.birthYear, now),
          heightCm: input.heightCm,
          weightKg: input.weightKg,
          activity: input.activityLevel,
          goal: input.goal,
        }),
        onboardedAt: existing?.onboardedAt ?? now.toISOString(),
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
      s.customFoods = s.customFoods.filter((f) => f.ownerId !== userId);
      s.aiUsage = s.aiUsage.filter((u) => u.userId !== userId);
      persist();
      fs.rmSync(path.join(dir, "photos", userId), { recursive: true, force: true });
    },
  };
}
