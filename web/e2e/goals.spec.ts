import { admin, expect, expectAccessible, test } from "./support";

const target = async (id: string, columns = "daily_kcal_target, protein_g_target, targets_custom") => {
  const { data, error } = await admin.from("profiles").select(columns).eq("id", id).single();
  if (error) throw error;
  return data as unknown as Record<string, number | boolean>;
};

// Top-five #5: your own targets.
test("S13-E4 targets out of range are explained, nothing is saved", async ({ page, account }) => {
  await page.goto("/profile/goals");
  await page.getByLabel("Calories").fill("800");
  await page.getByLabel("Protein").fill("");
  await page.getByRole("button", { name: "Save my targets" }).click();
  await expect(page.getByText("Calories: at least 1,000 a day.")).toBeVisible();
  await expect(page.getByText("Enter protein.")).toBeVisible();
  await expect(page.getByLabel("Calories")).toHaveAttribute("aria-invalid", "true");
  await expectAccessible(page);
  expect(await target(account.id, "daily_kcal_target")).toEqual({ daily_kcal_target: 1760 });
});

// Saving needs database migration 4; until it is run this skips.
test.describe("S13 Goals and budgets, saved", () => {
  test.beforeAll(async () => {
    const { error } = await admin.from("profiles").select("targets_custom").limit(1);
    test.skip(error?.code === "42703", "migration 4 (targets_custom) not run yet");
  });

  test("S13-H4 set your own targets, see them on Today, then go back to suggested", async ({ page, account }) => {
    await page.goto("/profile");
    await page.getByRole("link", { name: "Goals and budgets" }).click();
    await expect(page.getByRole("status").filter({ hasText: "worked out from your body details" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Use suggested targets/ })).toHaveCount(0);

    await page.getByLabel("Calories").fill("1600");
    await page.getByLabel("Protein").fill("100");
    await page.getByLabel("Carbs").fill("150");
    await page.getByLabel("Fat").fill("40");
    await page.getByLabel("Fibre").fill("30");
    await expect(page.getByText("add up to 1,360 kcal, 240 less than your calorie target")).toBeVisible();
    await expect(page.getByRole("region", { name: "Meal budgets on Today" })).toContainText("Lunch480 kcal");
    await expectAccessible(page);
    await page.getByRole("button", { name: "Save my targets" }).click();
    await expect(page.getByText("Your targets are saved")).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "your own targets" })).toBeVisible();
    expect(await target(account.id)).toEqual({ daily_kcal_target: 1600, protein_g_target: 100, targets_custom: true });

    await page.goto("/");
    await expect(page.getByRole("region", { name: "Lunch" })).toContainText("0 of 480 kcal");

    // Saving body details again keeps your own targets.
    await page.goto("/onboarding");
    await expect(page.getByText("won't change them")).toBeVisible();
    await page.getByLabel("Weight").fill("70");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await target(account.id)).toMatchObject({ daily_kcal_target: 1600, targets_custom: true });

    await page.goto("/profile/goals");
    await page.getByRole("button", { name: /Use suggested targets/ }).click();
    await expect(page.getByText("Back to suggested targets")).toBeVisible();
    const back = await target(account.id);
    expect(back.targets_custom).toBe(false);
    expect(back.daily_kcal_target).not.toBe(1600);
    await expect(page.getByLabel("Calories")).toHaveValue(String(back.daily_kcal_target));
  });
});
