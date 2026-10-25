import "server-only";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { createClaudeEstimator } from "./claude";
import { createClaudeReader } from "./claude-text";
import { dailyEstimateLimit, estimatorMode, globalDailyAiLimit, mealModel, photoLogging, textLogging, textModel, voiceLogging } from "./config";
import { createFakeEstimator, createFakeReader } from "./fake";
import type { MealEstimator, MealReader } from "./types";

/** Photo logging on (PHOTO_LOGGING=on) or off (the default: no photo screens, no AI). */
export const PHOTO_LOGGING = photoLogging(process.env);

/** AI reading of typed and spoken meals on (AI_TEXT_LOGGING=on) or off (the default: the free word matcher only). */
export const AI_TEXT_LOGGING = textLogging(process.env);

/** Voice logging on (VOICE_LOGGING=on) or off (the default). The browser does the speech-to-text. */
export const VOICE_LOGGING = voiceLogging(process.env);

/** Model for meal estimates (architecture.md: one environment variable to switch). */
export const MEAL_MODEL = mealModel(process.env);

/** Model for reading typed and spoken meals: TEXT_MODEL, else MEAL_MODEL. */
export const TEXT_MODEL = textModel(process.env);

/** Free daily AI calls per user (photo estimates and meal reading together). */
export const DAILY_ESTIMATE_LIMIT = dailyEstimateLimit(process.env);

/** AI calls per day across everyone: the hard cap on spend. */
export const GLOBAL_DAILY_AI_LIMIT = globalDailyAiLimit(process.env);

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

/** The same rule for reading typed and spoken meals: with AI text logging off, never Claude. */
function pickReader(): MealReader {
  return AI_TEXT_LOGGING && estimatorMode(process.env) === "claude" ? createClaudeReader({ model: TEXT_MODEL }) : createFakeReader();
}

const g = globalThis as typeof globalThis & { __rctEstimator?: MealEstimator; __rctReader?: MealReader };
export const estimator: MealEstimator = (g.__rctEstimator ??= pick());
export const reader: MealReader = (g.__rctReader ??= pickReader());

export * from "./types";
