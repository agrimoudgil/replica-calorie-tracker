import { describe, expect, it } from "vitest";
import { SEED_FOODS } from "./foods";
import { parseMeal } from "./parse-meal";

const parse = (text: string) => {
  const r = parseMeal(text, SEED_FOODS);
  return { items: r.items.map((i) => [i.food.id.replace("seed-", ""), i.quantity, i.unit]), unmatched: r.unmatched };
};

describe("parseMeal", () => {
  it("reads numbers, units and commas/and", () => {
    expect(parse("2 roti, 1 katori dal and a bowl of curd")).toEqual({
      items: [["phulka", 2, "piece"], ["dal-tadka", 1, "katori"], ["curd", 1, "katori"]],
      unmatched: [],
    });
  });

  it("understands Hindi number words and 'aur'", () => {
    expect(parse("do roti aur ek katori dahi").items).toEqual([["phulka", 2, "piece"], ["curd", 1, "katori"]]);
    expect(parse("dedh plate poha").items).toEqual([["poha", 2.25, "katori"]]);
    expect(parse("aadha glass doodh").items).toEqual([["milk", 0.5, "glass"]]);
  });

  it("splits dishes written together and gives the amount to the first", () => {
    expect(parse("ek katori rajma chawal").items).toEqual([["rajma", 1, "katori"], ["rice", 1, "katori"]]);
    expect(parse("3 idli sambar").items).toEqual([["idli", 3, "piece"], ["sambar", 1, "katori"]]);
  });

  it("prefers the longest dish name", () => {
    expect(parse("masala dosa").items).toEqual([["masala-dosa", 1, "piece"]]);
    expect(parse("jeera rice").items).toEqual([["jeera-rice", 1, "katori"]]);
    expect(parse("dal makhani").items).toEqual([["dal-makhani", 1, "katori"]]);
    expect(parse("2 aloo parathas").items).toEqual([["aloo-paratha", 2, "piece"]]);
  });

  it("handles grams, cups, plurals and default units", () => {
    expect(parse("200g paneer bhurji").items).toEqual([["paneer-bhurji", 200, "g"]]);
    expect(parse("2 cups chai").items).toEqual([["chai", 2, "glass"]]);
    expect(parse("4 idlis").items).toEqual([["idli", 4, "piece"]]);
    expect(parse("banana").items).toEqual([["banana", 1, "piece"]]);
    expect(parse("1/2 katori rice").items).toEqual([["rice", 0.5, "katori"]]);
  });

  it("reports what it could not find instead of guessing", () => {
    expect(parse("2 roti, a bowl of thai green curry")).toEqual({ items: [["phulka", 2, "piece"]], unmatched: ["a bowl of thai green curry"] });
    expect(parse("a slice of pizza").items).toEqual([["pizza", 1, "piece"]]); // in the bigger catalogue now
    expect(parse("   ")).toEqual({ items: [], unmatched: [] });
  });

  it("caps the number of items", () => {
    expect(parseMeal(Array.from({ length: 20 }, () => "roti").join(", "), SEED_FOODS).items).toHaveLength(12);
  });
});
