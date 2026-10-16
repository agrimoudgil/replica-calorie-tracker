import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { isId } from "@/lib/ids";
import { sniffImage } from "@/lib/images";
import { sumNutrients } from "@/lib/nutrition/portions";
import { ageOn, computeTargets } from "@/lib/nutrition/targets";
import type { Food, Nutrients } from "@/lib/nutrition/types";
import { PHOTO_BUCKET } from "@/lib/supabase/config";
import { rankFoods } from "./food-rank";
import { applyItemEdits, mealScore } from "./meal-math";
import { DataError, type DataLayer, type Meal, type MealItem, type Profile } from "./types";

/*
 * DataLayer on Supabase. `user()` must return a client acting as the signed-in user,
 * so row level security limits every query to their rows; queries also filter by
 * user_id as a second line of defence. `admin()` (secret key, bypasses RLS) is used
 * only for AI usage rows and account deletion, always with an explicit user id.
 */

type Row = Record<string, unknown>;
type Clients = { user: () => Promise<SupabaseClient>; admin: () => SupabaseClient };

const num = (v: unknown) => (v === null || v === undefined ? undefined : Number(v));

function nutrientsFromRow(r: Row): Nutrients {
  return {
    kcal: Number(r.kcal),
    proteinG: Number(r.protein_g),
    carbG: Number(r.carb_g),
    fatG: Number(r.fat_g),
    fiberG: Number(r.fiber_g),
    sugarG: num(r.sugar_g),
    satFatG: num(r.sat_fat_g),
    sodiumMg: num(r.sodium_mg),
    calciumMg: num(r.calcium_mg),
    ironMg: num(r.iron_mg),
  };
}

function nutrientsToRow(n: Nutrients) {
  return {
    kcal: n.kcal,
    protein_g: n.proteinG,
    carb_g: n.carbG,
    fat_g: n.fatG,
    fiber_g: n.fiberG,
    sugar_g: n.sugarG ?? null,
    sat_fat_g: n.satFatG ?? null,
    sodium_mg: n.sodiumMg ?? null,
    calcium_mg: n.calciumMg ?? null,
    iron_mg: n.ironMg ?? null,
  };
}

function profileFromRow(r: Row): Profile {
  return {
    id: String(r.id),
    displayName: (r.display_name as string | null) ?? null,
    sex: r.sex as Profile["sex"],
    birthYear: Number(r.birth_year),
    heightCm: Number(r.height_cm),
    weightKg: Number(r.weight_kg),
    activityLevel: r.activity_level as Profile["activityLevel"],
    goal: r.goal as Profile["goal"],
    dietType: r.diet_type as Profile["dietType"],
    targets: {
      kcal: Number(r.daily_kcal_target),
      proteinG: Number(r.protein_g_target),
      carbG: Number(r.carb_g_target),
      fatG: Number(r.fat_g_target),
      fiberG: Number(r.fiber_g_target),
    },
    timezone: String(r.timezone),
    onboardedAt: String(r.onboarded_at),
    updatedAt: String(r.updated_at),
  };
}

export function foodFromRow(r: Row): Food {
  return {
    id: String(r.id),
    ownerId: (r.owner_id as string | null) ?? null,
    name: String(r.name),
    nameHi: (r.name_hi as string | null) ?? undefined,
    aliases: (r.aliases as string[]) ?? [],
    dietTags: (r.diet_tags as Food["dietTags"]) ?? [],
    unitGrams: (r.unit_grams as Food["unitGrams"]) ?? { g: 1 },
    defaultUnit: r.default_unit as Food["defaultUnit"],
    per100g: nutrientsFromRow(r),
    source: r.source as Food["source"],
    verified: Boolean(r.verified),
  };
}

export function foodToRow(f: Food) {
  return {
    id: f.id,
    owner_id: f.ownerId,
    name: f.name,
    name_hi: f.nameHi ?? null,
    aliases: f.aliases,
    diet_tags: f.dietTags,
    unit_grams: f.unitGrams,
    default_unit: f.defaultUnit,
    ...nutrientsToRow(f.per100g),
    source: f.source,
    verified: f.verified,
  };
}

