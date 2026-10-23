import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { checkInSchema } from "@/lib/api/schemas";
import { createFileStore } from "@/lib/data/file-store";
import type { CheckIn, Meal, Rating } from "@/lib/data/types";
import { addDays } from "@/lib/dates";
import { checkInsCsv } from "@/lib/export/checkins-csv";
import { eatingByDay, recoveryPatterns, sleepText, type DayEating } from "./recovery";

const targets = { kcal: 2000, proteinG: 60 };
const start = "2026-10-01";
const check = (i: number, sleepHours: number, energy: Rating, soreness: Rating = 2): CheckIn => ({ date: addDays(start, i), sleepHours, energy, soreness, updatedAt: "" });
/** Eating on the day before check-in i. */
const ateBefore = (i: number, kcal: number, proteinG = 60): DayEating => ({ date: addDays(start, i - 1), logged: true, kcal, proteinG });

describe("recovery check-ins", () => {
  it("adds up each day's calories and protein from saved meals", () => {
    const meal = (localDate: string, kcal: number, proteinG: number) => ({ localDate, items: [{ nutrients: { kcal, proteinG } }] }) as unknown as Meal;
    expect(eatingByDay([meal("2026-10-02", 500, 20), meal("2026-10-01", 300, 10), meal("2026-10-02", 700, 25)])).toEqual([
      { date: "2026-10-01", logged: true, kcal: 300, proteinG: 10 },
      { date: "2026-10-02", logged: true, kcal: 1200, proteinG: 45 },
    ]);
  });

  it("shows no pattern without 3 days on each side", () => {
    const few = [check(0, 8, 4), check(1, 8, 4), check(2, 6, 2), check(3, 6, 2), check(4, 6, 2)];
    expect(recoveryPatterns(few, [], targets)).toEqual([]);
  });

  it("compares energy after longer and shorter nights, the same morning", () => {
    const days = [check(0, 8, 4), check(1, 7, 5), check(2, 7.5, 4), check(3, 6, 2), check(4, 5.5, 2), check(5, 6.5, 3)];
    expect(recoveryPatterns(days, [], targets)).toEqual([
      { id: "sleep-energy", text: "Energy: 4.3 of 5 after nights of 7 hours or more (3 days), 2.3 after shorter nights (3 days)." },
    ]);
  });

  it("pairs energy and soreness with what was eaten the day before, skipping days with nothing logged", () => {
    const days = [check(0, 7, 4, 1), check(1, 7, 4, 2), check(2, 7, 5, 1), check(3, 7, 2, 4), check(4, 7, 3, 4), check(5, 7, 2, 3), check(6, 7, 1, 5)];
    const eating = [ateBefore(0, 1900, 70), ateBefore(1, 1800, 65), ateBefore(2, 2100, 80), ateBefore(3, 1200, 30), ateBefore(4, 1400, 40), ateBefore(5, 1000, 20)];
    const patterns = recoveryPatterns(days, eating, targets); // day 6 has no eating the day before
    expect(patterns.map((p) => p.id)).toEqual(["kcal-energy", "protein-soreness"]);
    expect(patterns[0].text).toBe("Energy: 4.3 of 5 after days you ate at least 90% of your calorie target (3 days), 2.3 after days you ate less (3 days).");
    expect(patterns[1].text).toBe("Soreness: 1.3 of 5 after days you met your protein target (3 days), 3.7 after days below it (3 days).");
  });

  it("says when there's no real difference", () => {
    const days = [check(0, 8, 3), check(1, 8, 4), check(2, 8, 3), check(3, 6, 3), check(4, 6, 3), check(5, 6, 4)];
    expect(recoveryPatterns(days, [], targets)[0].text).toMatch(/^Energy was about the same either way: 3\.3 of 5/);
  });

  it("checks what people send: ratings 1 to 5, sleep 0 to 16 hours to a tenth", () => {
    expect(checkInSchema.parse({ sleepHours: 7.25, energy: 4, soreness: 1 })).toEqual({ sleepHours: 7.3, energy: 4, soreness: 1 });
    expect(checkInSchema.safeParse({ sleepHours: 17, energy: 4, soreness: 1 }).success).toBe(false);
    expect(checkInSchema.safeParse({ sleepHours: 7, energy: 0, soreness: 1 }).success).toBe(false);
    expect(checkInSchema.safeParse({ sleepHours: 7, energy: 3, soreness: 6 }).success).toBe(false);
    expect(checkInSchema.safeParse({ sleepHours: 7, energy: 2.5, soreness: 1 }).success).toBe(false);
    expect(checkInSchema.safeParse({ sleepHours: 7, energy: 3 }).success).toBe(false);
    expect(sleepText(7.5)).toBe("7.5 h");
    expect(sleepText(8)).toBe("8 h");
  });

  it("exports one row per check-in, oldest first, with numbers and words", () => {
    const csv = checkInsCsv([check(1, 6.5, 2, 4), check(0, 8, 5, 1)]);
    expect(csv.split("\r\n").slice(0, 3)).toEqual([
      "﻿Date,Sleep (hours),Energy (1 to 5),Energy,Soreness (1 to 5),Soreness",
      "2026-10-01,8,5,Great,1,None",
      "2026-10-02,6.5,2,Low,4,Sore",
    ]);
  });

  it("file store: saves, replaces, ranges, removes, keeps people apart and deletes with the account", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oswald-checkins-"));
    try {
      const store = createFileStore(dir);
      const [a, b] = [randomUUID(), randomUUID()];
      await store.saveCheckIn(a, "2026-10-01", { sleepHours: 6, energy: 2, soreness: 3 });
      await store.saveCheckIn(a, "2026-10-01", { sleepHours: 7.5, energy: 4, soreness: 2 });
      await store.saveCheckIn(a, "2026-10-03", { sleepHours: 8, energy: 5, soreness: 1 });
      expect(await store.getCheckIn(a, "2026-10-01")).toMatchObject({ date: "2026-10-01", sleepHours: 7.5, energy: 4, soreness: 2 });
      expect((await store.getCheckInsBetween(a, "2026-10-01", "2026-10-02")).map((c) => c.date)).toEqual(["2026-10-01"]);
      expect(await store.getCheckIn(b, "2026-10-01")).toBeNull();
      expect(await store.getCheckInsBetween(b, "2026-01-01", "2026-12-31")).toEqual([]);
      await store.deleteCheckIn(a, "2026-10-01");
      expect(await store.getCheckIn(a, "2026-10-01")).toBeNull();
      await store.deleteAccount(a);
      expect(await createFileStore(dir).getCheckInsBetween(a, "2026-01-01", "2026-12-31")).toEqual([]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
