import type { Meal } from "@/lib/data/types";
import type { Food, Unit } from "@/lib/nutrition/types";

export type QuickFood = { food: Food; quantity: number; unit: Unit; count: number };

/**
 * The user's most-logged catalogue foods (most often first, then most recent), each
 * with the portion they usually have, so one tap adds "3 phulka" rather than "1 phulka".
 */
export function recentFoods(meals: readonly Meal[], foods: readonly Food[], limit = 8): QuickFood[] {
  const byId = new Map(foods.map((f) => [f.id, f]));
  const stats = new Map<string, { count: number; last: string; portions: Map<string, number> }>();
  for (const meal of meals) {
    for (const item of meal.items) {
      if (!item.foodId || !byId.has(item.foodId)) continue;
      const s = stats.get(item.foodId) ?? { count: 0, last: "", portions: new Map() };
      s.count++;
      if (meal.eatenAt > s.last) s.last = meal.eatenAt;
      const key = `${item.quantity}|${item.unit}`;
      s.portions.set(key, (s.portions.get(key) ?? 0) + 1);
      stats.set(item.foodId, s);
    }
  }
  return [...stats.entries()]
    .sort(([, a], [, b]) => b.count - a.count || b.last.localeCompare(a.last))
    .slice(0, limit)
    .map(([id, s]) => {
      const [usual] = [...s.portions.entries()].sort((a, b) => b[1] - a[1]);
      const [quantity, unit] = usual[0].split("|");
      return { food: byId.get(id)!, quantity: Number(quantity), unit: unit as Unit, count: s.count };
    });
}
