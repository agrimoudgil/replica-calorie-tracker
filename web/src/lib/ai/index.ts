import "server-only";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { createClaudeEstimator } from "./claude";
import { createFakeEstimator } from "./fake";
import type { MealEstimator } from "./types";

/** Model for meal estimates (architecture.md: one environment variable to switch). */
export const MEAL_MODEL = process.env.MEAL_MODEL ?? "claude-opus-5-5";

/** Free daily AI estimates per user. */
export const DAILY_ESTIMATE_LIMIT = Number(process.env.DAILY_ESTIMATE_LIMIT ?? 15);

/**
 * MEAL_ESTIMATOR=claude uses the Claude API (needs ANTHROPIC_API_KEY on the server);
 * MEAL_ESTIMATOR=demo never calls an AI. Unset: Claude when a key is present.
 */
function pick(): MealEstimator {
  const mode = process.env.MEAL_ESTIMATOR ?? (process.env.ANTHROPIC_API_KEY ? "claude" : "demo");
  return mode === "claude"
    ? createClaudeEstimator({ model: MEAL_MODEL, foods: async () => [...SEED_FOODS] })
    : createFakeEstimator();
}

const g = globalThis as typeof globalThis & { __rctEstimator?: MealEstimator };
export const estimator: MealEstimator = (g.__rctEstimator ??= pick());

export * from "./types";
