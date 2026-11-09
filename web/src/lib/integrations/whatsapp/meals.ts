import { z } from "zod";
import { mealScore, quickAddItem } from "@/lib/data/meal-math";
import type { MealItem } from "@/lib/data/types";
import { MAX_ITEM_GRAMS, nutrientsForGrams } from "@/lib/nutrition/portions";
import { MEAL_TYPES, UNITS, type Food, type MealType } from "@/lib/nutrition/types";

/*
 * What the WhatsApp tracker sends for each saved meal, and how it becomes a web meal. Nutrients are
 * never taken from the request: a food-list item is recomputed here from Oswald's own catalogue at the
 * grams WhatsApp counted; anything else (a packaged label, an older WhatsApp food) is a quick add.
 */
const name = z.string().trim().min(1).max(120);
const grams = z.number().positive().max(MAX_ITEM_GRAMS);
const kcal = z.number().min(0).max(5000);
const foodItem = z.strictObject({ name, foodId: z.string().regex(/^seed-[a-z0-9-]{1,80}$/), grams,
  quantity: z.number().positive().max(MAX_ITEM_GRAMS), unit: z.enum(UNITS), kcal: kcal.optional() });
const plainItem = z.strictObject({ name, kcal, grams: grams.optional() });

export const whatsappMealSchema = z.strictObject({
  mealType: z.enum(MEAL_TYPES),
  eatenAt: z.iso.datetime({ offset: true }).nullable(),
  localDate: z.iso.date(),
  timezone: z.string().min(1).max(64),
  rawText: z.string().max(1000),
  items: z.array(z.union([foodItem, plainItem])).min(1).max(12),
});
export type WhatsAppMeal = z.infer<typeof whatsappMealSchema>;

const externalId = z.uuid();
export const mealOpSchema = z.discriminatedUnion("op", [
  z.strictObject({ op: z.literal("upsert"), externalId, version: z.iso.datetime({ offset: true }), meal: whatsappMealSchema }),
  z.strictObject({ op: z.literal("delete"), externalId }),
  z.strictObject({ op: z.literal("delete_all") }),
]);
export const mealsBodySchema = z.strictObject({ linkRef: z.uuid(), ops: z.array(mealOpSchema).max(20) });
export const linkBodySchema = z.strictObject({ code: z.string().min(1).max(30), linkRef: z.uuid() });
export const unlinkBodySchema = z.strictObject({ linkRef: z.uuid() });

export type NewItem = Omit<MealItem, "id" | "position">;

/** Each WhatsApp item as a web meal item, using only Oswald's own food numbers. */
export function buildItems(items: WhatsAppMeal["items"], foods: ReadonlyMap<string, Food>): NewItem[] {
  return items.map((item) => {
    const food = "foodId" in item ? foods.get(item.foodId) : undefined;
    if ("foodId" in item && food) {
      return { foodId: food.id, name: item.name, quantity: item.quantity, unit: item.unit, grams: item.grams,
        nutrients: nutrientsForGrams(food, item.grams), source: "db" };
    }
    // A food the list no longer has, or one WhatsApp counts on its own: its calories only.
    return quickAddItem({ name: item.name, kcal: item.kcal ?? 0 });
  });
}

const USUAL_TIME: Record<MealType, string> = { breakfast: "08:30", lunch: "13:00", snack: "17:00", dinner: "20:30" };

/** Minutes the zone is ahead of UTC at this instant (India: 330). */
function zoneOffsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return (Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - at.getTime()) / 60000;
}

/**
 * When the meal was eaten: WhatsApp's time when it has one, otherwise the usual time for that meal
 * on its date in WhatsApp's time zone ("yesterday breakfast" has a date but no time).
 */
export function eatenAtFor(meal: Pick<WhatsAppMeal, "eatenAt" | "localDate" | "mealType" | "timezone">): string {
  if (meal.eatenAt) return new Date(meal.eatenAt).toISOString();
  let zone = meal.timezone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
  } catch {
    zone = "Asia/Kolkata";
  }
  const wall = new Date(`${meal.localDate}T${USUAL_TIME[meal.mealType]}:00Z`);
  return new Date(wall.getTime() - zoneOffsetMinutes(wall, zone) * 60000).toISOString();
}

/** The rows the database function inserts, in the meal_items column names. */
export function rpcItems(items: NewItem[]) {
  return items.map((i) => ({
    food_id: i.foodId, name: i.name, quantity: i.quantity, unit: i.unit, grams: i.grams,
    kcal: i.nutrients.kcal, protein_g: i.nutrients.proteinG, carb_g: i.nutrients.carbG, fat_g: i.nutrients.fatG,
    fiber_g: i.nutrients.fiberG, sugar_g: i.nutrients.sugarG ?? null, sat_fat_g: i.nutrients.satFatG ?? null,
    sodium_mg: i.nutrients.sodiumMg ?? null, calcium_mg: i.nutrients.calciumMg ?? null, iron_mg: i.nutrients.ironMg ?? null,
    source: i.source,
  }));
}

export function rpcMeal(meal: WhatsAppMeal, items: NewItem[]) {
  return { meal_type: meal.mealType, eaten_at: eatenAtFor(meal), raw_text: meal.rawText || null, health_score: mealScore(items) };
}
