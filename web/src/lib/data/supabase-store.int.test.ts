/*
 * Runs the data layer against the REAL Supabase project in web/.env.local:
 *   npm run test:supabase
 * Creates two throwaway users (example.com addresses), checks that each sees only
 * their own data, then deletes both. Needs the email + password provider enabled
 * (Supabase's default) so the test can sign in without email.
 */
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createSupabaseStore } from "./supabase-store";
import type { DataLayer, DraftMealInput, ProfileInput } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const secret = process.env.SUPABASE_SECRET_KEY ?? "";

const admin = () => createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

type TestUser = { id: string; client: SupabaseClient; store: DataLayer };

async function makeUser(): Promise<TestUser> {
  const email = `rct-test-${randomUUID()}@example.com`;
  const password = `${randomUUID()}Aa1!`;
  const { data, error } = await admin().auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  const client = createClient(url, publishable, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  return { id: data.user.id, client, store: createSupabaseStore({ user: async () => client, admin }) };
}

const profile: ProfileInput = {
  displayName: "Test",
  sex: "female",
  birthYear: 1994,
  heightCm: 160,
  weightKg: 60,
  activityLevel: "light",
  goal: "maintain",
  dietType: "vegetarian",
};

const draft = (over: Partial<DraftMealInput> = {}): DraftMealInput => ({
  id: randomUUID(),
  mealType: "dinner",
  inputMethod: "photo",
  eatenAt: "2026-10-16T20:00:00.000Z",
  photoPath: "set-below",
  rawText: null,
  aiModel: "test",
  items: [
    { foodId: "seed-phulka", name: "Phulka", quantity: 2, unit: "piece", grams: 70, nutrients: { kcal: 208, proteinG: 6.9, carbG: 38.5, fatG: 2.6, fiberG: 6.3 }, source: "ai", aiConfidence: "high" },
    { foodId: null, name: "Mystery sabzi", quantity: 1, unit: "katori", grams: 120, nutrients: { kcal: 120, proteinG: 3, carbG: 10, fatG: 7, fiberG: 3 }, source: "ai", aiConfidence: "low" },
  ],
  ...over,
});

describe.skipIf(!url || !publishable || !secret)("Supabase data layer (live project)", () => {
  let a: TestUser;
  let b: TestUser;

  beforeAll(async () => {
    a = await makeUser();
    b = await makeUser();
    await a.store.upsertProfile(a.id, profile);
    await b.store.upsertProfile(b.id, { ...profile, displayName: "Other" });
  }, 30_000);

  afterAll(async () => {
    for (const u of [a, b]) if (u) await admin().auth.admin.deleteUser(u.id).catch(() => undefined);
  });

  it("stores the profile with computed targets", async () => {
    const p = await a.store.getProfile(a.id);
    expect(p?.targets.kcal).toBeGreaterThan(1200);
    expect(p?.timezone).toBe("Asia/Kolkata");
  });

  it("sees the seeded catalogue (run npm run db:seed first)", async () => {
    const found = await a.store.searchFoods(a.id, "roti");
    expect(found[0]?.id).toBe("seed-phulka");
  });

  it("creates, retries, saves and separates meals", async () => {
    const input = draft();
    const meal = await a.store.createDraftMeal(a.id, input);
    expect(meal.items).toHaveLength(2);
    expect(meal.localDate).toBe("2026-10-17"); // 20:00 UTC is 01:30 IST next day
    expect((await a.store.createDraftMeal(a.id, input)).items).toHaveLength(2);

    expect(await b.store.getMeal(b.id, meal.id)).toBeNull();
    expect(await b.store.getMeal(a.id, meal.id)).toBeNull(); // even when naming A's id
    await expect(b.store.createDraftMeal(b.id, input)).rejects.toThrow();
    await expect(b.store.deleteMeal(b.id, meal.id)).rejects.toThrow("not found");

    const keep = { id: meal.items[0].id, quantity: 3, unit: "piece" as const };
    await expect(a.store.saveMeal(a.id, meal.id, { mealType: "dinner", items: [keep], expectedUpdatedAt: "2000-01-01T00:00:00Z" })).rejects.toThrow("changed somewhere else");
    const saved = await a.store.saveMeal(a.id, meal.id, { mealType: "dinner", items: [keep], expectedUpdatedAt: meal.updatedAt });
    expect(saved.status).toBe("saved");
    expect(saved.items.map((i) => i.id)).toEqual([meal.items[0].id]);
    expect(saved.items[0].grams).toBe(105);

    expect((await a.store.getDay(a.id, "2026-10-17")).meals.map((m) => m.id)).toEqual([meal.id]);
    expect((await b.store.getDay(b.id, "2026-10-17")).meals).toHaveLength(0);
  }, 60_000);

  it("refuses a stale save inside the database quickly (race guard)", async () => {
    const meal = await a.store.createDraftMeal(a.id, draft());
    const started = Date.now();
    const { error } = await a.client.rpc("save_meal", {
      p_meal_id: meal.id,
      p_meal_type: "dinner",
      p_health_score: 5,
      p_items: [{ id: meal.items[0].id, name: "Phulka", quantity: 1, unit: "piece", grams: 35, kcal: 104, protein_g: 3, carb_g: 19, fat_g: 1, fiber_g: 3, source: "ai" }],
      p_expected_updated_at: "2000-01-01T00:00:00Z",
    });
    expect(error?.code).toBe("PT409");
    expect(Date.now() - started).toBeLessThan(10_000);
  }, 30_000);

  it("keeps photos private to their owner", async () => {
    const meal = await a.store.createDraftMeal(a.id, draft());
    await a.store.savePhoto(a.id, meal.id, new Uint8Array([0xff, 0xd8, 0xff, 0xe0]));
    expect(await a.store.readPhoto(a.id, meal.id)).toEqual(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]));
    expect(await b.store.readPhoto(a.id, meal.id)).toBeNull();
    const { data } = await b.client.storage.from("meal-photos").list(a.id);
    expect(data ?? []).toHaveLength(0);
  }, 30_000);

  it("blocks direct writes users must not make", async () => {
    const usage = await a.client.from("ai_usage").insert({ user_id: a.id, kind: "photo", model: "x" });
    expect(usage.error).not.toBeNull();
    const food = await a.client.from("foods").insert({ name: "Fake catalogue food", kcal: 1, source: "usda" });
    expect(food.error).not.toBeNull();
    const anon = createClient(url, publishable, { auth: { persistSession: false } });
    const { data } = await anon.from("meals").select("id");
    expect(data ?? []).toHaveLength(0);
  });

  it("keeps favourites private and limited to foods the user can see", async () => {
    await a.store.setFavourite(a.id, "seed-phulka", true);
    await a.store.setFavourite(a.id, "seed-phulka", true); // idempotent
    expect(await a.store.listFavouriteFoodIds(a.id)).toEqual(["seed-phulka"]);
    expect(await b.store.listFavouriteFoodIds(b.id)).toEqual([]);
    expect(await b.store.listFavouriteFoodIds(a.id)).toEqual([]); // even naming A's id
    // A's private custom food can't be starred by B.
    const { data: custom, error } = await a.client.from("foods").insert({ owner_id: a.id, name: "A's secret dish", kcal: 100, source: "user" }).select("id").single();
    expect(error).toBeNull();
    await expect(b.store.setFavourite(b.id, custom!.id, true)).rejects.toThrow("isn't in your food list");
    await a.store.setFavourite(a.id, "seed-phulka", false);
    expect(await a.store.listFavouriteFoodIds(a.id)).toEqual([]);
  });

  it("custom foods and item fixes work live and stay private", async () => {
    const food = await a.store.createCustomFood(a.id, { name: "A's thepla", unit: "piece", gramsPerUnit: 40, perServing: { kcal: 120, proteinG: 3, carbG: 16, fatG: 5, fiberG: 2 } });
    expect(food.ownerId).toBe(a.id);
    expect((await a.store.searchFoods(a.id, "thepla")).map((f) => f.id)).toContain(food.id);
    expect(await b.store.searchFoods(b.id, "A's thepla")).toEqual([]);
    expect(await b.store.listCustomFoods(b.id)).toEqual([]);
    await expect(b.store.deleteCustomFood(b.id, food.id)).rejects.toThrow("isn't one of yours");

    const meal = await a.store.createDraftMeal(a.id, draft());
    const saved = await a.store.saveMeal(a.id, meal.id, {
      mealType: "dinner",
      items: [
        { id: meal.items[0].id, quantity: 2, unit: "piece", foodId: "seed-paratha", name: "Lachha paratha" },
        { id: meal.items[1].id, quantity: 1, unit: "katori", override: { kcal: 150, proteinG: 4, carbG: 12, fatG: 9, fiberG: 3 } },
        { foodId: food.id, quantity: 1, unit: "piece" },
        { custom: { name: "Pickle", kcal: 30 } },
      ],
    });
    expect(saved.items.map((i) => [i.name, Math.round(i.nutrients.kcal), i.source, i.foodId])).toEqual([
      ["Lachha paratha", 512, "db", "seed-paratha"],
      ["Mystery sabzi", 150, "user", null],
      ["A's thepla", 120, "db", food.id],
      ["Pickle", 30, "user", null],
    ]);
    // B can't use A's private food in B's own meal.
    const bMeal = await b.store.createDraftMeal(b.id, draft());
    await expect(b.store.saveMeal(b.id, bMeal.id, { mealType: "lunch", items: [{ foodId: food.id, quantity: 1, unit: "piece" }] })).rejects.toThrow("isn't in your food list");

    await a.store.deleteCustomFood(a.id, food.id);
    const after = await a.store.getMeal(a.id, meal.id);
    expect(after?.items[2]).toMatchObject({ name: "A's thepla", foodId: null });
  }, 30_000);

  it("recipes work live, stay private and guard their ingredients", async () => {
    const masala = await a.store.createCustomFood(a.id, { name: "A's masala", unit: "tbsp", gramsPerUnit: 6, perServing: { kcal: 20, proteinG: 1, carbG: 3, fatG: 0.5, fiberG: 1 } });
    const input = {
      name: "A's dal",
      servings: 4,
      servingUnit: "katori" as const,
      cookedGrams: 900,
      ingredients: [
        { foodId: "seed-raw-toor-dal", quantity: 1, unit: "katori" as const },
        { foodId: "seed-onion", quantity: 1, unit: "piece" as const },
        { foodId: "seed-tomato", quantity: 1, unit: "piece" as const },
        { foodId: masala.id, quantity: 1, unit: "tbsp" as const },
      ],
    };
    const recipe = await a.store.createRecipe(a.id, input);
    expect(recipe.food).toMatchObject({ isRecipe: true, ownerId: a.id, defaultUnit: "katori", unitGrams: { katori: 225 } });
    const reread = await a.store.getRecipe(a.id, recipe.food.id);
    expect(reread).toMatchObject({ servings: 4, cookedGrams: 900, servingUnit: "katori" });
    expect(reread?.ingredients.map((i) => [i.food.id, i.quantity, i.unit])).toEqual([
      ["seed-raw-toor-dal", 1, "katori"],
      ["seed-onion", 1, "piece"],
      ["seed-tomato", 1, "piece"],
      [masala.id, 1, "tbsp"],
    ]);

    // B sees none of it and can't use A's private ingredient or add to A's recipe.
    expect(await b.store.getRecipe(b.id, recipe.food.id)).toBeNull();
    expect(await b.store.getRecipe(a.id, recipe.food.id)).toBeNull(); // even naming A's id
    await expect(b.store.createRecipe(b.id, input)).rejects.toThrow("isn't in your food list");
    const { data: peek } = await b.client.from("recipe_ingredients").select("id").eq("recipe_id", recipe.food.id);
    expect(peek ?? []).toHaveLength(0);
    const sneak = await b.client.from("recipe_ingredients").insert({ recipe_id: recipe.food.id, ingredient_id: "seed-oil", grams: 100 });
    expect(sneak.error).not.toBeNull();
    // Migration 3: even straight through the API, B's own recipe can't use A's private food,
    // and ingredients only hang off recipes.
    const bRecipe = await b.store.createRecipe(b.id, { name: "B's khichdi", servings: 2, servingUnit: "katori", ingredients: [{ foodId: "seed-raw-rice", quantity: 1, unit: "katori" }] });
    const borrow = await b.client.from("recipe_ingredients").insert({ recipe_id: bRecipe.food.id, ingredient_id: masala.id, grams: 6 });
    expect(borrow.error?.code).toBe("42501");
    const bPlain = await b.store.createCustomFood(b.id, { name: "B's plain", unit: "piece", gramsPerUnit: 50, perServing: { kcal: 100, proteinG: 1, carbG: 20, fatG: 1, fiberG: 1 } });
    const offPlain = await b.client.from("recipe_ingredients").insert({ recipe_id: bPlain.id, ingredient_id: "seed-oil", grams: 5 });
    expect(offPlain.error?.code).toBe("42501");
    await b.store.deleteCustomFood(b.id, bRecipe.food.id);
    await b.store.deleteCustomFood(b.id, bPlain.id);
    // Servings and cooked weight are real columns now; source_ref stays empty.
    const { data: stored } = await admin().from("foods").select("recipe_servings, cooked_grams, source_ref").eq("id", recipe.food.id).single();
    expect(stored).toEqual({ recipe_servings: 4, cooked_grams: 900, source_ref: null });

    // Logged as one food; editing the recipe later leaves that meal alone.
    const meal = await a.store.createDraftMeal(a.id, draft());
    const saved = await a.store.saveMeal(a.id, meal.id, { mealType: "dinner", items: [{ foodId: recipe.food.id, quantity: 1, unit: "katori" }] });
    const kcal = saved.items[0].nutrients.kcal;
    expect(kcal).toBeCloseTo((343 * 1.3 + 40 * 1.1 + 18 + 20) / 4, 0);
    await expect(a.store.deleteCustomFood(a.id, masala.id)).rejects.toThrow("your recipe “A's dal”");
    const updated = await a.store.updateRecipe(a.id, recipe.food.id, { ...input, cookedGrams: undefined, ingredients: input.ingredients.slice(0, 3) });
    expect(updated.ingredients).toHaveLength(3);
    const afterEdit = await a.store.getRecipe(a.id, recipe.food.id);
    expect(afterEdit?.ingredients.map((i) => i.food.id)).not.toContain(masala.id);
    expect(afterEdit?.cookedGrams).toBeUndefined();
    expect((await a.store.getMeal(a.id, meal.id))?.items[0].nutrients.kcal).toBe(kcal);

    await a.store.deleteCustomFood(a.id, masala.id); // no longer an ingredient
    await a.store.deleteCustomFood(a.id, recipe.food.id);
    expect(await a.store.getRecipe(a.id, recipe.food.id)).toBeNull();
    const { data: left } = await admin().from("recipe_ingredients").select("id").eq("recipe_id", recipe.food.id);
    expect(left).toHaveLength(0);
    expect((await a.store.getMeal(a.id, meal.id))?.items[0]).toMatchObject({ foodId: null, nutrients: { kcal } });
  }, 60_000);

  it("returns meals in a date range for the owner only", async () => {
    const meal = await a.store.createDraftMeal(a.id, draft({ eatenAt: "2026-10-10T07:30:00.000Z" }));
    await a.store.saveMeal(a.id, meal.id, { mealType: "lunch", items: [{ id: meal.items[0].id, quantity: 1, unit: "piece" }] });
    expect((await a.store.getMealsBetween(a.id, "2026-10-10", "2026-10-10")).map((m) => m.id)).toEqual([meal.id]);
    expect(await b.store.getMealsBetween(b.id, "2026-10-01", "2026-10-31")).toHaveLength(0);
  });

  it("reads more meals than one API page holds (an all-time export)", async () => {
    // 1,050 saved meals across 2020: more than Supabase's default of 1,000 rows per request.
    const rows = Array.from({ length: 1050 }, (_, n) => {
      const at = new Date(Date.UTC(2020, 0, 1, 2) + n * 6 * 3_600_000).toISOString();
      return { user_id: a.id, meal_type: "snack", input_method: "search", eaten_at: at, status: "saved", saved_at: at };
    });
    const { error } = await admin().from("meals").insert(rows);
    expect(error).toBeNull();
    try {
      const meals = await a.store.getMealsBetween(a.id, "2020-01-01", "2020-12-31");
      expect(meals).toHaveLength(1050);
      expect(new Set(meals.map((m) => m.id)).size).toBe(1050); // pages don't overlap
      expect(meals.every((m, i) => i === 0 || Date.parse(m.eatenAt) >= Date.parse(meals[i - 1].eatenAt))).toBe(true);
      expect(await b.store.getMealsBetween(b.id, "2020-01-01", "2020-12-31")).toHaveLength(0);
    } finally {
      await admin().from("meals").delete().eq("user_id", a.id).gte("eaten_at", "2020-01-01").lt("eaten_at", "2021-01-02");
    }
  }, 60_000);

  it("keeps your own targets live (needs migration 4)", async (ctx) => {
    const { error: probe } = await admin().from("profiles").select("targets_custom").limit(1);
    if (probe?.code === "42703") ctx.skip(); // column not there yet: run migration 4
    const own = { kcal: 1500, proteinG: 100, carbG: 150, fatG: 50, fiberG: 30 };
    expect(await a.store.setTargets(a.id, own)).toMatchObject({ targets: own, targetsCustom: true });
    expect((await a.store.upsertProfile(a.id, { ...profile, weightKg: 80 })).targets).toEqual(own);
    expect((await b.store.getProfile(b.id))?.targetsCustom).toBe(false);
    const back = await a.store.setTargets(a.id, null);
    expect(back.targetsCustom).toBe(false);
    expect(back.targets.kcal).not.toBe(1500);
    await a.store.upsertProfile(a.id, profile);
  });

  it("counts AI usage per user", async () => {
    await a.store.recordAiUsage({ userId: a.id, kind: "photo", model: "test", inputTokens: 1, outputTokens: 1, createdAt: new Date().toISOString() });
    const since = new Date(Date.now() - 60_000);
    expect(await a.store.countAiUsageSince(a.id, since)).toBe(1);
    expect(await b.store.countAiUsageSince(b.id, since)).toBe(0);
  });

  it("deletes an account with all its rows and photos", async () => {
    // A recipe made from the person's own food used to make this fail, depending on row order.
    const own = await b.store.createCustomFood(b.id, { name: "B's ghee mix", unit: "tbsp", gramsPerUnit: 14, perServing: { kcal: 120, proteinG: 0, carbG: 0, fatG: 13, fiberG: 0 } });
    await b.store.createRecipe(b.id, { name: "B's dal", servings: 2, servingUnit: "katori", ingredients: [{ foodId: own.id, quantity: 1, unit: "tbsp" }, { foodId: "seed-raw-toor-dal", quantity: 1, unit: "katori" }] });
    await b.store.deleteAccount(b.id);
    const { data } = await admin().from("meals").select("id").eq("user_id", b.id);
    expect(data).toHaveLength(0);
    const { data: user } = await admin().auth.admin.getUserById(b.id);
    expect(user.user).toBeNull();
  });
});
