import { round1 } from "@/lib/nutrition/portions";
import type { Food } from "@/lib/nutrition/types";
import { cleanMacros } from "./meal-math";
import { DataError, type NewFoodInput } from "./types";

/**
 * A person's food as a catalogue-shaped Food: nutrients per 100 g, worked out from
 * one serving. Refuses servings denser than pure fat (900 kcal per 100 g), which is
 * almost always a wrong serving weight.
 */
export function buildCustomFood(ownerId: string, id: string, input: NewFoodInput): Omit<Food, "id"> & { id: string } {
  // A food counted in grams is described per 100 g.
  const grams = input.unit === "g" ? 100 : input.gramsPerUnit;
  if (!(grams > 0 && grams <= 2000)) throw new DataError("invalid", "Enter how many grams one serving weighs (1 to 2,000).");
  const m = cleanMacros(input.perServing);
  const per100 = (v: number) => round1((v * 100) / grams);
  if (per100(m.kcal) > 900) throw new DataError("invalid", "That's more energy than pure fat. Check the serving weight.");
  if (m.proteinG + m.carbG + m.fatG > grams * 1.05) throw new DataError("invalid", "Protein, carbs and fat add up to more than the serving weighs.");
  return {
    id,
    ownerId,
    name: input.name.trim().slice(0, 120),
    nameHi: input.nameHi?.trim().slice(0, 120) || undefined,
    aliases: [],
    dietTags: [],
    unitGrams: { g: 1, ...(input.unit === "g" ? {} : { [input.unit]: grams }) },
    defaultUnit: input.unit,
    per100g: { kcal: per100(m.kcal), proteinG: per100(m.proteinG), carbG: per100(m.carbG), fatG: per100(m.fatG), fiberG: per100(m.fiberG) },
    source: "user",
    verified: false,
  };
}
