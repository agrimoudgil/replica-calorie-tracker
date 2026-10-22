import type { Page } from "@playwright/test";
import { expect, expectAccessible, test } from "./support";

/** The screenshots shown at this width: described, loaded, and drawn at a real size. */
async function expectShots(page: Page, count: number) {
  const shots = page.locator("main img:visible");
  await expect(shots).toHaveCount(count);
  for (const img of await shots.all()) {
    await img.scrollIntoViewIfNeeded();
    expect((await img.getAttribute("alt"))?.length ?? 0).toBeGreaterThan(20);
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    expect((await img.boundingBox())?.width ?? 0).toBeGreaterThan(150);
  }
}

// The public landing page: what Oswald is, then "Try Oswald free" (the email start).
test.describe("LAND landing page", () => {
  test("LAND-H1 a visitor lands on it from the main address and can start", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/welcome$/);
    await expect(page).toHaveTitle("Oswald: free calorie tracker for Indian meals");
    await expect(page.getByRole("heading", { level: 1, name: "Count calories the way India eats." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByRole("list").filter({ hasText: "Type it the way you'd say it" }).getByRole("listitem")).toHaveCount(4);

    await expectShots(page, 4); // phone width: the four steps (the top image is desktop only)
    await expectAccessible(page);

    await page.getByRole("contentinfo").getByRole("link", { name: "Privacy policy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await page.goBack();
    await page.getByRole("link", { name: "Try Oswald free" }).first().click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole("button", { name: "Start using Oswald" })).toBeVisible();
    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(/\/welcome$/);
  });

  test("LAND-H2 someone signed in gets Open Oswald, and the main address stays Today", async ({ page, account }) => {
    expect(account.id).toBeTruthy();
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Lunch" })).toBeVisible();
    await page.goto("/welcome");
    await expect(page.getByRole("link", { name: "Try Oswald free" })).toHaveCount(0);
    await page.getByRole("link", { name: "Open Oswald" }).first().click();
    await expect(page).toHaveURL(/\/$/);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`LAND-A1 passes axe in ${scheme} mode, with no sideways scrolling at 390 and 1440 px`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/welcome");
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${width} px`).toBeLessThanOrEqual(0);
        await expectShots(page, width >= 768 ? 5 : 4); // desktop adds the image beside the headline
        await page.evaluate(() => window.scrollTo(0, 0));
        await expectAccessible(page, { soft: true });
      }
    });
  }
});
