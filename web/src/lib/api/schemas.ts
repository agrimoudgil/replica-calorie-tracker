import { z } from "zod";
import { MAX_INGREDIENTS, MAX_SERVINGS, SERVING_UNITS } from "@/lib/data/recipe";
import type { Rating } from "@/lib/data/types";
import { DIET_TYPES, MEAL_TYPES, UNITS } from "@/lib/nutrition/types";

/** Shared by the onboarding form and PUT /api/profile. */
export function profileSchema(now = new Date()) {
  const year = now.getUTCFullYear();
  return z.object({
    displayName: z
      .string()
      .trim()
      .max(80, "Keep the name under 80 characters.")
      .nullable()
      .transform((v) => (v ? v : null)),
    sex: z.enum(["female", "male", "other"]),
    birthYear: z
      .number({ error: "Enter the year you were born." })
      .int()
      .min(year - 100, "Enter a real birth year.")
      // 18+: India's DPDP Act needs a parent's verified consent for anyone younger.
      .max(year - 18, "Oswald is for people aged 18 and over."),
    heightCm: z.number({ error: "Enter your height." }).min(100, "Enter a height between 100 and 250 cm.").max(250, "Enter a height between 100 and 250 cm."),
    weightKg: z.number({ error: "Enter your weight." }).min(25, "Enter a weight between 25 and 300 kg.").max(300, "Enter a weight between 25 and 300 kg."),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
    goal: z.enum(["lose", "maintain", "gain"]),
    dietType: z.enum(DIET_TYPES),
    consent: z.literal(true, { error: "Please agree so we can store your meals." }),
  });
}

export type ProfileForm = z.input<ReturnType<typeof profileSchema>>;

// Up to 3,000 because quantities in grams are large numbers.
const quantity = z.number().positive("Portions must be more than zero.").max(3000, "That portion is too large.");
const foodId = z.string().min(1).max(100);
const amount = (label: string, max: number) => z.number().min(0, `${label} can't be negative.`).max(max, `${label} looks too high.`);

/** Numbers a person types for a portion. */
export const macroNumbersSchema = z.object({
  kcal: amount("Calories", 5000),
  proteinG: amount("Protein", 500),
  carbG: amount("Carbs", 1000),
  fatG: amount("Fat", 500),
  fiberG: amount("Fibre", 200),
});

export const quickAddSchema = z.object({
  name: z.string().trim().max(120, "Keep the name under 120 characters."),
  kcal: amount("Calories", 5000),
  proteinG: amount("Protein", 500).optional(),
  carbG: amount("Carbs", 1000).optional(),
  fatG: amount("Fat", 500).optional(),
  fiberG: amount("Fibre", 200).optional(),
});

const newItem = z.union([
  z.object({ foodId, quantity, unit: z.enum(UNITS), name: z.string().trim().max(120).optional(), override: macroNumbersSchema.optional() }).strict(),
  z.object({ custom: quickAddSchema }).strict(),
]);

export const saveMealSchema = z.object({
  mealType: z.enum(MEAL_TYPES),
  items: z
    .array(
      z.union([
        z
          .object({
            id: z.uuid(),
            quantity,
            unit: z.enum(UNITS),
            name: z.string().trim().max(120).optional(),
            foodId: foodId.optional(),
            override: macroNumbersSchema.optional(),
          })
          .strict(),
        newItem,
      ]),
    )
    .min(1, "Keep at least one item.")
    .max(12, "Up to 12 foods per meal."),
  // Echoes the meal's updatedAt; Supabase sends it with an offset ("+00:00").
  expectedUpdatedAt: z.iso.datetime({ offset: true }).optional(),
});

export const favouriteSchema = z.object({ favourite: z.boolean() });

export const parseMealSchema = z.object({
  text: z.string().trim().min(1, "Type what you ate.").max(500, "Keep it under 500 characters."),
  /** Context for AI reading; optional, so older clients still work. */
  mealType: z.enum(MEAL_TYPES).optional(),
});

