import { createHash } from "node:crypto";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { Unit } from "@/lib/nutrition/types";
import type { Box } from "@/lib/photo-boxes";
import type { EstimatedItem, MealEstimator, MealReader, ReadItem } from "./types";

/*
 * Development estimator: no AI call, no cost. It cannot see the photo, so it picks
 * one of a few sample plates from the photo's hash (same photo, same answer).
 * Results are marked demo so the review screen says they are not real; the boxes are
 * sample spots too (left, top right, bottom right), not where anything really is.
 */
type Pick = [foodId: string, quantity: number, unit: Unit, confidence: EstimatedItem["confidence"]];

const PLATES: Pick[][] = [
  [["seed-phulka", 2, "piece", "high"], ["seed-dal-tadka", 1, "katori", "medium"], ["seed-mixed-sabzi", 1, "katori", "low"]],
  [["seed-poha", 1.5, "katori", "high"], ["seed-chai", 1, "glass", "medium"]],
  [["seed-rice", 1, "katori", "high"], ["seed-rajma", 1, "katori", "high"], ["seed-salad", 0.5, "katori", "medium"]],
  [["seed-idli", 3, "piece", "high"], ["seed-sambar", 1, "katori", "medium"], ["seed-coconut-chutney", 2, "tbsp", "medium"]],
];

const SPOTS: Box[] = [
  { x: 0.08, y: 0.2, w: 0.38, h: 0.6 },
  { x: 0.55, y: 0.1, w: 0.36, h: 0.38 },
  { x: 0.55, y: 0.55, w: 0.36, h: 0.36 },
];

export function createFakeEstimator(): MealEstimator {
  return {
    async fromPhoto(photo) {
      const digest = createHash("sha256").update(photo.bytes).digest();
      const plate = PLATES[digest[0] % PLATES.length];
      const items = plate.map(([foodId, quantity, unit, confidence], i) => {
        const food = SEED_FOODS.find((f) => f.id === foodId)!;
        const grams = gramsFor(food, unit, quantity);
        return {
          foodId,
          name: food.name,
          nameHi: food.nameHi,
          quantity,
          unit,
          grams,
          nutrients: nutrientsForGrams(food, grams),
          confidence,
          box: SPOTS[i],
        };
      });
      return { isFood: true, items, model: "demo", demo: true, usage: { inputTokens: 0, outputTokens: 0 } };
    },
  };
}

/*
 * Development reader: no AI call, no cost. It can't understand anything; it splits the
 * text on commas and "and", takes a leading number as the amount, and passes the rest on
 * as the food's name, so the matching and review steps can be tried. Marked demo.
 */
export function createFakeReader(): MealReader {
  return {
    async fromText(text) {
      const items: ReadItem[] = text
        .split(/\s*(?:,|\band\b|\baur\b)\s*/i)
        .map((part) => part.trim())
        .filter(Boolean)
        .slice(0, 12)
        .map((part) => {
          const m = part.match(/^(\d+(?:\.\d+)?)\s+(.*)$/);
          const name = (m ? m[2] : part).trim();
          return { name, searchName: name, quantity: m ? Number(m[1]) : 1, unit: "katori", grams: 150, confidence: "low" };
        });
      return { items, question: null, model: "demo", demo: true, usage: { inputTokens: 0, outputTokens: 0 } };
    },
  };
}
