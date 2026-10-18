import "server-only";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { createClaudeEstimator } from "./claude";
import { dailyEstimateLimit, estimatorMode, mealModel, photoLogging } from "./config";
import { createFakeEstimator } from "./fake";
import type { MealEstimator } from "./types";

/** Photo logging on (PHOTO_LOGGING=on) or off (the default: no photo screens, no AI). */
export const PHOTO_LOGGING = photoLogging(process.env);

/** Model for meal estimates (architecture.md: one environment variable to switch). */
export const MEAL_MODEL = mealModel(process.env);

/** Free daily AI estimates per user. */
export const DAILY_ESTIMATE_LIMIT = dailyEstimateLimit(process.env);

/**
 * MEAL_ESTIMATOR=claude uses the Claude API (needs ANTHROPIC_API_KEY on the server);
 * MEAL_ESTIMATOR=demo never calls an AI. Unset or empty: Claude when a key is present.
 * With photo logging off, never Claude.
 */
function pick(): MealEstimator {
  return PHOTO_LOGGING && estimatorMode(process.env) === "claude"
    ? createClaudeEstimator({ model: MEAL_MODEL, foods: async () => [...SEED_FOODS] })
    : createFakeEstimator();
}

const g = globalThis as typeof globalThis & { __rctEstimator?: MealEstimator };
export const estimator: MealEstimator = (g.__rctEstimator ??= pick());

export * from "./types";
