import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/csv";
import type { Meal, MealItem } from "@/lib/data/types";
import { sumKnownNutrients } from "@/lib/nutrition/portions";
import { DAY_HEADER, ITEM_HEADER, dailyTotalsCsv, mealItemsCsv } from "./meals-csv";

const item = (over: Partial<MealItem>): MealItem => ({
  id: crypto.randomUUID(),
  foodId: "seed-phulka",
  position: 0,
  name: "Phulka",
  nameHi: "फुलका",
  quantity: 2,
  unit: "piece",
  grams: 70,
  nutrients: { kcal: 207.9, proteinG: 6.86, carbG: 38.5, fatG: 2.59, fiberG: 6.3, sugarG: 1.05, satFatG: 0.42, sodiumMg: 280, calciumMg: 21, ironMg: 2.24 },
  source: "db",
  ...over,
});

const meal = (over: Partial<Meal>): Meal => ({
  id: crypto.randomUUID(),
  userId: "u1",
  status: "saved",
  mealType: "lunch",
  inputMethod: "search",
  eatenAt: "2026-10-16T07:30:00.000Z", // 13:00 in India
  localDate: "2026-10-16",
  photoPath: null,
  rawText: null,
  healthScore: 8,
  aiModel: null,
  items: [item({})],
  savedAt: "2026-10-16T07:31:00.000Z",
  createdAt: "2026-10-16T07:30:00.000Z",
  updatedAt: "2026-10-16T07:31:00.000Z",
  ...over,
});

const lines = (csv: string) => csv.replace(/^﻿/, "").split("\r\n").filter(Boolean);

describe("CSV", () => {
  it("quotes only what needs it and keeps formulas as text", () => {
    expect(csvCell("Dal tadka")).toBe("Dal tadka");
    expect(csvCell('Mom\'s "special", dal')).toBe('"Mom\'s ""special"", dal"');
    expect(csvCell("two\nlines")).toBe('"two\nlines"');
    expect(csvCell("=HYPERLINK(\"x\")")).toBe('"\'=HYPERLINK(""x"")"');
    expect(csvCell("+91 snack")).toBe("'+91 snack");
    expect(csvCell("@home")).toBe("'@home");
    expect(csvCell(12.5)).toBe("12.5");
    expect(csvCell(null)).toBe("");
    expect(csvCell(Number.NaN)).toBe("");
  });

  it("starts with a byte-order mark and ends lines with CRLF", () => {
    const csv = toCsv(["a", "b"], [[1, "x"]]);
    expect(csv.startsWith("﻿a,b\r\n1,x\r\n")).toBe(true);
  });
});

describe("meal export", () => {
  const dinner = meal({
    mealType: "dinner",
    eatenAt: "2026-10-16T20:00:00.000Z", // 01:30 on 17 October in India
    localDate: "2026-10-17",
    healthScore: null,
    items: [
      item({ name: "Mango pickle, homemade", nameHi: undefined, foodId: null, quantity: 1, grams: 100, nutrients: { kcal: 30, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 }, source: "user", position: 1 }),
      item({ name: "Dal makhani", nameHi: "दाल मखनी", quantity: 1, unit: "katori", grams: 150, nutrients: { kcal: 240, proteinG: 9, carbG: 22.5, fatG: 12.8, fiberG: 6, ironMg: 3 }, source: "ai", position: 0 }),
    ],
  });
  const lunch = meal({});

  it("writes one row per food, oldest first, in the person's time zone", () => {
    const rows = lines(mealItemsCsv([dinner, lunch], "Asia/Kolkata"));
    expect(rows[0]).toBe(ITEM_HEADER.join(","));
    expect(rows).toHaveLength(4);
    expect(rows[1]).toBe("2026-10-16,13:00,Lunch,Phulka,फुलका,2,piece,70,207.9,6.9,38.5,2.6,6.3,1.1,0.4,280,21,2.2,Food list,8");
    expect(rows[2]).toBe("2026-10-17,01:30,Dinner,Dal makhani,दाल मखनी,1,katori,150,240,9,22.5,12.8,6,,,,,3,AI estimate,");
    expect(rows[3]).toBe('2026-10-17,01:30,Dinner,"Mango pickle, homemade",,1,piece,100,30,0,0,0,0,,,,,,Your numbers,');
    // Same meal, another time zone: the time follows the person's zone, the day stays the stored one.
    expect(lines(mealItemsCsv([lunch], "America/New_York"))[1].startsWith("2026-10-16,03:30,Lunch")).toBe(true);
  });

  it("totals each day, leaving a mineral blank unless every food reports it", () => {
    const second = meal({ mealType: "snack", eatenAt: "2026-10-16T11:30:00.000Z", items: [item({ name: "Phulka", quantity: 1, grams: 35, nutrients: { kcal: 104, proteinG: 3.4, carbG: 19.3, fatG: 1.3, fiberG: 3.2, sugarG: 0.5, satFatG: 0.2, sodiumMg: 140, calciumMg: 10.5, ironMg: 1.1 } })] });
    const rows = lines(dailyTotalsCsv([dinner, second, lunch]));
    expect(rows[0]).toBe(DAY_HEADER.join(","));
    expect(rows[1]).toBe("2026-10-16,2,2,311.9,10.3,57.8,3.9,9.5,1.6,0.6,420,31.5,3.3");
    expect(rows[2]).toBe("2026-10-17,1,2,270,9,22.5,12.8,6,,,,,");
  });

  it("gives just the header when nothing is logged", () => {
    expect(lines(mealItemsCsv([], "Asia/Kolkata"))).toEqual([ITEM_HEADER.join(",")]);
    expect(lines(dailyTotalsCsv([]))).toEqual([DAY_HEADER.join(",")]);
  });

  it("sums known nutrients only", () => {
    expect(sumKnownNutrients([{ kcal: 1, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0, ironMg: 2 }, { kcal: 2, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 }])).toEqual({ kcal: 3, proteinG: 0, carbG: 0, fatG: 0, fiberG: 0 });
  });
});
