import type { Food, Unit } from "@/lib/nutrition/types";

/** What /api/foods/parse sends back. `ai` is null when AI reading is off. */
export type ParseReply = {
  items: Array<{ food: Food; quantity: number; unit: Unit; ai?: { confidence: "high" | "medium" | "low"; portionEstimated: boolean; heard: string } }>;
  unmatched: string[];
  ai: { used: boolean; demo: boolean; question: string | null; note: string | null } | null;
};

/** One status line after "Find foods": what was added, what the AI matched (so it can be checked), and what's missing. */
export function parseNotice({ items, unmatched, ai }: ParseReply): string {
  const parts: string[] = [];
  if (items.length) parts.push(`Added ${items.length} ${items.length === 1 ? "food" : "foods"}.`);
  const read = items.filter((i) => i.ai);
  if (read.length) {
    const pairs = read.map((i) => `“${i.ai!.heard}” as ${i.food.name}${i.ai!.portionEstimated ? ` (${i.quantity} g, weight guessed)` : ""}`);
    parts.push(`${ai?.demo ? "The demo reader (no AI ran)" : "AI"} read ${pairs.join(", ")}. Calories and macros come from the food list; check the portions.`);
  }
  if (ai?.question) parts.push(ai.question);
  if (unmatched.length) parts.push(`Couldn't find: ${unmatched.join(", ")}. Try searching for ${unmatched.length === 1 ? "it" : "them"} below.`);
  if (ai?.note) parts.push(ai.note);
  return parts.join(" ") || "Couldn't find any foods in that. Try searching below.";
}
