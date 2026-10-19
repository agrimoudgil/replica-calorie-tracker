import type { Page } from "@playwright/test";
import { admin, expect, expectAccessible, test } from "./support";

const profileOf = async (id: string) => (await admin.from("profiles").select("display_name, daily_kcal_target, goal").eq("id", id).maybeSingle()).data;

async function fillValid(page: Page) {
  await page.getByLabel("Birth year", { exact: true }).fill("1994");
  await page.getByLabel("Height", { exact: true }).fill("160");
  await page.getByLabel("Weight", { exact: true }).fill("60");
  await page.getByLabel(/I agree that my body details/).check();
}

test.describe("F04 first-time setup", () => {
  test.use({ withProfile: false });

  test("F04-H1 a new user is sent to setup and lands on Today with a target", async ({ page, account }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/onboarding/);
    await expectAccessible(page);
    await fillValid(page);
    await page.getByRole("button", { name: "Work out my target" }).click();
    await expect(page).toHaveURL(/\/$/);
    const profile = await profileOf(account.id);
    expect(profile?.daily_kcal_target).toBeGreaterThan(1200);
    await expect(page.getByRole("img", { name: new RegExp(`0 of ${profile!.daily_kcal_target.toLocaleString("en-IN")} kcal eaten`) })).toBeVisible();
    await expectAccessible(page);
  });

  test("F04-E6 under 18 can't sign up", async ({ page, account }) => {
    await page.goto("/onboarding");
    await fillValid(page);
    await page.getByLabel("Birth year", { exact: true }).fill(String(new Date().getFullYear() - 16));
    await page.getByRole("button", { name: "Work out my target" }).click();
    await expect(page.getByText("Oswald is for people aged 18 and over.")).toBeVisible();
    expect(await profileOf(account.id)).toBeNull();
  });

  test("F04-E1 an empty form shows every error and saves nothing", async ({ page, account }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: "Work out my target" }).click();
    for (const text of ["Enter the year you were born.", "Enter your height.", "Enter your weight.", "Please agree so we can store your meals."]) {
      await expect(page.getByText(text)).toBeVisible();
    }
    expect(await profileOf(account.id)).toBeNull();
    await expectAccessible(page);
  });

  test("F04-E2 emoji and accents are kept; a long name is capped at 80", async ({ page, account }) => {
    await page.goto("/onboarding");
    const name = page.getByLabel("What should we call you? (optional)");
    await name.fill("x".repeat(120));
    expect((await name.inputValue()).length).toBeLessThanOrEqual(80);
    await name.fill("Ánanyā 🌿");
    await fillValid(page);
    await page.getByRole("button", { name: "Work out my target" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect((await profileOf(account.id))?.display_name).toBe("Ánanyā 🌿");
    await page.goto("/profile");
    await expect(page.getByText("Ánanyā 🌿")).toBeVisible();
  });

  test("F04-E3 a double click on submit saves one profile, no errors", async ({ page, account }) => {
    await page.goto("/onboarding");
    await fillValid(page);
    await page.getByRole("button", { name: "Work out my target" }).dblclick();
    await expect(page).toHaveURL(/\/$/);
    const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("id", account.id);
    expect(count).toBe(1);
  });

  test("F04-E5 offline: says so, then saves once back online", async ({ page, context, account, expectedConsole }) => {
    expectedConsole.push(/ERR_INTERNET_DISCONNECTED/);
    await page.goto("/onboarding");
    await fillValid(page);
    await context.setOffline(true);
    await page.getByRole("button", { name: "Work out my target" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "offline" })).toBeVisible();
    expect(await profileOf(account.id)).toBeNull();
    await context.setOffline(false);
    await page.getByRole("button", { name: "Work out my target" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await profileOf(account.id)).not.toBeNull();
  });
});

test("F04-E4 changing the goal later lowers the target", async ({ page, account }) => {
  const before = (await profileOf(account.id))!.daily_kcal_target;
  await page.goto("/profile");
  await page.getByRole("link", { name: "Edit body details and goal" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByRole("group", { name: "Your goal" }).locator("label", { hasText: "Lose weight" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/$/);
  const after = await profileOf(account.id);
  expect(after?.goal).toBe("lose");
  expect(after!.daily_kcal_target).toBeLessThan(before);
});
