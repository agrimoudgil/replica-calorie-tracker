/*
 * Estimator settings from the environment. An empty value counts as not set:
 * .env.example ships `MEAL_ESTIMATOR=` and similar lines (BUG-005).
 */

type Env = Record<string, string | undefined>;

const set = (value: string | undefined) => value?.trim() || undefined;

/**
 * Photo logging (photo → AI estimate) is off unless PHOTO_LOGGING=on. Off, the app
 * offers no photo screens and the estimate route refuses, so no AI is ever called,
 * even with a key present: the public test runs at no cost.
 */
export function photoLogging(env: Env): boolean {
  return set(env.PHOTO_LOGGING)?.toLowerCase() === "on";
}

/** claude | demo, as asked; otherwise Claude when a key is present. */
export function estimatorMode(env: Env): "claude" | "demo" {
  const mode = set(env.MEAL_ESTIMATOR);
  if (mode === "claude" || mode === "demo") return mode;
  return set(env.ANTHROPIC_API_KEY) ? "claude" : "demo";
}

/** Free photo estimates per person per day: a whole number ≥ 0, else 15. */
export function dailyEstimateLimit(env: Env): number {
  const n = Number(set(env.DAILY_ESTIMATE_LIMIT) ?? Number.NaN);
  return Number.isInteger(n) && n >= 0 ? n : 15;
}

export function mealModel(env: Env): string {
  return set(env.MEAL_MODEL) ?? "claude-opus-5-5";
}

/**
 * AI reading of typed or spoken meals is off unless AI_TEXT_LOGGING=on. Off, typing uses
 * only the free word matcher. On, the AI reads just the parts the matcher couldn't find;
 * calories and macros still come from the food list, never from the AI.
 */
export function textLogging(env: Env): boolean {
  return set(env.AI_TEXT_LOGGING)?.toLowerCase() === "on";
}

/** Model for reading typed and spoken meals; MEAL_MODEL (or its default) when not set. */
export function textModel(env: Env): string {
  return set(env.TEXT_MODEL) ?? mealModel(env);
}

/**
 * Voice logging (the browser turns speech into text) is off unless VOICE_LOGGING=on.
 * It costs nothing to run, but the browser's speech service hears the audio, so the
 * privacy page has to say so before it is switched on.
 */
export function voiceLogging(env: Env): boolean {
  return set(env.VOICE_LOGGING)?.toLowerCase() === "on";
}

/**
 * AI calls allowed per day across everyone (all kinds): a whole number ≥ 0, else 300.
 * The per-person limit alone can't cap spend, because anyone can open a new account.
 */
export function globalDailyAiLimit(env: Env): number {
  const n = Number(set(env.AI_GLOBAL_DAILY_LIMIT) ?? Number.NaN);
  return Number.isInteger(n) && n >= 0 ? n : 300;
}
