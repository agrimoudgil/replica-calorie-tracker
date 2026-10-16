export type Sex = "female" | "male" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";

export type Targets = { kcal: number; proteinG: number; carbG: number; fatG: number; fiberG: number };

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_DELTA: Record<Goal, number> = { lose: -500, maintain: 0, gain: 300 };
const MIN_KCAL = 1200;

export function ageOn(birthYear: number, today: Date): number {
  return today.getUTCFullYear() - birthYear;
}

/**
 * Daily targets from the Mifflin-St Jeor equation × activity, adjusted for the goal.
 * "other" uses the midpoint of the female and male constants.
 * Protein 1.2 g/kg (1.5 when losing), fat 27% of energy, carbs the rest,
 * fibre 14 g per 1,000 kcal (at least 25 g).
 */
export function computeTargets(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
}): Targets {
  const sexConstant = input.sex === "male" ? 5 : input.sex === "female" ? -161 : -78;
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + sexConstant;
  const raw = bmr * ACTIVITY_FACTOR[input.activity] + GOAL_DELTA[input.goal];
  const kcal = Math.max(MIN_KCAL, Math.round(raw / 10) * 10);

  const proteinG = Math.round(input.weightKg * (input.goal === "lose" ? 1.5 : 1.2));
  const fatG = Math.round((kcal * 0.27) / 9);
  const carbG = Math.max(0, Math.round((kcal - proteinG * 4 - fatG * 9) / 4));
  const fiberG = Math.max(25, Math.round((kcal / 1000) * 14));
  return { kcal, proteinG, carbG, fatG, fiberG };
}
