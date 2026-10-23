import type { Page } from "@playwright/test";
import { admin, expect, expectAccessible, istDate, savedMeals, test } from "./support";

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
    await expect(page.getByRole("option", { name: /^Poha \d/ })).toBeVisible();
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
    await typeBox(page).fill("thai green curry");
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
    await addBySearch(page, "poha", /^Poha \d/);
    await page.getByRole("button", { name: "Save meal" }).dblclick();
    await expect(page).toHaveURL(/\?saved=/);
    expect(await savedMeals(account.id)).toHaveLength(1);
  });

  test("F03-E6 offline save keeps the foods; back online it saves once", async ({ page, context, account, expectedConsole }) => {
    expectedConsole.push(/ERR_INTERNET_DISCONNECTED/);
    await page.goto("/log/search?mode=search");
    await addBySearch(page, "poha", /^Poha \d/);
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
    await addBySearch(page, "poha", /^Poha \d/);
    const save = page.getByRole("button", { name: "Save meal" });
    await save.click();
    await expect(save).toBeDisabled();
    await expect(save).toHaveAttribute("aria-busy", "true");
    await expect(page).toHaveURL(/\?saved=/);
    expect(await savedMeals(account.id)).toHaveLength(1);
  });

  test("F03-E8 per-gram entry scales the calories by weight", async ({ page, account }) => {
    await page.goto("/log/search?mode=search");
    await addBySearch(page, "curd", /^Curd \d/);
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
    await addBySearch(page, "poha", /^Poha \d/);
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(new RegExp(`date=${yesterday}.*saved=`));
    expect((await savedMeals(account.id))[0].local_date).toBe(yesterday);
  });

  test("F03-H3 world foods: Indian foods come first, then USDA; a Big Mac logs by the piece", async ({ page, account }) => {
    await page.goto("/log/search?mode=search");
    await search(page).fill("rice");
    const options = page.getByRole("option");
    await expect(options.filter({ hasText: "USDA" }).first()).toBeVisible();
    await expect(options.first()).not.toContainText("USDA");

    await addBySearch(page, "big mac", /^McDONALD'S, BIG MAC \d.*USDA/);
    await expect(page.getByText("McDONALD'S, BIG MAC", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    const [item] = (await savedMeals(account.id))[0].meal_items;
    expect([item.food_id, item.name, Number(item.quantity), item.unit, Number(item.grams)]).toEqual(["usda-170720", "McDONALD'S, BIG MAC", 1, "piece", 219]);
    expect(Number(item.kcal)).toBeCloseTo(562.8, 0); // 257 kcal per 100 g
  });

  test("F03-H4 a barcode lookup fills in a food to check, save as your own, and log", async ({ page, account }) => {
    // Stubbed, so the test doesn't depend on Open Food Facts being up.
    await page.route("**/api/foods/barcode?code=3017620422003", (route) =>
      route.fulfill({
        json: {
          product: {
            code: "3017620422003",
            name: "Nutella",
            brand: "Ferrero",
            per100g: { kcal: 539, proteinG: 6.3, carbG: 57.5, fatG: 30.9, fiberG: 0, sugarG: 56.3 },
            servingGrams: 15,
            url: "https://world.openfoodfacts.org/product/3017620422003",
          },
        },
      }),
    );
    await page.goto("/log/search?mode=search");
    await page.getByRole("button", { name: "Packaged food? Look up its barcode" }).click();
    const sheet = page.getByRole("dialog", { name: "Look up a barcode" });
    await sheet.getByLabel("Barcode number").fill("123");
    await sheet.getByRole("button", { name: "Look it up" }).click();
    await expect(sheet.getByRole("alert")).toContainText("8 to 14 digits");
    await sheet.getByLabel("Barcode number").fill("3017620 422003");
    await sheet.getByRole("button", { name: "Look it up" }).click();
    await expect(sheet.getByRole("heading", { name: /Nutella/ })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Open Food Facts" })).toHaveAttribute("href", "https://world.openfoodfacts.org/product/3017620422003");
    await expectAccessible(page);
    await sheet.getByRole("button", { name: "Check and save as my food" }).click();

    const form = page.getByRole("dialog", { name: "Check and save as your food" });
    await expect(form.getByLabel("Food name")).toHaveValue("Nutella (Ferrero)");
    await expect(form.getByLabel("One serving is")).toHaveValue("piece");
    await expect(form.getByLabel("Weighs about")).toHaveValue("15");
    await form.getByRole("button", { name: "Save food" }).click();
    await expect(page.getByText("Nutella (Ferrero)", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    const [item] = (await savedMeals(account.id))[0].meal_items;
    // 539 kcal per 100 g x 15 g = 80.85, and calories are whole numbers on the form.
    expect([item.name, Number(item.quantity), item.unit, Number(item.grams), Number(item.kcal)]).toEqual(["Nutella (Ferrero)", 1, "piece", 15, 81]);
    const { data: own } = await admin.from("foods").select("owner_id, source").eq("id", item.food_id).single();
    expect(own).toEqual({ owner_id: account.id, source: "user" }); // private to them, never a shared copy
  });

  test("F03-E10 barcode lookups are for signed-in people with a real barcode; unknown ones point to creating the food", async ({ page, account, expectedConsole }) => {
    expectedConsole.push(/404/);
    expect((await page.request.get("/api/foods/barcode?code=abc")).status()).toBe(400);
    await page.route("**/api/foods/barcode?code=*", (route) =>
      route.fulfill({ status: 404, json: { error: "not_found", message: "No food with that barcode in Open Food Facts yet. You can create it as your own food." } }),
    );
    await page.goto("/log/search?mode=search");
    await page.getByRole("button", { name: "Packaged food? Look up its barcode" }).click();
    const sheet = page.getByRole("dialog", { name: "Look up a barcode" });
    await sheet.getByLabel("Barcode number").fill("00000000");
    await sheet.getByRole("button", { name: "Look it up" }).click();
    await expect(sheet.getByRole("alert")).toContainText("create it as your own food");
    expect(account.id).toBeTruthy();
  });
});
