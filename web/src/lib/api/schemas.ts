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
  expectedUpdatedAt: z.iso.datetime().optional(),
});

export const photoFieldsSchema = z.object({
  mealId: z.uuid(),
  mealType: z.enum(MEAL_TYPES),
  eatenAt: z.iso.datetime(),
});
