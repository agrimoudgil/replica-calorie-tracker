import { expect, expectAccessible, test } from "./support";

const LIVE = "https://oswald-calorie-tracker.vercel.app";

// Pre-launch basics (/replica-deploy): terms, search-engine files, security headers, health.
test.describe("PUB public basics", () => {
  test("PUB-1 the terms open without an account, from the landing page and sign-in", async ({ page }) => {
    await page.goto("/welcome");
    await page.getByRole("contentinfo").getByRole("link", { name: "Terms of use" }).click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(page).toHaveTitle("Terms of use · Oswald");
    for (const heading of ["Who can use it", "Not medical advice", "Your account", "Fair use", "Changes and law"]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
    await expectAccessible(page);
    await page.goto("/sign-in");
    await page.getByRole("link", { name: "Terms of use" }).click();
    await expect(page).toHaveURL(/\/terms$/);
  });

  test("PUB-2 robots.txt and the sitemap list only public pages", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /api/");
    expect(robots).toContain("Disallow: /meals/");
    expect(robots).toContain(`Sitemap: ${LIVE}/sitemap.xml`);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/welcome", "/privacy", "/terms"]) expect(sitemap).toContain(`<loc>${LIVE}${path}</loc>`);
    expect(sitemap).not.toContain("/meals");
  });

  test("PUB-3 pages and APIs send the security headers; public pages name their canonical address", async ({ page, request }) => {
    for (const path of ["/welcome", "/api/health"]) {
      const headers = (await request.get(path)).headers();
      expect(headers["x-frame-options"], path).toBe("DENY");
      expect(headers["x-content-type-options"], path).toBe("nosniff");
      expect(headers["content-security-policy"], path).toContain("frame-ancestors 'none'");
      expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    }
    await page.goto("/welcome");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${LIVE}/welcome`);
  });

  test("PUB-4 the health check reads the database and is never cached", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ ok: true, database: "ok" });
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});
