import { describe, expect, it } from "vitest";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { parseNotice } from "./parse-notice";

const food = (id: string) => SEED_FOODS.find((f) => f.id === id)!;

describe("parseNotice", () => {
  it("reads as before when AI reading is off", () => {
    expect(parseNotice({ items: [{ food: food("seed-phulka"), quantity: 2, unit: "piece" }], unmatched: ["thai curry"], ai: null })).toBe(
      "Added 1 food. Couldn't find: thai curry. Try searching for it below.",
    );
    expect(parseNotice({ items: [], unmatched: [], ai: null })).toBe("Couldn't find any foods in that. Try searching below.");
  });

  it("names what the AI matched, so the person can check it", () => {
    const notice = parseNotice({
      items: [
        { food: food("seed-phulka"), quantity: 2, unit: "piece" },
        { food: food("seed-palak-paneer"), quantity: 1, unit: "katori", ai: { confidence: "high", portionEstimated: false, heard: "green paneer dish" } },
        { food: food("seed-curd"), quantity: 180, unit: "g", ai: { confidence: "medium", portionEstimated: true, heard: "raita" } },
      ],
      unmatched: [],
      ai: { used: true, demo: false, question: "How big was the bowl of raita?", note: null },
    });
    expect(notice).toBe(
      "Added 3 foods. AI read “green paneer dish” as Palak paneer, “raita” as Curd (180 g, weight guessed). Calories and macros come from the food list; check the portions. How big was the bowl of raita?",
    );
  });

  it("says when no AI ran, and passes on limits", () => {
    expect(
      parseNotice({
        items: [{ food: food("seed-curd"), quantity: 1, unit: "katori", ai: { confidence: "low", portionEstimated: false, heard: "dahi" } }],
        unmatched: [],
        ai: { used: true, demo: true, question: null, note: null },
      }),
    ).toContain("The demo reader (no AI ran) read “dahi” as Curd.");
    expect(parseNotice({ items: [], unmatched: ["sushi"], ai: { used: false, demo: false, question: null, note: "AI reading is resting for today." } })).toBe(
      "Couldn't find: sushi. Try searching for it below. AI reading is resting for today.",
    );
  });
});
