import { NUTRIENT_KEYS, type Food, type Nutrients, type Unit } from "./types";

/** Fallback weights when a food has no specific weight for a unit. */
export const GENERIC_UNIT_GRAMS: Record<Unit, number> = {
  katori: 150,
  piece: 50,
  glass: 250,
  tbsp: 15,
  g: 1,
};

export const MAX_ITEM_GRAMS = 3000;

export function gramsFor(food: Pick<Food, "unitGrams"> | null, unit: Unit, quantity: number): number {
  const perUnit = food?.unitGrams[unit] ?? GENERIC_UNIT_GRAMS[unit];
  return clampGrams(perUnit * quantity);
}

export function clampGrams(grams: number): number {
  if (!Number.isFinite(grams)) return 1;
  return Math.min(Math.max(round1(grams), 1), MAX_ITEM_GRAMS);
}

export function zeroNutrients(): Nutrients {
  return { kcal: 0, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 };
}

/** Multiplies every nutrient by `factor`, keeping optional ones undefined when unknown. */
export function scaleNutrients(n: Nutrients, factor: number): Nutrients {
  const out = zeroNutrients();
  for (const key of NUTRIENT_KEYS) {
    const v = n[key];
    if (v !== undefined) out[key] = round1(v * factor);
  }
  return out;
}

export function nutrientsForGrams(food: Pick<Food, "per100g">, grams: number): Nutrients {
  return scaleNutrients(food.per100g, grams / 100);
}

export function sumNutrients(list: Nutrients[]): Nutrients {
  const out = zeroNutrients();
  for (const n of list) {
    for (const key of NUTRIENT_KEYS) {
      const v = n[key];
      if (v === undefined) continue;
      out[key] = round1((out[key] ?? 0) + v);
    }
  }
  return out;
}

/**
 * Removes impossible values from an estimate: no negatives, and no more energy
 * than pure fat (9 kcal per gram) or more macros than the portion weighs.
 */
export function sanitizeNutrients(n: Nutrients, grams: number): Nutrients {
  const out = zeroNutrients();
  for (const key of NUTRIENT_KEYS) {
    const v = n[key];
    if (v === undefined || !Number.isFinite(v)) continue;
    out[key] = Math.max(0, round1(v));
  }
  out.kcal = Math.min(out.kcal, round1(grams * 9));
  for (const key of ["proteinG", "carbG", "fatG", "fiberG", "sugarG", "satFatG"] as const) {
    const v = out[key];
    if (v !== undefined) out[key] = Math.min(v, grams);
  }
  return out;
}

export type PortionedItem = { quantity: number; unit: Unit; grams: number; nutrients: Nutrients };

/**
 * New portion for an item the user edited. Same unit: grams scale with quantity.
 * New unit: grams come from the food's unit weight (or the generic one).
 * Nutrients always scale with grams, so the item's nutrient density never changes.
 */
export function rescaleItem<T extends PortionedItem>(
  item: T,
  quantity: number,
  unit: Unit,
  food: Pick<Food, "unitGrams"> | null = null,
): T {
  if (!(quantity > 0) || !Number.isFinite(quantity)) return item;
  const grams =
    unit === item.unit && item.quantity > 0
      ? clampGrams((item.grams * quantity) / item.quantity)
      : gramsFor(food, unit, quantity);
  return { ...item, quantity, unit, grams, nutrients: scaleNutrients(item.nutrients, grams / item.grams) };
}

/**
 * Switches an item to another unit while keeping (about) the same amount of food:
 * 2 piece of phulka (70 g) becomes 70 g, and 300 g of dal becomes 2 katori.
 */
export function changeUnit<T extends PortionedItem>(item: T, unit: Unit, food: Pick<Food, "unitGrams"> | null = null): T {
  if (unit === item.unit) return item;
  const perUnit = unit === "g" ? 1 : (food?.unitGrams[unit] ?? GENERIC_UNIT_GRAMS[unit]);
  const raw = item.grams / perUnit;
  const quantity = unit === "g" ? Math.round(raw) : Math.max(0.25, Math.round(raw * 4) / 4);
  return rescaleItem(item, quantity, unit, food);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
