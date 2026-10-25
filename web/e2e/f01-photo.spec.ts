import { admin, expect, expectAccessible, jpeg, PHOTO_ON, pickPhoto, savedMeals, test } from "./support";

const DAILY_LIMIT = Number(process.env.DAILY_ESTIMATE_LIMIT || 15);

// Photo logging is off by default (no AI, no cost). Run these with PHOTO_LOGGING=on.
test.describe("F01 photo logging switched off", () => {
  test.skip(PHOTO_ON, "photo logging is on");

  test("F01-OFF no photo option anywhere; the photo screen and its API say it's off", async ({ page, account }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Take a photo" })).toHaveCount(0);
    await page.getByRole("button", { name: "Log a meal" }).click();
    await expect(page.getByRole("menuitem")).toHaveText(["Say it", "Type it", "Search foods"]);
    await page.keyboard.press("Escape");
    await page.getByRole("link", { name: "Type what you ate" }).click();
    await expect(page).toHaveURL(/\/log\/search\?mode=type&meal=/);

    await page.goto("/log");
    await expect(page.getByRole("link", { name: /Take a photo/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Type it/ })).toBeVisible();
    await page.goto("/profile");
    await expect(page.getByRole("link", { name: "Auto-log from gallery" })).toHaveCount(0);

    await page.goto("/log/photo?meal=lunch");
    await expect(page.getByText("Photo logging is off for now")).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("link", { name: "Type what you ate" }).click();
    await expect(page).toHaveURL(/\/log\/search\?mode=type&meal=lunch/);

    // The API refuses before reading the upload, so no estimate (and no AI) can run.
    const res = await page.request.post("/api/estimate/photo", { multipart: { mealId: crypto.randomUUID(), mealType: "lunch", eatenAt: new Date().toISOString() } });
    expect(res.status()).toBe(404);
    expect((await res.json()).error).toBe("off");
    const { count } = await admin.from("meals").select("id", { count: "exact", head: true }).eq("user_id", account.id);
    expect(count).toBe(0);
  });
});

