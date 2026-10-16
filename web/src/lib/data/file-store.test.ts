import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStore } from "./file-store";
import type { DataLayer, DraftMealInput, ProfileInput } from "./types";

const profile: ProfileInput = {
  displayName: "Asha",
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
  mealType: "lunch",
  inputMethod: "photo",
  eatenAt: "2026-10-16T07:30:00.000Z",
  photoPath: null,
  rawText: null,
  aiModel: "demo",
  items: [
    { foodId: "seed-phulka", name: "Phulka", quantity: 2, unit: "piece", grams: 70, nutrients: { kcal: 208, proteinG: 6.9, carbG: 38.5, fatG: 2.6, fiberG: 6.3 }, source: "ai", aiConfidence: "high" },
    { foodId: null, name: "Mystery sabzi", quantity: 1, unit: "katori", grams: 120, nutrients: { kcal: 120, proteinG: 3, carbG: 10, fatG: 7, fiberG: 3 }, source: "ai", aiConfidence: "low" },
  ],
  ...over,
});

let dir: string;
let db: DataLayer;
const A = randomUUID();
const B = randomUUID();

beforeEach(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "rct-"));
  db = createFileStore(dir);
  await db.upsertProfile(A, profile);
  await db.upsertProfile(B, { ...profile, displayName: "Ravi", sex: "male" });
});

afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe("file store", () => {
  it("computes targets when saving a profile", async () => {
    const p = await db.getProfile(A);
    expect(p?.targets.kcal).toBeGreaterThan(1200);
    expect(p?.timezone).toBe("Asia/Kolkata");
  });

  it("keeps each user's meals separate", async () => {
    const meal = await db.createDraftMeal(A, draft());
    expect(await db.getMeal(B, meal.id)).toBeNull();
    await expect(db.saveMeal(B, meal.id, { mealType: "lunch", items: [{ id: meal.items[0].id, quantity: 1, unit: "piece" }] })).rejects.toThrow("not found");
    await expect(db.deleteMeal(B, meal.id)).rejects.toThrow("not found");
    expect(await db.getMeal(A, meal.id)).not.toBeNull();
  });

  it("returns the same draft when a create is retried, and refuses another user's id", async () => {
    const input = draft();
    const first = await db.createDraftMeal(A, input);
    const again = await db.createDraftMeal(A, { ...input, mealType: "dinner" });
    expect(again).toEqual(first);
    await expect(db.createDraftMeal(B, input)).rejects.toThrow("already used");
  });

  it("saves by rescaling stored items, drops removed ones and appears on the right local day", async () => {
    const meal = await db.createDraftMeal(A, draft());
    const saved = await db.saveMeal(A, meal.id, {
      mealType: "lunch",
      items: [{ id: meal.items[0].id, quantity: 3, unit: "piece" }],
      expectedUpdatedAt: meal.updatedAt,
    });
    expect(saved.status).toBe("saved");
    expect(saved.items).toHaveLength(1);
    expect(saved.items[0].grams).toBe(105);
    expect(saved.items[0].nutrients.kcal).toBe(312);
    expect(saved.healthScore).not.toBeNull();

    // 07:30 UTC is 13:00 in India: 16 October
    const day = await db.getDay(A, "2026-10-16");
    expect(day.meals.map((m) => m.id)).toEqual([meal.id]);
    expect(day.totals.kcal).toBe(312);
    expect((await db.getDay(B, "2026-10-16")).meals).toHaveLength(0);
  });

  it("puts a late-night meal on the user's local day, not the UTC day", async () => {
    // 20:00 UTC on 16 Oct is 01:30 on 17 Oct in India
    const meal = await db.createDraftMeal(A, draft({ eatenAt: "2026-10-16T20:00:00.000Z" }));
    expect(meal.localDate).toBe("2026-10-17");
  });

  it("rejects a stale save and unknown items", async () => {
    const meal = await db.createDraftMeal(A, draft());
    const item = { id: meal.items[0].id, quantity: 1, unit: "piece" as const };
    await db.saveMeal(A, meal.id, { mealType: "lunch", items: [item] });
    await expect(db.saveMeal(A, meal.id, { mealType: "lunch", items: [item], expectedUpdatedAt: meal.updatedAt })).rejects.toThrow("changed somewhere else");
    await expect(db.saveMeal(A, meal.id, { mealType: "lunch", items: [{ ...item, id: randomUUID() }] })).rejects.toThrow("Unknown item");
    await expect(db.saveMeal(A, meal.id, { mealType: "lunch", items: [] })).rejects.toThrow("at least one");
  });

  it("returns saved meals in a date range, own only", async () => {
    for (const [i, eatenAt] of ["2026-10-10T07:30:00.000Z", "2026-10-14T07:30:00.000Z", "2026-10-20T07:30:00.000Z"].entries()) {
      const meal = await db.createDraftMeal(A, draft({ eatenAt }));
      if (i < 3) await db.saveMeal(A, meal.id, { mealType: "lunch", items: [{ id: meal.items[0].id, quantity: 1, unit: "piece" }] });
    }
    await db.createDraftMeal(A, draft({ eatenAt: "2026-10-12T07:30:00.000Z" })); // draft: excluded
    const inRange = await db.getMealsBetween(A, "2026-10-10", "2026-10-16");
    expect(inRange.map((m) => m.localDate)).toEqual(["2026-10-10", "2026-10-14"]);
    expect(await db.getMealsBetween(B, "2026-10-01", "2026-10-31")).toHaveLength(0);
  });

  it("keeps favourites per user, idempotent, catalogue foods only", async () => {
    await db.setFavourite(A, "seed-phulka", true);
    await db.setFavourite(A, "seed-phulka", true);
    await db.setFavourite(A, "seed-curd", true);
    await db.setFavourite(A, "seed-curd", false);
    expect(await db.listFavouriteFoodIds(A)).toEqual(["seed-phulka"]);
    expect(await db.listFavouriteFoodIds(B)).toEqual([]);
    await expect(db.setFavourite(A, "not-a-food", true)).rejects.toThrow("isn't in your food list");
    await db.deleteAccount(A);
    expect(await db.listFavouriteFoodIds(A)).toEqual([]);
  });

  it("custom foods: private, searchable, usable in meals, deletable without breaking meals", async () => {
    const food = await db.createCustomFood(A, { name: "Mom's thepla", unit: "piece", gramsPerUnit: 40, perServing: { kcal: 120, proteinG: 3, carbG: 16, fatG: 5, fiberG: 2 } });
    expect((await db.searchFoods(A, "thepla")).map((f) => f.id)).toEqual([food.id]);
    expect(await db.searchFoods(B, "thepla")).toEqual([]);
    expect((await db.listCustomFoods(A)).map((f) => f.name)).toEqual(["Mom's thepla"]);
    await expect(db.deleteCustomFood(B, food.id)).rejects.toThrow("isn't one of yours");

    const meal = await db.createDraftMeal(A, draft());
    const saved = await db.saveMeal(A, meal.id, {
      mealType: "dinner",
      items: [
        { id: meal.items[0].id, quantity: 2, unit: "piece", name: "Tawa roti" },
        { foodId: food.id, quantity: 2, unit: "piece" },
        { custom: { name: "Pickle", kcal: 30 } },
      ],
    });
    expect(saved.items.map((i) => [i.name, Math.round(i.nutrients.kcal), i.source])).toEqual([["Tawa roti", 208, "ai"], ["Mom's thepla", 240, "db"], ["Pickle", 30, "user"]]);
    // B can't put A's food into B's meal.
    const bMeal = await db.createDraftMeal(B, draft());
    await expect(db.saveMeal(B, bMeal.id, { mealType: "lunch", items: [{ foodId: food.id, quantity: 1, unit: "piece" }] })).rejects.toThrow("isn't in your food list");

    await db.deleteCustomFood(A, food.id);
    const after = await db.getMeal(A, meal.id);
    expect(after?.items[1]).toMatchObject({ name: "Mom's thepla", foodId: null, nutrients: { kcal: 240 } });
    expect(await db.searchFoods(A, "thepla")).toEqual([]);
  });

  it("recipes: private, log as one food, edit without changing old meals, guard their ingredients", async () => {
    const masala = await db.createCustomFood(A, { name: "Home masala", unit: "tbsp", gramsPerUnit: 6, perServing: { kcal: 20, proteinG: 1, carbG: 3, fatG: 0.5, fiberG: 1 } });
    const input = {
      name: "My dal",
      servings: 4,
      servingUnit: "katori" as const,
      ingredients: [
        { foodId: "seed-raw-toor-dal", quantity: 1, unit: "katori" as const },
        { foodId: "seed-onion", quantity: 1, unit: "piece" as const },
        { foodId: masala.id, quantity: 1, unit: "tbsp" as const },
      ],
    };
    const recipe = await db.createRecipe(A, input);
    expect(recipe.ingredients).toHaveLength(3);
    expect((await db.searchFoods(A, "my dal"))[0]).toMatchObject({ id: recipe.food.id, isRecipe: true });
    expect(await db.getRecipe(B, recipe.food.id)).toBeNull();
    await expect(db.createRecipe(B, input)).rejects.toThrow("isn't in your food list"); // A's masala
    await expect(db.updateRecipe(B, recipe.food.id, input)).rejects.toThrow("isn't one of yours");

    const meal = await db.createDraftMeal(A, draft());
    const saved = await db.saveMeal(A, meal.id, { mealType: "dinner", items: [{ foodId: recipe.food.id, quantity: 1, unit: "katori" }] });
    const kcal = saved.items[0].nutrients.kcal;
    expect(kcal).toBeCloseTo((343 * 1.3 + 40 * 1.1 + 20) / 4, 0);

    await expect(db.deleteCustomFood(A, masala.id)).rejects.toThrow("your recipe “My dal”");
    const updated = await db.updateRecipe(A, recipe.food.id, { ...input, servings: 2, ingredients: input.ingredients.slice(0, 2) });
    expect(updated.ingredients.map((i) => i.food.id)).toEqual(["seed-raw-toor-dal", "seed-onion"]);
    expect((await db.getMeal(A, meal.id))?.items[0].nutrients.kcal).toBe(kcal); // logged meals keep their numbers

    await db.deleteCustomFood(A, masala.id); // no longer an ingredient
    await db.deleteCustomFood(A, recipe.food.id);
    expect(await db.getRecipe(A, recipe.food.id)).toBeNull();
    expect((await db.getMeal(A, meal.id))?.items[0]).toMatchObject({ foodId: null, nutrients: { kcal } });
  });

  it("drafts never count toward the day", async () => {
    await db.createDraftMeal(A, draft());
    expect((await db.getDay(A, "2026-10-16")).meals).toHaveLength(0);
  });

  it("stores photos per user and deletes them with the meal", async () => {
    const meal = await db.createDraftMeal(A, draft({ photoPath: "x" }));
    await db.savePhoto(A, meal.id, new Uint8Array([0xff, 0xd8, 0xff]));
    expect(await db.readPhoto(B, meal.id)).toBeNull();
    expect(await db.readPhoto(A, meal.id)).toEqual(new Uint8Array([0xff, 0xd8, 0xff]));
    await db.deleteMeal(A, meal.id);
    expect(fs.existsSync(path.join(dir, "photos", A, `${meal.id}.jpg`))).toBe(false);
  });

  it("refuses ids that could escape the data folder", async () => {
    await expect(db.savePhoto(A, "../../evil", new Uint8Array([1]))).rejects.toThrow("Bad meal id");
    await expect(db.createDraftMeal("not-a-uuid", draft())).rejects.toThrow("Bad user id");
  });

  it("survives a restart (data is on disk)", async () => {
    const meal = await db.createDraftMeal(A, draft());
    const reopened = createFileStore(dir);
    expect((await reopened.getMeal(A, meal.id))?.items).toHaveLength(2);
  });

  it("counts AI usage per user", async () => {
    const now = new Date();
    await db.recordAiUsage({ userId: A, kind: "photo", model: "m", inputTokens: 1, outputTokens: 1, createdAt: now.toISOString() });
    expect(await db.countAiUsageSince(A, new Date(now.getTime() - 1000))).toBe(1);
    expect(await db.countAiUsageSince(B, new Date(now.getTime() - 1000))).toBe(0);
  });
});
