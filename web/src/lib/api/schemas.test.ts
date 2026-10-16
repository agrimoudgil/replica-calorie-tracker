import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { profileSchema, saveMealSchema } from "./schemas";

describe("saveMealSchema", () => {
  const item = (quantity: number, unit = "g") => ({ id: randomUUID(), quantity, unit });

  it("accepts gram quantities up to 3,000", () => {
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [item(150), item(3000)] }).success).toBe(true);
  });

  it("rejects empty meals, zero and huge portions, and unknown units", () => {
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [] }).success).toBe(false);
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [item(0)] }).success).toBe(false);
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [item(3001)] }).success).toBe(false);
    expect(saveMealSchema.safeParse({ mealType: "lunch", items: [item(1, "plate")] }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  const valid = {
    displayName: "  ",
    sex: "female",
    birthYear: 1994,
    heightCm: 160,
    weightKg: 60,
    activityLevel: "light",
    goal: "maintain",
    dietType: "vegetarian",
    consent: true,
  };
  const now = new Date("2026-10-16T00:00:00Z");

  it("trims a blank name to null", () => {
    const r = profileSchema(now).safeParse(valid);
    expect(r.success && r.data.displayName).toBe(null);
  });

  it("requires consent and an age of at least 13", () => {
    expect(profileSchema(now).safeParse({ ...valid, consent: false }).success).toBe(false);
    expect(profileSchema(now).safeParse({ ...valid, birthYear: 2015 }).success).toBe(false);
    expect(profileSchema(now).safeParse({ ...valid, birthYear: 2013 }).success).toBe(true);
  });
});
