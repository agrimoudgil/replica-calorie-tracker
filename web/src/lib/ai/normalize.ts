import { matchFood } from "@/lib/nutrition/foods";
import { clampGrams, nutrientsForGrams, sanitizeNutrients } from "@/lib/nutrition/portions";
import { UNITS, type Food, type Nutrients, type Unit } from "@/lib/nutrition/types";
import { cleanBox } from "@/lib/photo-boxes";
import type { EstimatedItem } from "./types";

export type RawItem = {
  name: string;
  name_hi: string | null;
  quantity: number;
  unit: string;
  grams: number;
  kcal: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number | null;
  sat_fat_g: number | null;
  sodium_mg: number | null;
  calcium_mg: number | null;
  iron_mg: number | null;
  confidence: "high" | "medium" | "low";
  box?: { x: number; y: number; w: number; h: number } | null;
};

export const MAX_ITEMS = 12;

/**
 * Turns model output into safe items. Names that match the catalogue take the
 * catalogue's nutrient density (scaled to the estimated grams), so the same dish
 * always scores the same way; unknown dishes keep the model's numbers, clamped.
 */
export function normalizeItems(raw: RawItem[], foods: readonly Food[]): EstimatedItem[] {
  return raw
    .filter((r) => r.name.trim().length > 0)
    .slice(0, MAX_ITEMS)
    .map((r) => {
      const grams = clampGrams(r.grams);
      const unit: Unit = (UNITS as readonly string[]).includes(r.unit) ? (r.unit as Unit) : "g";
      const quantity = unit === "g" ? grams : r.quantity > 0 && Number.isFinite(r.quantity) ? Math.round(r.quantity * 4) / 4 : 1;
      const food = matchFood(r.name, foods);
      const modelNutrients: Nutrients = {
        kcal: r.kcal,
        proteinG: r.protein_g,
        carbG: r.carb_g,
        fatG: r.fat_g,
        fiberG: r.fiber_g,
        sugarG: r.sugar_g ?? undefined,
        satFatG: r.sat_fat_g ?? undefined,
        sodiumMg: r.sodium_mg ?? undefined,
        calciumMg: r.calcium_mg ?? undefined,
        ironMg: r.iron_mg ?? undefined,
      };
      return {
        foodId: food?.id ?? null,
        name: (food?.name ?? r.name.trim()).slice(0, 120),
        nameHi: food?.nameHi ?? r.name_hi?.trim().slice(0, 120) ?? undefined,
        quantity,
        unit,
        grams,
        nutrients: food ? nutrientsForGrams(food, grams) : sanitizeNutrients(modelNutrients, grams),
        confidence: r.confidence,
        box: cleanBox(r.box),
      };
    });
}