/** A meal built from catalogue foods (typed or searched). Nutrients are computed on the server. */
export const catalogueMealSchema = z.object({
  id: z.uuid(),
  mealType: z.enum(MEAL_TYPES),
  inputMethod: z.enum(["text", "voice", "search"]),
  rawText: z.string().max(1000).nullable().optional(),
  eatenAt: z.iso.datetime({ offset: true }),
  items: z.array(newItem).min(1, "Add at least one food.").max(12, "Up to 12 foods per meal."),
});

/** A food the person creates, described per serving. */
export const customFoodSchema = z.object({
  name: z.string().trim().min(1, "Give the food a name.").max(120, "Keep the name under 120 characters."),
  nameHi: z.string().trim().max(120).optional(),
  unit: z.enum(UNITS),
  gramsPerUnit: z.number({ error: "Enter how many grams one serving weighs." }).positive("Enter how many grams one serving weighs.").max(2000, "One serving can't weigh more than 2,000 g."),
  perServing: macroNumbersSchema,
});

/** The person's own daily targets (Goals & budgets). Whole numbers in sensible ranges. */
export const targetsSchema = z.object({
  kcal: z.number({ error: "Enter your calories." }).int("Use a whole number.").min(1000, "Calories: at least 1,000 a day.").max(6000, "Calories: at most 6,000 a day."),
  proteinG: z.number({ error: "Enter protein." }).int("Use a whole number.").min(20, "Protein: 20 to 400 g.").max(400, "Protein: 20 to 400 g."),
  carbG: z.number({ error: "Enter carbs." }).int("Use a whole number.").min(20, "Carbs: 20 to 800 g.").max(800, "Carbs: 20 to 800 g."),
  fatG: z.number({ error: "Enter fat." }).int("Use a whole number.").min(15, "Fat: 15 to 300 g.").max(300, "Fat: 15 to 300 g."),
  fiberG: z.number({ error: "Enter fibre." }).int("Use a whole number.").min(10, "Fibre: 10 to 100 g.").max(100, "Fibre: 10 to 100 g."),
});

const rating = (what: string) =>
  z
    .number({ error: `Choose your ${what}.` })
    .int()
    .min(1, `Choose your ${what}.`)
    .max(5, `Choose your ${what}.`)
    .transform((v) => v as Rating);

/** A recovery check-in. Sleep to the nearest tenth of an hour, as the database keeps it. */
export const checkInSchema = z.object({
  sleepHours: z
    .number({ error: "Enter how many hours you slept." })
    .min(0, "Sleep: 0 to 16 hours.")
    .max(16, "Sleep: 0 to 16 hours.")
    .transform((v) => Math.round(v * 10) / 10),
  energy: rating("energy"),
  soreness: rating("soreness"),
});

/** A recipe: ingredients and how many servings the pot makes. Nutrients are computed on the server. */
export const recipeSchema = z.object({
  name: z.string().trim().min(1, "Give the recipe a name.").max(120, "Keep the name under 120 characters."),
  servings: z.number({ error: "How many servings does it make?" }).positive("How many servings does it make?").max(MAX_SERVINGS, `Up to ${MAX_SERVINGS} servings.`),
  servingUnit: z.enum(SERVING_UNITS),
  cookedGrams: z.number().min(1, "Enter the cooked weight in grams, or leave it empty.").max(50000, "The cooked weight looks too high.").optional(),
  ingredients: z
    .array(z.object({ foodId, quantity, unit: z.enum(UNITS) }).strict())
    .min(1, "Add at least one ingredient.")
    .max(MAX_INGREDIENTS, `Up to ${MAX_INGREDIENTS} ingredients.`),
});

/** The user must tick "I understand" before an account is deleted. */
export const deleteAccountSchema = z.object({ confirm: z.literal(true, { error: "Confirm that you want to delete everything." }) });

export const photoFieldsSchema = z.object({
  mealId: z.uuid(),
  mealType: z.enum(MEAL_TYPES),
  eatenAt: z.iso.datetime(),
});
