import { matchFood, normalizeFoodName } from "@/lib/nutrition/foods";
import { clampGrams, MAX_ITEM_GRAMS } from "@/lib/nutrition/portions";
import { UNITS, type Food, type Unit } from "@/lib/nutrition/types";
import type { ReadItem } from "./types";

export const MAX_READ_ITEMS = 12;

type RawReadItem = { name: string; search_name: string; quantity: number; unit: string; grams: number; confidence: ReadItem["confidence"] };

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
 * then search, which adds world foods). Calories and macros then come from that food.
 * Exact names come first and loose word matching last: a description like "yogurt drink"
 * must not become Curd just because it contains "yogurt". An item with no match is
 * reported, never given made-up numbers.
 */
export async function matchReadItems(
  items: readonly ReadItem[],
  foods: readonly Food[],
  search: (query: string) => Promise<Food[]>,
): Promise<{ items: MatchedItem[]; unmatched: string[] }> {
  const matched: MatchedItem[] = [];
  const unmatched: string[] = [];
  for (const item of items) {
    let food = exactFood(item.name, foods) ?? exactFood(item.searchName, foods);
    for (const q of food ? [] : queries(item)) {
      food = (await search(q)).find((hit) => fits(hit, q)) ?? null;
      if (food) break;
    }
    food ??= matchFood(item.name, foods);
    if (!food) {
      unmatched.push(item.name);
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
    });
  }
  return { items: matched, unmatched };
}
