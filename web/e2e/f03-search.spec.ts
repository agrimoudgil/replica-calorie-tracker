import type { Page } from "@playwright/test";
import { expect, expectAccessible, istDate, savedMeals, test } from "./support";

const typeBox = (page: Page) => page.getByLabel("Type what you ate");
const search = (page: Page) => page.getByRole("combobox", { name: "Or search the food list" });

async function addBySearch(page: Page, query: string, option: RegExp) {
  await search(page).fill(query);
  await page.getByRole("option", { name: option }).click();
}

test.describe("F03 log by typing or search", () => {
  test("F03-H1 typing a meal finds three foods; Today's total matches the database", async ({ page, account }) => {
    await page.goto("/log/search?mode=type&meal=lunch");
    await expectAccessible(page);
    await typeBox(page).fill("2 roti, 1 katori dal aur dahi");
    await page.getByRole("button", { name: "Find foods" }).click();
    await expect(page.getByText("Added 3 foods.")).toBeVisible();
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    const [meal] = await savedMeals(account.id);
    const items = [...meal.meal_items].sort((a, b) => a.position - b.position);
    expect(items.map((i) => [i.name, Number(i.quantity), i.unit])).toEqual([
      ["Phulka", 2, "piece"],
      ["Dal tadka", 1, "katori"],
      ["Curd", 1, "katori"],
    ]);
    const total = Math.round(items.reduce((s, i) => s + Number(i.kcal), 0));
    await expect(page.getByRole("img", { name: new RegExp(`^${total.toLocaleString("en-IN")} of `) })).toBeVisible();
  });

  test("F03-H2 keyboard only: search, pick and save", async ({ page, account }) => {
    await page.goto("/log/search?mode=search&meal=breakfast");
    await expect(search(page)).toBeFocused();
    await page.keyboard.type("poha");
    await expect(page.getByRole("option", { name: /^Poha/ })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Poha", { exact: true })).toBeVisible();
    // Tab until Save meal has focus: it must be reachable without a mouse.
    for (let i = 0; i < 80 && !(await page.getByRole("button", { name: "Save meal" }).evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(page.getByRole("button", { name: "Save meal" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\?saved=/);
    expect((await savedMeals(account.id))[0].meal_items.map((i) => i.name)).toEqual(["Poha"]);
  });

  test("F03-E1 Find foods with nothing typed explains what to do", async ({ page, account }) => {
    await page.goto("/log/search?mode=type");
    await page.getByRole("button", { name: "Find foods" }).click();
    await expect(page.getByText(/Type what you ate first/)).toBeVisible();
    expect(account.id).toBeTruthy();
  });

  test("F03-E2 a dish not in the database is named, not guessed", async ({ page, account }) => {
    await page.goto("/log/search?mode=type");
    await typeBox(page).fill("quinoa bowl");
    await page.getByRole("button", { name: "Find foods" }).click();
    await expect(page.getByText(/Couldn't find/)).toBeVisible();
    await expect(page.getByText("Nothing added yet")).toBeVisible();
    expect(account.id).toBeTruthy();
  });

  test("F03-E3 emoji and accents don't get in the way", async ({ page, account }) => {
    await page.goto("/log/search?mode=type");
    await typeBox(page).fill("2 roti 🙂, dāl");
    await page.getByRole("button", { name: "Find foods" }).click();
    await expect(page.getByText("Phulka", { exact: true })).toBeVisible();
    await expect(page.getByText("Dal tadka", { exact: true })).toBeVisible();
    expect(account.id).toBeTruthy();
  });

  test("F03-E4 very long input stops at 500 characters, without errors", async ({ page, account }) => {
    await page.goto("/log/search?mode=type");
    await typeBox(page).fill("roti ".repeat(140));
    expect((await typeBox(page).inputValue()).length).toBeLessThanOrEqual(500);
    await page.getByRole("button", { name: "Find foods" }).click();
    await expect(page.getByText(/Added \d+ food/)).toBeVisible();
    expect(account.id).toBeTruthy();
  });

  test("F03-E5 a double click on Save saves one meal", async ({ page, account }) => {
    await page.goto("/log/search?mode=search");
    await addBySearch(page, "poha", /^Poha/);
    await page.getByRole("button", { name: "Save meal" }).dblclick();
    await expect(page).toHaveURL(/\?saved=/);
    expect(await savedMeals(account.id)).toHaveLength(1);
  });

  test("F03-E6 offline save keeps the foods; back online it saves once", async ({ page, context, account, expectedConsole }) => {
    expectedConsole.push(/ERR_INTERNET_DISCONNECTED/);
    await page.goto("/log/search?mode=search");
    await addBySearch(page, "poha", /^Poha/);
    await context.setOffline(true);
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "offline" })).toBeVisible();
    await expect(page.getByText("Poha", { exact: true })).toBeVisible();
    await context.setOffline(false);
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    expect(await savedMeals(account.id)).toHaveLength(1);
  });

  test("F03-E7 on a slow network the Save button shows it's busy and can't be pressed again", async ({ page, account }) => {
    await page.route("**/api/meals", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.continue();
    });
    await page.goto("/log/search?mode=search");
    await addBySearch(page, "poha", /^Poha/);
    const save = page.getByRole("button", { name: "Save meal" });
    await save.click();
    await expect(save).toBeDisabled();
    await expect(save).toHaveAttribute("aria-busy", "true");
    await expect(page).toHaveURL(/\?saved=/);
    expect(await savedMeals(account.id)).toHaveLength(1);
  });

  test("F03-E8 per-gram entry scales the calories by weight", async ({ page, account }) => {
    await page.goto("/log/search?mode=search");
    await addBySearch(page, "curd", /^Curd/);
    const portion = page.getByRole("group", { name: "Portion of Curd" });
    await portion.getByLabel("Unit").selectOption("g");
    await portion.getByLabel("Quantity").fill("250");
    await expect(page.getByText("153 kcal").first()).toBeVisible(); // 61 kcal per 100 g
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    const [item] = (await savedMeals(account.id))[0].meal_items;
    expect([Number(item.grams), item.unit, Number(item.kcal)]).toEqual([250, "g", 152.5]);
  });

  test("F03-E9 adding to yesterday stores it on yesterday", async ({ page, account }) => {
    const yesterday = istDate(-1);
    await page.goto(`/?date=${yesterday}`);
    await page.getByRole("link", { name: /Add a meal to this day/ }).click();
    await expect(page).toHaveURL(new RegExp(`date=${yesterday}`));
    await addBySearch(page, "poha", /^Poha/);
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(new RegExp(`date=${yesterday}.*saved=`));
    expect((await savedMeals(account.id))[0].local_date).toBe(yesterday);
  });
});
