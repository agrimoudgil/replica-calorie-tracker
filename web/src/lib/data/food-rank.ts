import { normalizeFoodName } from "@/lib/nutrition/foods";
import type { Food } from "@/lib/nutrition/types";

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