test.describe("F01 log a meal by photo", () => {
  test.skip(!PHOTO_ON, "photo logging is off (PHOTO_LOGGING); F01-OFF covers that");

  test("F01-H1 + → Take a photo → review → Save: on Today, photo kept", async ({ page, account }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log a meal" }).click();
    await page.getByRole("menuitem", { name: "Take a photo" }).click();
    await expect(page).toHaveURL(/\/log\/photo/);
    await expectAccessible(page);
    await page.getByRole("group", { name: "Which meal?" }).locator("label", { hasText: "Lunch" }).click();
    await pickPhoto(page, await jpeg(page));
    await expect(page).toHaveURL(/\/log\/review\//);
    await expect(page.getByRole("heading", { name: "What we found" })).toBeVisible();
    await expect(page.getByText(/Demo estimate/)).toBeVisible();
    await expectAccessible(page);
    const shown = await page.locator("#summary-heading").locator("..").locator("span").first().innerText();
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    await expect(page.getByText(`Lunch saved · ${shown}`)).toBeVisible();
    const meals = await savedMeals(account.id);
    expect(meals).toHaveLength(1);
    expect(meals[0].meal_type).toBe("lunch");
    expect(meals[0].photo_path).toBeTruthy();
    await expectAccessible(page);
  });

  test("F01-H2 several foods: tap a number on the photo to leave one out or put it back", async ({ page, account }) => {
    await page.goto("/log/photo");
    await pickPhoto(page, await jpeg(page));
    await expect(page).toHaveURL(/\/log\/review\//);
    const markers = page.getByRole("group", { name: "Foods on the photo" }).getByRole("button");
    await expect(markers.first()).toBeVisible();
    const count = await markers.count();
    expect(count).toBeGreaterThan(1); // the demo plates have two or three foods
    const first = markers.first();
    const name = /^1\. Keep (.+)$/.exec((await first.getAttribute("aria-label")) ?? "")?.[1];
    expect(name).toBeTruthy();
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await expectAccessible(page);

    await first.click();
    await expect(first).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByRole("button", { name: `Fix ${name}` })).toHaveCount(0);
    await first.click();
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: `Fix ${name}` })).toBeVisible();

    // The markers survive a refresh in this tab; then keep only the first food.
    await page.reload();
    await expect(markers).toHaveCount(count);
    for (let i = 1; i < count; i++) await markers.nth(i).click();
    await expect(page.getByRole("button", { name: /^Fix / })).toHaveCount(1);
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    const meals = await savedMeals(account.id);
    expect(meals[0].meal_items.map((i) => i.name)).toEqual([name]);
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("rct-photo-boxes:")))).toEqual([]);
  });

  test("F01-E1 a file that isn't a photo is refused", async ({ page, account }) => {
    await page.goto("/log/photo");
    await pickPhoto(page, { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("not a photo") });
    await expect(page.getByRole("alert").filter({ hasText: "That file isn't a photo. Choose an image." })).toBeVisible();
    expect(await savedMeals(account.id)).toHaveLength(0);
  });

  test("F01-E2 a broken image is refused clearly", async ({ page, account }) => {
    expect(account.id).toBeTruthy();
    await page.goto("/log/photo");
    await pickPhoto(page, { name: "broken.jpg", mimeType: "image/jpeg", buffer: Buffer.from("this is not really a jpeg") });
    await expect(page.getByRole("alert").filter({ hasText: "This photo format isn't supported here" })).toBeVisible();
  });

  test("F01-E3 offline: says so and creates nothing", async ({ page, context, account, expectedConsole }) => {
    expectedConsole.push(/ERR_INTERNET_DISCONNECTED/);
    await page.goto("/log/photo");
    const photo = await jpeg(page);
    await context.setOffline(true);
    await pickPhoto(page, photo);
    await expect(page.getByRole("alert").filter({ hasText: "offline" })).toBeVisible();
    await context.setOffline(false);
    const { count } = await admin.from("meals").select("id", { count: "exact", head: true }).eq("user_id", account.id);
    expect(count).toBe(0);
  });

  test("F01-E4 a double click on Save saves one meal", async ({ page, account }) => {
    await page.goto("/log/photo");
    await pickPhoto(page, await jpeg(page));
    await expect(page).toHaveURL(/\/log\/review\//);
    await page.getByRole("button", { name: "Save meal" }).dblclick();
    await expect(page).toHaveURL(/\?saved=/);
    expect(await savedMeals(account.id)).toHaveLength(1);
  });

  test("F01-E5 refresh keeps the draft; going back, it isn't counted on Today", async ({ page, account }) => {
    expect(account.id).toBeTruthy();
    await page.goto("/log/photo");
    await pickPhoto(page, await jpeg(page));
    await expect(page).toHaveURL(/\/log\/review\//);
    const rows = await page.getByRole("button", { name: /^Fix / }).count();
    expect(rows).toBeGreaterThan(0);
    await page.reload();
    await expect(page.getByRole("button", { name: /^Fix / })).toHaveCount(rows);
    await page.goto("/");
    await expect(page.getByRole("img", { name: /^0 of .* kcal eaten/ })).toBeVisible();
  });

  test("F01-E6 two tabs: the second save is refused, nothing overwritten", async ({ page, context, account }) => {
    await page.goto("/log/photo");
    await pickPhoto(page, await jpeg(page));
    await expect(page).toHaveURL(/\/log\/review\//);
    const other = await context.newPage();
    await other.goto(page.url());
    await page.getByRole("button", { name: "Save meal" }).click();
    await expect(page).toHaveURL(/\?saved=/);
    const before = await savedMeals(account.id);

    await other.getByRole("button", { name: /^More / }).first().click();
    await other.getByRole("button", { name: "Save meal" }).click();
    await expect(other.getByRole("alert").filter({ hasText: "changed somewhere else" })).toBeVisible();
    expect(await savedMeals(account.id)).toEqual(before);
  });

  test("F01-E7 Discard removes the draft", async ({ page, account }) => {
    await page.goto("/log/photo");
    await pickPhoto(page, await jpeg(page));
    await expect(page).toHaveURL(/\/log\/review\//);
    // As a person would: the photo is on screen before they decide to discard.
    await expect.poll(() => page.getByRole("img", { name: "Your meal photo" }).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await page.getByRole("button", { name: "Discard" }).click();
    await expect(page).toHaveURL(/\/$/);
    const { count } = await admin.from("meals").select("id", { count: "exact", head: true }).eq("user_id", account.id);
    expect(count).toBe(0);
  });

  test("F01-N1 when today's free estimates are used up, it says so", async ({ page, account, expectedConsole }) => {
    expectedConsole.push(/status of 429/);
    const rows = Array.from({ length: DAILY_LIMIT }, () => ({ user_id: account.id, kind: "photo", model: "test", input_tokens: 1, output_tokens: 1 }));
    const { error } = await admin.from("ai_usage").insert(rows);
    expect(error).toBeNull();
    await page.goto("/log/photo");
    await pickPhoto(page, await jpeg(page));
    await expect(page.getByRole("alert").filter({ hasText: `today's ${DAILY_LIMIT} free photo estimates` })).toBeVisible();
  });
});

// Voice is on (VOICE_LOGGING=on): "Say it" opens Add food ready to listen, keeping the meal.
test("F02-P1 Say it opens Add food ready to listen", async ({ page, account }) => {
  await page.goto("/log/voice?meal=dinner");
  await expect(page).toHaveURL(/\/log\/search\?mode=voice&meal=dinner/);
  await expect(page.getByRole("heading", { name: "Add food" })).toBeVisible();
  // A browser with speech recognition shows the microphone; one without says to type instead.
  await expect(page.getByRole("button", { name: "Tap and say what you ate" }).or(page.getByText(/can't turn speech into text/))).toBeVisible();
  await expect(page.getByRole("radio", { name: "Dinner" })).toBeChecked();
  await expectAccessible(page);
  expect(account.id).toBeTruthy();
});
