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

  it("counts AI usage per user", async () => {
    await a.store.recordAiUsage({ userId: a.id, kind: "photo", model: "test", inputTokens: 1, outputTokens: 1, createdAt: new Date().toISOString() });
    const since = new Date(Date.now() - 60_000);
    expect(await a.store.countAiUsageSince(a.id, since)).toBe(1);
    expect(await b.store.countAiUsageSince(b.id, since)).toBe(0);
  });

  it("deletes an account with all its rows and photos", async () => {
    await b.store.deleteAccount(b.id);
    const { data } = await admin().from("meals").select("id").eq("user_id", b.id);
    expect(data).toHaveLength(0);
    const { data: user } = await admin().auth.admin.getUserById(b.id);
    expect(user.user).toBeNull();
  });
});
