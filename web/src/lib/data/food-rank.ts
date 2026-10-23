import { normalizeFoodName } from "@/lib/nutrition/foods";
import type { Food } from "@/lib/nutrition/types";

/** The words of a search, normalised; "white rice" → ["white", "rice"]. */
export const searchWords = (query: string) => normalizeFoodName(query).split(/\s+/).filter(Boolean);

/**
 * World foods (USDA names like "Rice, white, long-grain, cooked"): every word must appear,
 * in any order. A name that starts with the first word comes first, then shorter names
 * (plain foods before long variations).
 */
export function rankWorldFoods(foods: readonly Food[], query: string, limit = 20): Food[] {
  const words = searchWords(query);
  if (!words.length) return [];
  const startsLater = (name: string) => (name.startsWith(words[0]) ? 0 : 1);
  return foods
    .map((food) => ({ food, name: normalizeFoodName(food.name) }))
    .filter(({ name }) => words.every((w) => name.includes(w)))
    .sort((a, b) => startsLater(a.name) - startsLater(b.name) || a.name.length - b.name.length || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map(({ food }) => food);
}

/**
 * Oswald's own foods first; world foods fill the rest, always with at least a few
 * places when there are any, so a common word ("rice") can't hide them all.
 */
export function mergeSearch(catalogue: Food[], world: Food[], limit: number): Food[] {
  const worldSlots = Math.min(world.length, Math.max(limit - catalogue.length, Math.min(4, limit)));
  return [...catalogue.slice(0, limit - worldSlots), ...world.slice(0, worldSlots)];
}

/** Exact name or alias first, then prefix matches, then anywhere; ties by name. */
export function rankFoods(foods: readonly Food[], query: string, limit = 20): Food[] {
  const q = normalizeFoodName(query);
  if (!q) return [];
  const ranked: Array<{ food: Food; rank: number }> = [];
  for (const food of foods) {
    const labels = [food.name, food.nameHi ?? "", ...food.aliases].map(normalizeFoodName);
    const rank = labels.some((l) => l === q) ? 0 : labels.some((l) => l.startsWith(q)) ? 1 : labels.some((l) => l.includes(q)) ? 2 : -1;
    if (rank >= 0) ranked.push({ food, rank });
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || a.food.name.localeCompare(b.food.name))
    .slice(0, limit)
    .map((r) => r.food);
}
