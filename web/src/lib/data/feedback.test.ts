import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { feedbackSchema } from "@/lib/api/schemas";
import { createFileStore } from "./file-store";
import { FEEDBACK_AFTER_MEALS, FEEDBACK_DAILY_LIMIT, type DataLayer, type DraftMealInput, type FeedbackInput, type ProfileInput } from "./types";

const profile: ProfileInput = {
  displayName: null, sex: "female", birthYear: 1994, heightCm: 160, weightKg: 60, activityLevel: "light", goal: "maintain", dietType: "vegetarian",
};
const draft = (): DraftMealInput => ({
  id: randomUUID(), mealType: "lunch", inputMethod: "text", eatenAt: "2026-11-27T07:30:00.000Z", photoPath: null, rawText: "2 roti", aiModel: null,
  items: [{ foodId: "seed-phulka", name: "Phulka", quantity: 2, unit: "piece", grams: 70, nutrients: { kcal: 208, proteinG: 6.9, carbG: 38.5, fatG: 2.6, fiberG: 6.3 }, source: "db" }],
});
const answer = (over: Partial<FeedbackInput> = {}): FeedbackInput => ({ kind: "profile", ease: 4, missing: null, prefersWhatsapp: null, dismissed: false, ...over });

let dir: string;
let db: DataLayer;
const A = randomUUID();
const B = randomUUID();

beforeEach(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "rct-feedback-"));
  db = createFileStore(dir);
  await db.upsertProfile(A, profile);
  await db.upsertProfile(B, profile);
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const saveMeals = async (userId: string, n: number) => {
  for (let i = 0; i < n; i++) {
    const meal = await db.createDraftMeal(userId, draft());
    await db.saveMeal(userId, meal.id, { mealType: "lunch", items: meal.items.map(({ id, quantity, unit }) => ({ id, quantity, unit })) });
  }
};

describe("feedback store", () => {
  it("counts only saved meals, per person", async () => {
    await saveMeals(A, FEEDBACK_AFTER_MEALS);
    await db.createDraftMeal(A, draft()); // a draft never counts
    expect(await db.countSavedMeals(A)).toBe(FEEDBACK_AFTER_MEALS);
    expect(await db.countSavedMeals(B)).toBe(0);
  });

  it("asks the one-time question once: an answer or 'Not now' both end it; Profile feedback doesn't", async () => {
    expect(await db.feedbackAsked(A)).toBe(false);
    await db.saveFeedback(A, answer({ kind: "profile", missing: "barcode for Indian snacks" }));
    expect(await db.feedbackAsked(A)).toBe(false);
    await db.saveFeedback(A, answer({ kind: "prompt", ease: null, dismissed: true }));
    expect(await db.feedbackAsked(A)).toBe(true);
    expect(await db.feedbackAsked(B)).toBe(false);
    await db.saveFeedback(B, answer({ kind: "prompt", ease: 2, prefersWhatsapp: "yes" }));
    expect(await db.feedbackAsked(B)).toBe(true);
  });

  it(`takes at most ${FEEDBACK_DAILY_LIMIT} a day per person`, async () => {
    for (let i = 0; i < FEEDBACK_DAILY_LIMIT; i++) await db.saveFeedback(A, answer());
    await expect(db.saveFeedback(A, answer())).rejects.toMatchObject({ code: "invalid" });
    await expect(db.saveFeedback(B, answer())).resolves.toBeUndefined();
  });

  it("is deleted with the account", async () => {
    await db.saveFeedback(A, answer({ kind: "prompt" }));
    await db.deleteAccount(A);
    expect(await db.feedbackAsked(A)).toBe(false);
  });
});

describe("feedback requests", () => {
  it("accepts any single answer, trimmed, with optional parts left out", () => {
    expect(feedbackSchema.parse({ kind: "profile", missing: "  dal makhani missing  " }))
      .toEqual({ kind: "profile", ease: null, missing: "dal makhani missing", prefersWhatsapp: null, dismissed: false });
    expect(feedbackSchema.parse({ kind: "prompt", ease: 5 }).ease).toBe(5);
    expect(feedbackSchema.parse({ kind: "prompt", prefersWhatsapp: "maybe" }).prefersWhatsapp).toBe("maybe");
    expect(feedbackSchema.parse({ kind: "prompt", dismissed: true }).dismissed).toBe(true);
  });

  it("refuses empty, out-of-range or oversized answers", () => {
    expect(feedbackSchema.safeParse({ kind: "profile" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ kind: "profile", missing: "   " }).success).toBe(false);
    expect(feedbackSchema.safeParse({ kind: "profile", ease: 6 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ kind: "profile", ease: 2.5 }).success).toBe(false);
    expect(feedbackSchema.safeParse({ kind: "profile", missing: "x".repeat(1001) }).success).toBe(false);
    expect(feedbackSchema.safeParse({ kind: "profile", prefersWhatsapp: "sometimes" }).success).toBe(false);
    expect(feedbackSchema.safeParse({ kind: "other", ease: 3 }).success).toBe(false);
    // "Not now" belongs to the one-time question only.
    expect(feedbackSchema.safeParse({ kind: "profile", dismissed: true }).success).toBe(false);
  });
});