function itemFromRow(r: Row): MealItem {
  return {
    id: String(r.id),
    foodId: (r.food_id as string | null) ?? null,
    position: Number(r.position),
    name: String(r.name),
    nameHi: (r.name_hi as string | null) ?? undefined,
    quantity: Number(r.quantity),
    unit: r.unit as MealItem["unit"],
    grams: Number(r.grams),
    nutrients: nutrientsFromRow(r),
    source: r.source as MealItem["source"],
    aiConfidence: (r.ai_confidence as MealItem["aiConfidence"]) ?? undefined,
  };
}

function itemToJson(i: Omit<MealItem, "id" | "position"> & { id?: string }) {
  return {
    ...(i.id ? { id: i.id } : {}),
    food_id: i.foodId,
    name: i.name,
    name_hi: i.nameHi ?? null,
    quantity: i.quantity,
    unit: i.unit,
    grams: i.grams,
    ...nutrientsToRow(i.nutrients),
    source: i.source,
    ai_confidence: i.aiConfidence ?? null,
  };
}

function mealFromRow(r: Row): Meal {
  const items = ((r.meal_items as Row[] | undefined) ?? []).map(itemFromRow).sort((a, b) => a.position - b.position);
  return {
    id: String(r.id),
    userId: String(r.user_id),
    status: r.status as Meal["status"],
    mealType: r.meal_type as Meal["mealType"],
    inputMethod: r.input_method as Meal["inputMethod"],
    eatenAt: String(r.eaten_at),
    localDate: String(r.local_date),
    photoPath: (r.photo_path as string | null) ?? null,
    rawText: (r.raw_text as string | null) ?? null,
    healthScore: r.health_score === null ? null : Number(r.health_score),
    aiModel: (r.ai_model as string | null) ?? null,
    items,
    savedAt: (r.saved_at as string | null) ?? null,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}

/** Database error codes raised by our functions and constraints → DataError. */
function toDataError(error: PostgrestError): Error {
  switch (error.code) {
    case "P0002":
      return new DataError("not_found", "Meal not found.");
    case "PT409":
    case "40001":
      return new DataError("conflict", "This meal changed somewhere else. Reload to see the latest.");
    case "23505":
      return new DataError("conflict", "That already exists.");
    case "28000":
    case "42501":
      return new DataError("forbidden", "You can't change that.");
    case "22023":
    case "23514":
    case "22P02":
      return new DataError("invalid", "Some values are out of range.");
    default:
      return new Error(`Database error ${error.code}`);
  }
}

const MEAL_WITH_ITEMS = "*, meal_items(*)";
const photoKey = (userId: string, mealId: string) => `${userId}/${mealId}.jpg`;

export function createSupabaseStore(clients: Clients): DataLayer {
  const getMeal = async (userId: string, mealId: string): Promise<Meal | null> => {
    if (!isId(mealId)) return null;
    const db = await clients.user();
    const { data, error } = await db.from("meals").select(MEAL_WITH_ITEMS).eq("id", mealId).eq("user_id", userId).maybeSingle();
    if (error) throw toDataError(error);
    return data ? mealFromRow(data) : null;
  };

  const mustGetMeal = async (userId: string, mealId: string) => {
    const meal = await getMeal(userId, mealId);
    if (!meal) throw new DataError("not_found", "Meal not found.");
    return meal;
  };

  return {
    async getProfile(userId) {
      const db = await clients.user();
      const { data, error } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
      if (error) throw toDataError(error);
      return data ? profileFromRow(data) : null;
    },

    async upsertProfile(userId, input) {
      const t = computeTargets({
        sex: input.sex,
        age: ageOn(input.birthYear, new Date()),
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        activity: input.activityLevel,
        goal: input.goal,
      });
      const db = await clients.user();
      const { data, error } = await db
        .from("profiles")
        .upsert(
          {
            id: userId,
            display_name: input.displayName,
            sex: input.sex,
            birth_year: input.birthYear,
            height_cm: input.heightCm,
            weight_kg: input.weightKg,
            activity_level: input.activityLevel,
            goal: input.goal,
            diet_type: input.dietType,
            daily_kcal_target: t.kcal,
            protein_g_target: t.proteinG,
            carb_g_target: t.carbG,
            fat_g_target: t.fatG,
            fiber_g_target: t.fiberG,
            ...(input.timezone ? { timezone: input.timezone } : {}),
          },
          { onConflict: "id" },
        )
        .select("*")
        .single();
      if (error) throw toDataError(error);
      return profileFromRow(data);
    },

    async listFoods() {
      const db = await clients.user();
      const { data, error } = await db.from("foods").select("*").order("name");
      if (error) throw toDataError(error);
      return data.map(foodFromRow);
    },

    async searchFoods(_userId, query, limit = 20) {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const escaped = q.replace(/[\\%_]/g, (m) => `\\${m}`);
      const db = await clients.user();
      const { data, error } = await db.from("foods").select("*").ilike("search_text", `%${escaped}%`).limit(50);
      if (error) throw toDataError(error);
      return rankFoods(data.map(foodFromRow), query, limit);
    },

    async createDraftMeal(userId, draft) {
      if (!isId(draft.id)) throw new DataError("invalid", "Bad meal id.");
      const db = await clients.user();
      const { error } = await db.rpc("create_draft_meal", {
        p_meal: {
          id: draft.id,
          meal_type: draft.mealType,
          input_method: draft.inputMethod,
          eaten_at: draft.eatenAt,
          photo_path: draft.photoPath,
          raw_text: draft.rawText,
          ai_model: draft.aiModel,
          health_score: mealScore(draft.items as MealItem[]),
        },
        p_items: draft.items.map(itemToJson),
      });
      if (error) throw toDataError(error);
      return mustGetMeal(userId, draft.id);
    },

    getMeal,

    async saveMeal(userId, mealId, input) {
      const meal = await mustGetMeal(userId, mealId);
      // Fast path for the common case; save_meal re-checks under a row lock for races.
      if (input.expectedUpdatedAt && input.expectedUpdatedAt !== meal.updatedAt) {
        throw new DataError("conflict", "This meal changed somewhere else. Reload to see the latest.");
      }
      const foodIds = [...new Set(meal.items.map((i) => i.foodId).filter((id): id is string => Boolean(id)))];
      const db = await clients.user();
      let foods: Food[] = [];
      if (foodIds.length) {
        const { data, error } = await db.from("foods").select("*").in("id", foodIds);
        if (error) throw toDataError(error);
        foods = data.map(foodFromRow);
      }
      const items = applyItemEdits(meal, input.items, foods);
      const { error } = await db.rpc("save_meal", {
        p_meal_id: mealId,
        p_meal_type: input.mealType,
        p_health_score: mealScore(items),
        p_items: items.map(itemToJson),
        p_expected_updated_at: input.expectedUpdatedAt ?? null,
      });
      if (error) throw toDataError(error);
      return mustGetMeal(userId, mealId);
    },

    async deleteMeal(userId, mealId) {
      if (!isId(mealId)) throw new DataError("not_found", "Meal not found.");
      const db = await clients.user();
      const { data, error } = await db.from("meals").delete().eq("id", mealId).eq("user_id", userId).select("id, photo_path");
      if (error) throw toDataError(error);
      if (!data.length) throw new DataError("not_found", "Meal not found.");
      if (data[0].photo_path) await db.storage.from(PHOTO_BUCKET).remove([photoKey(userId, mealId)]);
    },

    async getDay(userId, date) {
      const db = await clients.user();
      const { data, error } = await db
        .from("meals")
        .select(MEAL_WITH_ITEMS)
        .eq("user_id", userId)
        .eq("status", "saved")
        .eq("local_date", date)
        .order("eaten_at");
      if (error) throw toDataError(error);
      const meals = data.map(mealFromRow);
      return { date, meals, totals: sumNutrients(meals.flatMap((m) => m.items.map((i) => i.nutrients))) };
    },

    async listFavouriteFoodIds(userId) {
      const db = await clients.user();
      const { data, error } = await db.from("favourite_foods").select("food_id").eq("user_id", userId).order("created_at");
      if (error) throw toDataError(error);
      return data.map((r) => String(r.food_id));
    },

    async setFavourite(userId, foodId, favourite) {
      const db = await clients.user();
      if (favourite) {
        // Foreign keys ignore RLS, so check the food is visible to this user (catalogue or their own).
        const { data: visible, error: readError } = await db.from("foods").select("id").eq("id", foodId).maybeSingle();
        if (readError) throw toDataError(readError);
        if (!visible) throw new DataError("not_found", "That food isn't in your food list.");
        const { error } = await db.from("favourite_foods").upsert({ user_id: userId, food_id: foodId }, { onConflict: "user_id,food_id", ignoreDuplicates: true });
        if (error) throw toDataError(error);
      } else {
        const { error } = await db.from("favourite_foods").delete().eq("user_id", userId).eq("food_id", foodId);
        if (error) throw toDataError(error);
      }
    },

    async getMealsBetween(userId, from, to) {
      const db = await clients.user();
      const { data, error } = await db
        .from("meals")
        .select(MEAL_WITH_ITEMS)
        .eq("user_id", userId)
        .eq("status", "saved")
        .gte("local_date", from)
        .lte("local_date", to)
        .order("eaten_at");
      if (error) throw toDataError(error);
      return data.map(mealFromRow);
    },

    async savePhoto(userId, mealId, bytes) {
      if (!isId(userId) || !isId(mealId)) throw new DataError("invalid", "Bad id.");
      const db = await clients.user();
      const key = photoKey(userId, mealId);
      const { error } = await db.storage
        .from(PHOTO_BUCKET)
        .upload(key, bytes, { contentType: sniffImage(bytes) ?? "image/jpeg", upsert: true });
      if (error) throw new Error("Photo upload failed");
      return key;
    },

    async readPhoto(userId, mealId) {
      if (!isId(userId) || !isId(mealId)) return null;
      const db = await clients.user();
      const { data, error } = await db.storage.from(PHOTO_BUCKET).download(photoKey(userId, mealId));
      if (error || !data) return null;
      return new Uint8Array(await data.arrayBuffer());
    },

    async recordAiUsage(usage) {
      const { error } = await clients.admin().from("ai_usage").insert({
        user_id: usage.userId,
        kind: usage.kind,
        model: usage.model,
        input_tokens: usage.inputTokens,
        output_tokens: usage.outputTokens,
        created_at: usage.createdAt,
      });
      if (error) throw toDataError(error);
    },

    async countAiUsageSince(userId, since) {
      const db = await clients.user();
      const { count, error } = await db
        .from("ai_usage")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since.toISOString());
      if (error) throw toDataError(error);
      return count ?? 0;
    },

    async deleteAccount(userId) {
      if (!isId(userId)) throw new DataError("invalid", "Bad user id.");
      const admin = clients.admin();
      // Photos first (storage has no foreign keys), then the auth user: deleting it
      // cascades to every table through the ON DELETE CASCADE keys.
      for (;;) {
        const { data, error } = await admin.storage.from(PHOTO_BUCKET).list(userId, { limit: 1000 });
        if (error) throw new Error("Could not list photos");
        if (!data.length) break;
        const { error: removeError } = await admin.storage.from(PHOTO_BUCKET).remove(data.map((o) => `${userId}/${o.name}`));
        if (removeError) throw new Error("Could not delete photos");
        if (data.length < 1000) break;
      }
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) throw new Error("Could not delete the account");
    },
  };
}
