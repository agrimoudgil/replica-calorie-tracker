import type { Food, Nutrients, Unit } from "@/lib/nutrition/types";

/** A food the food list doesn't have, with the AI's checked numbers for the portion. */
export type ParsedEstimate = { name: string; quantity: number; unit: Unit; grams: number; nutrients: Nutrients; confidence: "high" | "medium" | "low" };

/** What /api/foods/parse sends back. `ai` is null when AI reading is off. */
export type ParseReply = {
  items: Array<{
    food: Food;
    quantity: number;
    unit: Unit;
    ai?: { confidence: "high" | "medium" | "low"; portionEstimated: boolean; heard: string; aiKcal?: number | null };
  }>;
  /** Missing from older servers. */
  estimates?: ParsedEstimate[];
  unmatched: string[];
  ai: { used: boolean; demo: boolean; question: string | null; note: string | null } | null;
};

/**
 * One status line after "Find foods": what was added, what the AI matched (so it can be
 * checked), what it estimated because the food list doesn't have it, and what's missing.
 * `kcalOf` gives the food list's calories for a matched item, to flag a match the AI
 * expected to be very different (more than double or less than half).
 */
export function parseNotice({ items, estimates = [], unmatched, ai }: ParseReply, kcalOf?: (item: ParseReply["items"][number]) => number): string {
  const parts: string[] = [];
  const count = items.length + estimates.length;
  if (count) parts.push(`Added ${count} ${count === 1 ? "food" : "foods"}.`);
  const who = ai?.demo ? "The demo reader (no AI ran)" : "AI";
  const read = items.filter((i) => i.ai);
  if (read.length) {
    const pairs = read.map((i) => `“${i.ai!.heard}” as ${i.food.name}${i.ai!.portionEstimated ? ` (${i.quantity} g, weight guessed)` : ""}`);
    parts.push(`${who} read ${pairs.join(", ")}. Calories and macros come from the food list; check the portions.`);
  }
  if (estimates.length) {
    const list = estimates.map((e) => `${e.name} (about ${Math.round(e.nutrients.kcal)} kcal)`);
    parts.push(`Not in the food list, so ${who === "AI" ? "these are AI estimates" : "these are sample numbers"}: ${list.join(", ")}. Check them; you can change the portion.`);
  }
  if (kcalOf) {
    const far = read.filter((i) => {
      const expected = i.ai!.aiKcal ?? 0;
      const listed = kcalOf(i);
      return expected >= 30 && listed >= 30 && (listed > expected * 2 || listed < expected / 2);
    });
    if (far.length) parts.push(`Check ${far.map((i) => i.food.name).join(", ")}: the AI expected about ${far.map((i) => Math.round(i.ai!.aiKcal!)).join(", ")} kcal.`);
  }
  if (ai?.question) parts.push(ai.question);
  if (unmatched.length) parts.push(`Couldn't find: ${unmatched.join(", ")}. Try searching for ${unmatched.length === 1 ? "it" : "them"} below.`);
  if (ai?.note) parts.push(ai.note);
  return parts.join(" ") || "Couldn't find any foods in that. Try searching below.";
}
