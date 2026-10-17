import { DAL, PHULKA, expect, expectAccessible, insertMeal, istDate, lunchtime, test } from "./support";

// Top-five #4: Today as a food diary (the test user's target is 1,760 kcal).
test.describe("S02 Today as a food diary", () => {
  test("S02-H2 each meal shows its foods and its share of the budget", async ({ page, account }) => {
    const lunch = await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(0)) }, [PHULKA, DAL]);
    await insertMeal(account.id, { meal_type: "dinner", eaten_at: `${istDate(0)}T14:30:00.000Z` }, [DAL, DAL, DAL]);
    await page.goto("/");

    const lunchSection = page.getByRole("region", { name: "Lunch" });
    await expect(lunchSection).toContainText("388 of 530 kcal");
    await expect(lunchSection.getByRole("link", { name: /Phulka.*2 piece.*208 kcal/ })).toBeVisible();
    await expect(lunchSection.getByRole("link", { name: /Dal tadka.*1 katori.*180 kcal/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Breakfast" })).toContainText("0 of 440 kcal");
    await expect(page.getByRole("region", { name: "Breakfast" })).toContainText("Nothing logged yet");
    await expect(page.getByRole("region", { name: "Dinner" })).toContainText("540 of 530 kcal"); // over: shown in warning colour
    await expectAccessible(page);

    await lunchSection.getByRole("link", { name: /Dal tadka/ }).click();
    await expect(page).toHaveURL(new RegExp(`/meals/${lunch}`));
    await page.goBack();
    await page.getByRole("link", { name: "Add to breakfast" }).click();
    await expect(page).toHaveURL(/\/log\/search\?mode=search&meal=breakfast/);
    await page.goto("/");
    await page.getByRole("link", { name: "Snap a meal" }).click();
    await expect(page).toHaveURL(/\/log\/photo\?meal=/);
  });

  test("S02-E1 on a past day, + adds to that day", async ({ page, account }) => {
    const yesterday = istDate(-1);
    await page.goto(`/?date=${yesterday}`);
    await expect(page.getByRole("link", { name: "Snap a meal" })).toHaveCount(0);
    await page.getByRole("link", { name: "Add to dinner" }).click();
    await expect(page).toHaveURL(new RegExp(`meal=dinner&date=${yesterday}`));
    expect(account.id).toBeTruthy();
  });
});
