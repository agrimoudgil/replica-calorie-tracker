import { describe, expect, it } from "vitest";
import { dailyEstimateLimit, estimatorMode, mealModel, photoLogging } from "./config";

describe("photo logging switch", () => {
  it("is off unless set to on, even with a key present", () => {
    expect(photoLogging({})).toBe(false);
    expect(photoLogging({ ANTHROPIC_API_KEY: "key" })).toBe(false);
    for (const v of ["", " ", "off", "yes", "true", "1"]) expect(photoLogging({ PHOTO_LOGGING: v })).toBe(false);
    expect(photoLogging({ PHOTO_LOGGING: "on" })).toBe(true);
    expect(photoLogging({ PHOTO_LOGGING: " ON " })).toBe(true);
  });
});

// BUG-005: .env.example ships `MEAL_ESTIMATOR=` and `DAILY_ESTIMATE_LIMIT=` lines. An empty
// value counted as set, so adding a key kept the demo, and an empty limit meant 0 a day.
describe("estimator settings", () => {
  it("uses Claude when a key is present and the mode is empty or unset", () => {
    expect(estimatorMode({ ANTHROPIC_API_KEY: "key", MEAL_ESTIMATOR: "" })).toBe("claude");
    expect(estimatorMode({ ANTHROPIC_API_KEY: "key" })).toBe("claude");
    expect(estimatorMode({ ANTHROPIC_API_KEY: "", MEAL_ESTIMATOR: "" })).toBe("demo");
    expect(estimatorMode({})).toBe("demo");
  });

  it("follows an explicit mode", () => {
    expect(estimatorMode({ ANTHROPIC_API_KEY: "key", MEAL_ESTIMATOR: "demo" })).toBe("demo");
    expect(estimatorMode({ MEAL_ESTIMATOR: " claude " })).toBe("claude");
  });

  it("reads the daily limit, falling back to 15 when empty or not a whole number ≥ 0", () => {
    expect(dailyEstimateLimit({ DAILY_ESTIMATE_LIMIT: "5" })).toBe(5);
    expect(dailyEstimateLimit({ DAILY_ESTIMATE_LIMIT: "0" })).toBe(0);
    for (const v of [undefined, "", "  ", "abc", "-3", "2.5"]) expect(dailyEstimateLimit({ DAILY_ESTIMATE_LIMIT: v })).toBe(15);
  });

  it("falls back to the default model when the model is empty", () => {
    expect(mealModel({ MEAL_MODEL: "" })).toBe("claude-opus-5-5");
    expect(mealModel({ MEAL_MODEL: " claude-sonnet-5-5 " })).toBe("claude-sonnet-5-5");
  });
});
