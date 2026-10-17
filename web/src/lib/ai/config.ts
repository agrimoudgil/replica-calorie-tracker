/*
 * Estimator settings from the environment. An empty value counts as not set:
 * .env.example ships `MEAL_ESTIMATOR=` and similar lines (BUG-005).
 */

type Env = Record<string, string | undefined>;

const set = (value: string | undefined) => value?.trim() || undefined;

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
