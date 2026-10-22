import { expect, expectAccessible, insertMeal, istDate, lunchtime, test } from "./support";

/** Every screen a signed-in person can reach, with a saved meal and a draft to show. */
async function screens(userId: string) {
  const meal = await insertMeal(userId, { meal_type: "lunch", eaten_at: lunchtime(istDate(0)), health_score: 7 });
  const draft = await insertMeal(userId, { meal_type: "dinner", eaten_at: lunchtime(istDate(0)), status: "draft", ai_model: "test" });
  return [
    "/",
    `/?date=${istDate(-1)}`,
    "/log",
    "/log/photo",
    "/log/search?mode=type",
    "/log/search?mode=search",
    `/log/review/${draft}`,
    `/meals/${meal}`,
    "/insights",
    "/profile",
    "/profile/foods",
    "/recipes/new",
    "/onboarding",
    "/coach",
    "/progress",
    "/profile/goals",
    "/privacy",
    "/terms",
  ];
}

// 17 screens in one test: against the live site this takes about a minute, so allow more.
test.describe.configure({ timeout: 150_000 });

for (const scheme of ["light", "dark"] as const) {
  test(`AX-1 every screen passes axe (WCAG 2.1 AA) in ${scheme} mode`, async ({ page, account }) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const path of await screens(account.id)) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await expectAccessible(page, { soft: true });
    }
    await page.context().clearCookies();
    await page.goto("/sign-in");
    await expectAccessible(page, { soft: true });
  });
}

for (const width of [390, 1440]) {
  test(`L-1 no sideways scrolling at ${width} px`, async ({ page, account }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of await screens(account.id)) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });
}
