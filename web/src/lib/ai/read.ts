import { matchFood, normalizeFoodName } from "@/lib/nutrition/foods";
import { clampGrams, MAX_ITEM_GRAMS, round1, sanitizeNutrients } from "@/lib/nutrition/portions";
import { UNITS, type Food, type Nutrients, type Unit } from "@/lib/nutrition/types";
import type { ReadItem } from "./types";

export const MAX_READ_ITEMS = 12;

type RawEstimate = { kcal: number; protein_g: number; carb_g: number; fat_g: number; fiber_g: number };
type RawReadItem = { name: string; search_name: string; quantity: number; unit: string; grams: number; confidence: ReadItem["confidence"] } & Partial<RawEstimate>;

/**
 * The AI's numbers for a portion, made safe: no negatives, no more energy than pure fat,
 * no more macros than the portion weighs. When its calories and its macros disagree by
 * more than a quarter, the calories are worked out from the macros (4 kcal a gram of
 * protein and carbs, 2 of fibre, 9 of fat), since a model is steadier on the parts.
 * No calories at all means no estimate.
 */
export function cleanEstimate(raw: Partial<RawEstimate>, grams: number): Nutrients | null {
  const n = sanitizeNutrients(
    { kcal: raw.kcal ?? Number.NaN, proteinG: raw.protein_g ?? 0, carbG: raw.carb_g ?? 0, fatG: raw.fat_g ?? 0, fiberG: raw.fiber_g ?? 0 },
    grams,
  );
  if (!(n.kcal > 0)) return null;
  n.fiberG = Math.min(n.fiberG, n.carbG);
  const fromMacros = 4 * n.proteinG + 4 * (n.carbG - n.fiberG) + 2 * n.fiberG + 9 * n.fatG;
  if (fromMacros > 0 && Math.abs(n.kcal - fromMacros) > Math.max(0.25 * n.kcal, 20)) n.kcal = round1(Math.min(fromMacros, grams * 9));
  return n;
}

/** Turns model output into safe items: names trimmed, amounts sensible, the list capped. */
export function cleanReadItems(raw: RawReadItem[]): ReadItem[] {
  return raw
    .filter((r) => r.name.trim().length > 0)
    .slice(0, MAX_READ_ITEMS)
    .map((r) => {
      const unit: Unit = (UNITS as readonly string[]).includes(r.unit) ? (r.unit as Unit) : "g";
      const grams = clampGrams(r.grams);
      const quantity =
        unit === "g"
          ? Math.min(Math.max(Math.round(r.quantity > 0 && Number.isFinite(r.quantity) ? r.quantity : grams), 1), MAX_ITEM_GRAMS)
          : r.quantity > 0 && Number.isFinite(r.quantity)
            ? Math.min(Math.max(0.25, Math.round(r.quantity * 4) / 4), 50)
            : 1;
      return {
        name: r.name.trim().slice(0, 120),
        searchName: (r.search_name.trim() || r.name.trim()).slice(0, 120),
        quantity,
        unit,
        grams,
        confidence: r.confidence,
        estimate: cleanEstimate(r, grams),
      };
    });
}

export type MatchedItem = {
  food: Food;
  quantity: number;
  unit: Unit;
  confidence: ReadItem["confidence"];
  /** True when the weight is the AI's guess, because the food has no weight for the unit said. */
  portionEstimated: boolean;
  /** What the AI read, to show next to the food it was matched to. */
  heard: string;
  /** The AI's own calories for the portion, to flag a match that looks far off. */
  aiKcal: number | null;
};

/** A food the list doesn't have, logged with the AI's checked numbers for the portion. */
export type TextEstimate = {
  name: string;
  quantity: number;
  unit: Unit;
  grams: number;
  nutrients: Nutrients;
  confidence: ReadItem["confidence"];
};

