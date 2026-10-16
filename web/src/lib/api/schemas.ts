import { z } from "zod";
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
      .max(year - 13, "You need to be at least 13 to use this app."),
    heightCm: z.number({ error: "Enter your height." }).min(100, "Enter a height between 100 and 250 cm.").max(250, "Enter a height between 100 and 250 cm."),
    weightKg: z.number({ error: "Enter your weight." }).min(25, "Enter a weight between 25 and 300 kg.").max(300, "Enter a weight between 25 and 300 kg."),
    activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
    goal: z.enum(["lose", "maintain", "gain"]),
    dietType: z.enum(DIET_TYPES),
    consent: z.literal(true, { error: "Please agree so we can store your meals." }),
  });
}

export type ProfileForm = z.input<ReturnType<typeof profileSchema>>;

export const saveMealSchema = z.object({
  mealType: z.enum(MEAL_TYPES),
  items: z
    .array(
      z.object({
        id: z.uuid(),
        // Up to 3,000 because quantities in grams are large numbers.
        quantity: z.number().positive("Portions must be more than zero.").max(3000, "That portion is too large."),
        unit: z.enum(UNITS),
      }),
    )
    .min(1, "Keep at least one item.")
    .max(12),
  // Echoes the meal's updatedAt; Supabase sends it with an offset ("+00:00").
  expectedUpdatedAt: z.iso.datetime({ offset: true }).optional(),
});

export const favouriteSchema = z.object({ favourite: z.boolean() });

export const parseMealSchema = z.object({
  text: z.string().trim().min(1, "Type what you ate.").max(500, "Keep it under 500 characters."),
});

/** A meal built from catalogue foods (typed or searched). Nutrients are computed on the server. */
export const catalogueMealSchema = z.object({
  id: z.uuid(),
  mealType: z.enum(MEAL_TYPES),
  inputMethod: z.enum(["text", "search"]),
  rawText: z.string().max(1000).nullable().optional(),
  eatenAt: z.iso.datetime({ offset: true }),
  items: z
    .array(
      z.object({
        foodId: z.string().min(1).max(100),
        quantity: z.number().positive("Portions must be more than zero.").max(3000, "That portion is too large."),
        unit: z.enum(UNITS),
      }),
    )
    .min(1, "Add at least one food.")
    .max(12, "Up to 12 foods per meal."),
});

/** The user must tick "I understand" before an account is deleted. */
export const deleteAccountSchema = z.object({ confirm: z.literal(true, { error: "Confirm that you want to delete everything." }) });

export const photoFieldsSchema = z.object({
  mealId: z.uuid(),
  mealType: z.enum(MEAL_TYPES),
  eatenAt: z.iso.datetime(),
});
