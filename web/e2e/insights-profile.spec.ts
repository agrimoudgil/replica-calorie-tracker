import fs from "node:fs";
import { admin, DAL, expect, expectAccessible, insertMeal, istDate, lunchtime, PHULKA, test } from "./support";

test.describe("F05 review the week", () => {
  test("F05-E1 under 3 days of data: says more insights come later", async ({ page, account }) => {
    await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(-1)) });
    await page.goto("/insights");
    await expect(page.getByText("More insights after 3 days")).toBeVisible();
    await expectAccessible(page);
  });

  test("F05-H1 a full week: chart, gaps or wins, averages and next-meal ideas", async ({ page, account }) => {
    for (let d = 1; d <= 7; d++) {
      await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(-d)) }, [PHULKA, DAL]);
      await insertMeal(account.id, { meal_type: "dinner", eaten_at: `${istDate(-d)}T15:00:00.000Z` }, [PHULKA]);
    }
    await page.goto("/insights");
    await expect(page.getByRole("heading", { name: "This week" })).toBeVisible();
    await expect(page.getByText("Calories per day").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daily average vs target" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^(Watch out for|Going well)$/ }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Ideas for / })).toBeVisible();
    await expectAccessible(page);
  });

  test("F05-H2 Add this puts the idea's foods into Add food", async ({ page, account }) => {
    await page.goto("/insights");
    const add = page.getByRole("link", { name: /^Add .+ to / }).first();
    await add.click();
    await expect(page).toHaveURL(/\/log\/search\?.*items=/);
    await expect(page.getByRole("button", { name: /^Remove / }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Save meal" })).toBeEnabled();
    expect(account.id).toBeTruthy();
  });

  test("F05-P1 the coach chat is clearly marked as coming later", async ({ page, account }) => {
    await page.goto("/coach");
    await expect(page.getByText(/A chat for meal ideas/)).toBeVisible();
    await expectAccessible(page);
    expect(account.id).toBeTruthy();
  });
});

test.describe("Profile, history and placeholders", () => {
  test("S13-H1 both CSV files download and match the database", async ({ page, account }) => {
    await insertMeal(account.id, { meal_type: "lunch", eaten_at: "2026-10-15T07:30:00.000Z", health_score: 8 });
    await page.goto("/profile");
    const grab = async (name: string) => {
      const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: new RegExp(`^${name}`) }).click()]);
      return { file: download.suggestedFilename(), rows: fs.readFileSync((await download.path())!, "utf8").replace(/^﻿/, "").split("\r\n").filter(Boolean) };
    };
    const meals = await grab("Every food you logged");
    expect(meals.file).toMatch(/^meals-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(meals.rows.slice(1)).toEqual([
      "2026-10-15,13:00,Lunch,Phulka,फुलका,2,piece,70,207.9,6.9,38.5,2.6,6.3,1.1,0.4,280,21,2.2,Food list,8",
      "2026-10-15,13:00,Lunch,Dal tadka,दाल तड़का,1,katori,150,180,9,22.5,6,4.5,1.5,2.3,525,37.5,2.3,Food list,8",
    ]);
    const days = await grab("Daily totals");
    expect(days.rows.slice(1)).toEqual(["2026-10-15,1,2,387.9,15.9,61,8.6,10.8,2.6,2.7,805,58.5,4.5"]);
  });

  test("S13-H2 Light / Dark / Auto applies at once and survives a reload", async ({ page, account }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/profile");
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await bg()).toBe("rgb(15, 17, 21)");
    await page.getByRole("group", { name: "Appearance" }).locator("label", { hasText: "Light" }).click();
    expect(await bg()).toBe("rgb(255, 255, 255)");
    await page.reload();
    expect(await bg()).toBe("rgb(255, 255, 255)");
    await page.getByRole("group", { name: "Appearance" }).locator("label", { hasText: "Auto" }).click();
    expect(await bg()).toBe("rgb(15, 17, 21)");
    expect(account.id).toBeTruthy();
  });

  test("S13-H3 deleting the account removes the user and signs out", async ({ page, account }) => {
    await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(0)) });
    await page.goto("/profile");
    await page.getByRole("button", { name: "Delete account" }).click();
    const sheet = page.getByRole("dialog", { name: "Delete your account?" });
    await expect(sheet.getByRole("button", { name: "Delete everything" })).toBeDisabled();
    await sheet.getByLabel("I understand that everything will be deleted for good.").check();
    await sheet.getByRole("button", { name: "Delete everything" }).click();
    await expect(page).not.toHaveURL(/\/profile/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
    const { data } = await admin.auth.admin.getUserById(account.id);
    expect(data.user).toBeNull();
    const { count } = await admin.from("meals").select("id", { count: "exact", head: true }).eq("user_id", account.id);
    expect(count).toBe(0);
  });

  test("S02-H1 past days: the previous-day arrow, and a future date falls back to today", async ({ page, account }) => {
    await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(-1)) });
    await page.goto("/");
    await page.getByRole("link", { name: /^Previous day/ }).click();
    await expect(page).toHaveURL(new RegExp(`date=${istDate(-1)}`));
    await expect(page.getByRole("img", { name: /^388 of .* under$/ })).toBeVisible();
    await page.goto("/?date=2999-01-01");
    await expect(page.getByRole("img", { name: /left$/ })).toBeVisible();
    await expectAccessible(page);
  });

  test("F06-P1 gallery auto-log and Progress are clearly marked as coming later", async ({ page, account }) => {
    await page.goto("/profile/auto-snap");
    await expect(page.getByText(/needs the phone app/)).toBeVisible();
    await expectAccessible(page);
    await page.goto("/progress");
    await expect(page.getByText(/Weigh-ins and your weight trend/)).toBeVisible();
    await expectAccessible(page);
    expect(account.id).toBeTruthy();
  });
});
