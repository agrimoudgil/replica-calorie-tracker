import type { Page } from "@playwright/test";
import { admin, createAccount, deleteAccount, expect, expectAccessible, insertMeal, istDate, lunchtime, test } from "./support";

const card = (page: Page) => page.getByRole("region", { name: "Recovery check-in" });
const sheet = (page: Page) => page.getByRole("dialog", { name: "Today's check-in" });

async function checkIns(userId: string) {
  const { data, error } = await admin.from("checkins").select("local_date, sleep_hours, energy, soreness").eq("user_id", userId).order("local_date");
  if (error) throw error;
  return data.map((r) => [r.local_date, Number(r.sleep_hours), r.energy, r.soreness]);
}

/** Check-ins written straight to the database: `days` back from today, sleep, energy, soreness. */
async function seedCheckIns(userId: string, rows: Array<[number, number, number, number]>) {
  const { error } = await admin
    .from("checkins")
    .insert(rows.map(([days, sleep_hours, energy, soreness]) => ({ user_id: userId, local_date: istDate(-days), sleep_hours, energy, soreness })));
  if (error) throw error;
}

test.describe("REC recovery check-in", () => {
  test("REC-H1 check in from Today, see it next to the calories, edit it, remove it", async ({ page, account }) => {
    await page.goto("/");
    await expect(card(page).getByText(/How did you sleep/)).toBeVisible();
    await card(page).getByRole("button", { name: "Check in" }).click();
    await expect(sheet(page)).toBeVisible();
    await expectAccessible(page);

    // Nothing filled in: it says what's missing.
    await sheet(page).getByRole("button", { name: "Save check-in" }).click();
    await expect(sheet(page).getByText("Enter the hours you slept, from 0 to 16.")).toBeVisible();
    await expect(sheet(page).getByRole("alert")).toHaveText("Choose your energy.");

    await sheet(page).getByLabel("Sleep last night").fill("7,5"); // a comma works too
    await sheet(page).getByRole("group", { name: "Energy today" }).getByText("Good", { exact: true }).click();
    await sheet(page).getByRole("group", { name: "Muscle soreness" }).getByText("Mild", { exact: true }).click();
    await sheet(page).getByRole("button", { name: "Save check-in" }).click();
    await expect(sheet(page)).toBeHidden();
    await expect(card(page).getByText("7.5 h")).toBeVisible();
    await expect(card(page).getByText("Good")).toBeVisible();
    await expect(card(page).getByText("Mild")).toBeVisible();
    expect(await checkIns(account.id)).toEqual([[istDate(), 7.5, 4, 2]]);

    // Keyboard: arrow keys move within a choice.
    await card(page).getByRole("button", { name: "Edit check-in" }).click();
    await expect(sheet(page).getByLabel("Sleep last night")).toHaveValue("7.5");
    await sheet(page).getByRole("radio", { name: "Good" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(sheet(page).getByRole("radio", { name: "Great" })).toBeChecked();
    await sheet(page).getByRole("button", { name: "Save check-in" }).click();
    await expect(sheet(page)).toBeHidden(); // the sheet sits inside the card, so wait for it to close
    await expect(card(page).getByText("Great")).toBeVisible();
    expect(await checkIns(account.id)).toEqual([[istDate(), 7.5, 5, 2]]);

    await card(page).getByRole("button", { name: "Edit check-in" }).click();
    await sheet(page).getByRole("button", { name: "Remove this check-in" }).click();
    await expect(card(page).getByRole("button", { name: "Check in" })).toBeVisible();
    expect(await checkIns(account.id)).toEqual([]);
  });

  test("REC-H2 the card shows what you ate the day before; a past day takes its own check-in", async ({ page, account }) => {
    const yesterday = istDate(-1);
    await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(yesterday) }); // phulka and dal: 388 kcal, 15.9 g protein
    await page.goto("/");
    await expect(card(page)).toContainText(/Yesterday you ate 388 of [\d,]+ kcal and 16 of \d+ g protein\./);

    await page.goto(`/?date=${yesterday}`);
    await card(page).getByRole("button", { name: "Check in" }).click();
    const past = page.getByRole("dialog", { name: "Check-in for this day" });
    await past.getByLabel("Sleep last night").fill("6");
    await past.getByRole("group", { name: "Energy today" }).getByText("Low", { exact: true }).click();
    await past.getByRole("group", { name: "Muscle soreness" }).getByText("Sore", { exact: true }).click();
    await past.getByRole("button", { name: "Save check-in" }).click();
    await expect(card(page).getByText("6 h")).toBeVisible();
    expect(await checkIns(account.id)).toEqual([[yesterday, 6, 2, 4]]);
  });

  test("REC-H3 Insights puts the week's check-ins next to calories, with a pattern once there are enough days", async ({ page, account }) => {
    await page.goto("/insights");
    await expect(page.getByRole("heading", { name: "Check in on Today" })).toBeVisible();

    await seedCheckIns(account.id, [[1, 8, 4, 2], [2, 7.5, 4, 1], [3, 7, 5, 2], [4, 6, 2, 3], [5, 5.5, 2, 4], [6, 6.5, 3, 3]]);
    await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(-1)) });
    await page.reload();
    const table = page.getByRole("table", { name: /Sleep, energy, soreness and calories/ });
    await expect(table.getByRole("row")).toHaveCount(8); // header and 7 days
    await expect(table.getByRole("row").filter({ hasText: "8 h" })).toContainText(/Good\s*Mild\s*388/);
    await expect(table.getByRole("row", { name: /^Today/ })).toContainText("–");
    await expect(page.getByText("Energy: 4.3 of 5 after nights of 7 hours or more (3 days), 2.3 after shorter nights (3 days).")).toBeVisible();
    await expectAccessible(page);
  });

  test("REC-E1 check-ins are private, for days that have started, and come out in the export", async ({ page, account }) => {
    // Someone else's check-in never shows.
    const other = await createAccount(true, "rec-other");
    try {
      await seedCheckIns(other.id, [[0, 3, 1, 5]]);
      await page.goto("/");
      await expect(card(page).getByRole("button", { name: "Check in" })).toBeVisible();
      await expect(card(page).getByText("3 h")).toHaveCount(0);
    } finally {
      await deleteAccount(other.id);
    }

    const put = (date: string, data: object) => page.request.put(`/api/checkins/${date}`, { data });
    expect((await put(istDate(1), { sleepHours: 7, energy: 3, soreness: 2 })).status()).toBe(400);
    expect((await put("2026-13-40", { sleepHours: 7, energy: 3, soreness: 2 })).status()).toBe(400);
    expect((await put(istDate(), { sleepHours: 7, energy: 9, soreness: 2 })).status()).toBe(400);
    expect((await put(istDate(), { sleepHours: 7, energy: 3, soreness: 2 })).status()).toBe(200);

    const csv = await (await page.request.get("/api/export?file=checkins")).text();
    expect(csv.split("\r\n").slice(0, 2)).toEqual(["﻿Date,Sleep (hours),Energy (1 to 5),Energy,Soreness (1 to 5),Soreness", `${istDate()},7,3,Okay,2,Mild`]);
    await page.goto("/profile");
    await expect(page.getByRole("link", { name: /Recovery check-ins/ })).toHaveAttribute("href", "/api/export?file=checkins");

    const signedOut = await page.context().browser()!.newContext();
    expect((await signedOut.request.put(`${new URL(page.url()).origin}/api/checkins/${istDate()}`, { data: { sleepHours: 7, energy: 3, soreness: 2 } })).status()).toBe(401);
    await signedOut.close();
    expect(account.id).toBeTruthy();
  });
});
