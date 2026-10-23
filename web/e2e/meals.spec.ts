import { admin, expect, expectAccessible, insertMeal, istDate, lunchtime, savedMeals, test } from "./support";

test.describe("Fixing items, recipes and meal detail", () => {
  test("FIX-H1 swap, rename, own numbers and a quick add are saved as shown", async ({ page, account }) => {
    const id = await insertMeal(account.id, { meal_type: "dinner", eaten_at: lunchtime(istDate(0)), status: "draft", ai_model: "test" }, [
      { food_id: "seed-phulka", name: "Phulka", quantity: 2, unit: "piece", grams: 70, kcal: 208, protein_g: 6.9, carb_g: 38.5, fat_g: 2.6, fiber_g: 6.3, source: "ai", ai_confidence: "high" },
      { food_id: null, name: "Mystery curry", quantity: 1, unit: "katori", grams: 150, kcal: 200, protein_g: 5, carb_g: 10, fat_g: 15, fiber_g: 2, source: "ai", ai_confidence: "low" },
    ]);
    await page.goto(`/log/review/${id}`);
    await page.getByRole("button", { name: "Fix Mystery curry" }).click();
    const fix = page.getByRole("dialog", { name: "Fix Mystery curry" });
    await fix.getByRole("combobox", { name: /Swap it/ }).fill("dal makhani");
    await fix.getByRole("option", { name: /^Dal makhani \d/ }).click();
    await expect(fix.getByLabel("Calories", { exact: true })).toHaveValue("240");
    await expectAccessible(page);
    await fix.getByRole("button", { name: "Apply" }).click();

    await page.getByRole("button", { name: "Fix Phulka" }).click();
    const fix2 = page.getByRole("dialog", { name: "Fix Phulka" });
    await fix2.getByLabel("Name", { exact: true }).fill("Tawa roti");
    await fix2.getByLabel("Calories", { exact: true }).fill("150");
    await fix2.getByRole("button", { name: "Apply" }).click();

    await page.getByRole("button", { name: "Add a food" }).click();
    const add = page.getByRole("dialog", { name: "Add a food" });
    await add.locator("label", { hasText: "Quick add" }).click();
    await add.getByLabel("What was it? (optional)").fill("Mango pickle");
    await add.getByLabel("Calories", { exact: true }).fill("30");
    await add.getByRole("button", { name: "Add to meal" }).click();
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);

    const items = [...(await savedMeals(account.id))[0].meal_items].sort((a, b) => a.position - b.position);
    expect(items.map((i) => `${i.name}:${Math.round(Number(i.kcal))}:${i.source}`)).toEqual(["Tawa roti:150:user", "Dal makhani:240:db", "Mango pickle:30:user"]);
  });

  test("REC-H1 a recipe built from Add food logs as one food and is one tap next time", async ({ page, account }) => {
    await page.goto("/log/search?mode=search&meal=dinner");
    await page.getByRole("link", { name: "Cook it often? Save it as a recipe" }).click();
    await expect(page).toHaveURL(/\/recipes\/new/);
    await page.getByLabel("Recipe name").fill("Test dal");
    await page.getByLabel("It makes").fill("4");
    for (const [q, option] of [["toor", /Toor dal \(raw\)/], ["onion", /^Onion \d/], ["tomato", /^Tomato \d/], ["cooking oil", /^Cooking oil/]] as const) {
      await page.getByRole("combobox", { name: "Add an ingredient" }).fill(q);
      await page.getByRole("option", { name: option }).click();
    }
    await page.getByLabel("Cooked weight (optional)").fill("900");
    // 653.8 kcal in 900 g cooked (IFCT 2017 dal and onion) = 72.6 per 100 g; a 225 g serving is 163 kcal, preview and meal alike
    await expect(page.locator("#serving-heading").locator("..")).toContainText("163 kcal");
    await expectAccessible(page);
    await page.getByRole("button", { name: "Save and add to meal" }).click();
    await expect(page).toHaveURL(/\/log\/search\?.*items=/);
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    const [item] = (await savedMeals(account.id))[0].meal_items;
    expect([item.name, Math.round(Number(item.kcal))]).toEqual(["Test dal", 163]);

    await page.goto("/log/search?mode=search");
    await page.getByRole("group", { name: "Your recipes" }).getByRole("button", { name: "+ 1 katori Test dal" }).click();
    await expect(page.getByText("Test dal", { exact: true })).toBeVisible();
  });

  test("REC-N1 an ingredient a recipe uses can't be deleted; the message names the recipe", async ({ page, account, expectedConsole }) => {
    expectedConsole.push(/status of 409/);
    await page.goto("/profile/foods");
    const food = await (await page.request.post("/api/foods", { data: { name: "Test hing mix", unit: "tbsp", gramsPerUnit: 15, perServing: { kcal: 10, proteinG: 0, carbG: 2, fatG: 0, fiberG: 0 } } })).json();
    const recipe = await page.request.post("/api/recipes", {
      data: { name: "Test sambar", servings: 4, servingUnit: "katori", ingredients: [{ foodId: food.id, quantity: 1, unit: "tbsp" }, { foodId: "seed-raw-toor-dal", quantity: 1, unit: "katori" }] },
    });
    expect(recipe.status()).toBe(201);
    await page.reload();
    await page.getByRole("button", { name: "Delete Test hing mix" }).click();
    await page.getByRole("dialog", { name: "Delete Test hing mix?" }).getByRole("button", { name: "Delete food" }).click();
    await expect(page.getByText(/ingredient of your recipe “Test sambar”/)).toBeVisible();
    await expect(page.getByText("Test hing mix", { exact: true })).toBeVisible();
    expect(account.id).toBeTruthy();
  });

  test("S08-H1 meal detail shows nutrients; Edit → Delete removes it from Today", async ({ page, account }) => {
    const id = await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(0)), health_score: 7 });
    await page.goto("/");
    await page.locator(`a[href="/meals/${id}"]`).first().click(); // each food on Today opens its meal
    await expect(page).toHaveURL(new RegExp(`/meals/${id}`));
    await expect(page.getByRole("heading", { name: "Nutrients" })).toBeVisible();
    await expect(page.getByRole("row", { name: /Iron/ })).toContainText("4.5 mg");
    await expectAccessible(page);
    await page.getByRole("link", { name: "Edit meal" }).click();
    await page.getByRole("button", { name: "Delete meal" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await savedMeals(account.id)).toHaveLength(0);
    await expect(page.getByRole("img", { name: /^0 of / })).toBeVisible();
  });

  test("S08-E1 Undo right after saving removes the meal", async ({ page, account }) => {
    await page.goto("/log/search?mode=search&meal=snack");
    await page.getByRole("combobox", { name: "Or search the food list" }).fill("banana");
    await page.getByRole("option", { name: /^Banana \d/ }).click();
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page.getByText(/Snack saved · /)).toBeVisible();
    await page.getByRole("button", { name: "Undo" }).click();
    await expect(page.getByText(/Snack saved · /)).toBeHidden();
    await expect.poll(async () => (await savedMeals(account.id)).length).toBe(0);
  });

  test("S08-N1 a deleted meal's address shows a clear not-found page", async ({ page, account, expectedConsole }) => {
    expectedConsole.push(/status of 404/);
    const id = await insertMeal(account.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(0)) });
    await admin.from("meals").delete().eq("id", id);
    const res = await page.goto(`/meals/${id}`);
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "We couldn't find that" })).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("link", { name: "Back to today" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