/** A food whose name or alias is exactly this (after normalising), or its singular ("eggs" → "egg"), else null. */
function exactFood(name: string, foods: readonly Food[]): Food | null {
  const q = normalizeFoodName(name);
  if (!q) return null;
  for (const form of q.endsWith("s") ? [q, q.slice(0, -1)] : [q]) {
    const food = foods.find((f) => [f.name, ...f.aliases].some((label) => normalizeFoodName(label) === form));
    if (food) return food;
  }
  return null;
}

// Words that say nothing about which food it is: amounts, containers, sizes.
const NOISE = new Set(["and", "the", "with", "bowl", "bowls", "plate", "plates", "cup", "cups", "glass", "glasses", "katori", "piece", "pieces", "slice", "slices", "some", "small", "medium", "big", "large", "homemade", "home", "style"]);

/** The words of a query that identify a food: normalised, three letters or more, no amounts or containers. */
function keyWords(q: string): string[] {
  return normalizeFoodName(q)
    .split(" ")
    .filter((w) => w.length >= 3 && !NOISE.has(w) && !/^\d/.test(w));
}

/**
 * Searches to try for one item, best first: the dish name, the plain description, then the
 * description's first two key words (only when that really shortens it).
 */
function queries(item: ReadItem): string[] {
  const description = keyWords(item.searchName);
  const list = [keyWords(item.name).join(" "), description.join(" "), description.length > 2 ? description.slice(0, 2).join(" ") : ""];
  return [...new Set(list.filter(Boolean))];
}

/** A search hit counts only if every key word starts a word of its name or an alias ("bowl" must not match "microwavable bowls" by accident). */
function fits(food: Food, query: string): boolean {
  const words = new Set([food.name, food.nameHi ?? "", ...food.aliases].flatMap((label) => normalizeFoodName(label).split(" ")));
  return keyWords(query).every((k) => [...words].some((w) => w.startsWith(k)));
}

/**
 * Finds each item in the food list (Oswald's catalogue and the person's own foods first,
 * then search, which adds world foods). Calories and macros then come from that food, so
 * the same dish always counts the same. Exact names come first and loose word matching
 * last: a description like "yogurt drink" must not become Curd just because it contains
 * "yogurt". A food the list doesn't have keeps the AI's checked estimate; one with no
 * usable estimate either is reported as not found, never given made-up numbers.
 */
export async function matchReadItems(
  items: readonly ReadItem[],
  foods: readonly Food[],
  search: (query: string) => Promise<Food[]>,
): Promise<{ items: MatchedItem[]; estimated: TextEstimate[]; unmatched: string[] }> {
  const matched: MatchedItem[] = [];
  const estimated: TextEstimate[] = [];
  const unmatched: string[] = [];
  for (const item of items) {
    let food = exactFood(item.name, foods) ?? exactFood(item.searchName, foods);
    for (const q of food ? [] : queries(item)) {
      food = (await search(q)).find((hit) => fits(hit, q)) ?? null;
      if (food) break;
    }
    food ??= matchFood(item.name, foods);
    if (!food) {
      if (item.estimate) {
        // The numbers are for the AI's weight, so a portion in grams is that weight ("2 plates" isn't 2 g).
        const quantity = item.unit === "g" ? Math.round(item.grams) : item.quantity;
        estimated.push({ name: item.name, quantity, unit: item.unit, grams: item.grams, nutrients: item.estimate, confidence: item.confidence });
      } else {
        unmatched.push(item.name);
      }
      continue;
    }
    // The food list's own weight for the unit when it has one; otherwise the AI's weight in grams.
    const known = item.unit === "g" || food.unitGrams[item.unit] !== undefined;
    matched.push({
      food,
      quantity: known ? item.quantity : Math.max(1, Math.round(item.grams)),
      unit: known ? item.unit : "g",
      confidence: item.confidence,
      portionEstimated: !known,
      heard: item.name,
      aiKcal: item.estimate?.kcal ?? null,
    });
  }
  return { items: matched, estimated, unmatched };
}
