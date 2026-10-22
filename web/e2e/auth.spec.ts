import { admin, createAccount, deleteAccount, expect, expectAccessible, findGuest, guestStartsEnabled, insertMeal, istDate, lunchtime, signIn, test } from "./support";

// Starting with just an email needs anonymous sign-ins switched on in Supabase; skips until then.
test.describe("AUTH start with just an email", () => {
  test.beforeAll(async () => {
    test.skip(!(await guestStartsEnabled()), "anonymous sign-ins are off in Supabase");
  });

  test("AUTH-H3 landing page, Try, type an email, Start, set up, and use the app; the email is kept unverified", async ({ page }) => {
    const signupEmail = `rct-e2e-authh3-${crypto.randomUUID()}@example.com`;
    let userId: string | undefined;
    try {
      await page.goto("/"); // a visitor's way in: the main address shows the landing page
      await expect(page).toHaveURL(/\/welcome$/);
      await page.getByRole("link", { name: "Try Oswald free" }).first().click();
      await expect(page).toHaveURL(/\/sign-in$/);
      await page.getByLabel("Your email").fill(signupEmail.toUpperCase());
      await page.getByRole("button", { name: "Start using Oswald" }).click();
      await expect(page).toHaveURL(/\/onboarding/);
      const user = await findGuest(signupEmail); // stored lower-case
      userId = user?.id;
      expect(user?.is_anonymous).toBe(true);
      expect(user?.email ?? "").toBe(""); // not a sign-in address: nothing to verify or send to

      await page.getByLabel("Birth year", { exact: true }).fill("1994");
      await page.getByLabel("Height", { exact: true }).fill("160");
      await page.getByLabel("Weight", { exact: true }).fill("60");
      await page.getByLabel(/I agree that my body details/).check();
      await page.getByRole("button", { name: "Work out my target" }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("region", { name: "Lunch" })).toBeVisible();

      await page.goto("/profile");
      await expect(page.getByText("You started with just your email")).toBeVisible();
      await expect(page.getByRole("button", { name: "Sign out on all devices" })).toHaveCount(0);
      await page.getByRole("button", { name: "Sign out", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Sign out for good?" })).toBeVisible();
      await expectAccessible(page);
      await page.getByRole("button", { name: "Stay signed in" }).click();
      await expect(page).toHaveURL(/\/profile/);
    } finally {
      if (!userId) userId = (await findGuest(signupEmail))?.id;
      if (userId) await deleteAccount(userId);
    }
  });
});

test.describe("AUTH sign-in and sign-out", () => {
  test("AUTH-H1 asking for a sign-in link shows Check your email (email stubbed)", async ({ page }) => {
    let sent = 0;
    // Stub Supabase's email endpoint: no real email goes out from a test.
    await page.route("**/auth/v1/otp**", async (route) => {
      sent++;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    await page.goto("/sign-in");
    await expectAccessible(page);
    await page.getByText("Have an account with an email link? Sign in").click();
    await page.getByLabel("Email for a sign-in link").fill("someone@example.com");
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(page.getByText("someone@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /Send again in \d+s/ })).toBeDisabled();
    expect(sent).toBe(1);
    await expectAccessible(page);
  });

  test("AUTH-P1 the privacy policy opens from sign-in, without an account", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveTitle("Sign in · Oswald");
    await page.getByRole("link", { name: "Privacy policy" }).click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page).toHaveTitle("Privacy policy · Oswald");
    for (const heading of ["What we store", "Who helps us run it", "Your choices and rights", "Age"]) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
    await expect(page.getByText(/for people aged 18 and over/)).toBeVisible();
    // Who runs it and how to reach them are filled in, never placeholders.
    await expect(page.getByText(/OPERATOR_NAME|CONTACT_EMAIL/)).toHaveCount(0);
    await expect(page.locator('a[href^="mailto:"]').first()).toBeVisible();
    await expectAccessible(page);
  });

  test("AUTH-E4 a sign-in that comes back with an error says why", async ({ page }) => {
    await page.goto("/auth/callback?error=server_error&error_code=unexpected_failure&error_description=Unable+to+exchange+external+code");
    await expect(page).toHaveURL(/\/sign-in\?error=link&reason=google_exchange_failed/);
    await expect(page.getByRole("alert").filter({ hasText: "couldn't confirm it with Google" })).toBeVisible();
    await page.goto("/auth/callback?error=access_denied");
    await expect(page.getByRole("alert").filter({ hasText: "Sign-in was cancelled" })).toBeVisible();
    await page.goto("/sign-in?error=link&reason=%3Cimg%20src%3Dx%3E");
    await expect(page.getByRole("alert").filter({ hasText: "Sign-in didn't finish (imgsrcx)" })).toBeVisible();
    await expectAccessible(page);
  });

  test("AUTH-E1 a bad email address is caught before anything is sent", async ({ page }) => {
    let sent = 0;
    await page.route("**/auth/v1/otp**", (route) => {
      sent++;
      return route.abort();
    });
    await page.goto("/sign-in");
    await page.getByText("Have an account with an email link? Sign in").click();
    await page.getByLabel("Email for a sign-in link").fill("not-an-email");
    await page.getByRole("button", { name: "Email me a sign-in link" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Enter a valid email address." })).toBeVisible();
    expect(sent).toBe(0);
  });

  test("AUTH-E5 Start with a bad email is caught before any account is made", async ({ page }) => {
    let started = 0;
    await page.route("**/auth/v1/signup**", (route) => {
      started++;
      return route.abort();
    });
    await page.goto("/sign-in");
    await page.getByLabel("Your email").fill("not-an-email");
    await page.getByRole("button", { name: "Start using Oswald" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Enter a valid email address." })).toBeVisible();
    expect(started).toBe(0);
  });

  test("AUTH-E2 an expired link says so", async ({ page }) => {
    await page.goto("/sign-in?error=link");
    await expect(page.getByRole("alert").filter({ hasText: "expired or was already used" })).toBeVisible();
  });

  test("AUTH-E3 a broken session counts as signed out, without errors", async ({ page, context, account }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Today", level: 1 })).toBeVisible();
    const cookies = await context.cookies();
    await context.clearCookies();
    await context.addCookies(cookies.map((c) => (c.name.startsWith("sb-") ? { ...c, value: "garbage" } : c)));
    await page.goto("/");
    await expect(page).toHaveURL(/\/welcome/);
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/sign-in/);
    expect(account.id).toBeTruthy();
  });

  test("AUTH-N1 signed out: pages go to sign-in and APIs answer 401", async ({ page }) => {
    const someId = crypto.randomUUID();
    await page.goto("/");
    await expect(page).toHaveURL(/\/welcome/); // the main address shows the landing page
    for (const path of ["/log/photo", "/log/search", "/insights", "/profile", "/profile/foods", `/meals/${someId}`, `/log/review/${someId}`, "/recipes/new"]) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/sign-in/);
    }
    const api = page.request;
    expect((await api.get("/api/export?file=meals")).status()).toBe(401);
    expect((await api.get("/api/foods")).status()).toBe(401);
    expect((await api.post("/api/meals", { data: {} })).status()).toBe(401);
    expect((await api.put(`/api/recipes/${someId}`, { data: {} })).status()).toBe(401);
    expect((await api.get(`/api/meals/${someId}`)).status()).toBe(401);
  });

  test("AUTH-N2 another user's meals, recipes and photos stay invisible", async ({ page, context, baseURL, expectedConsole }) => {
    expectedConsole.push(/status of 404/);
    const a = await createAccount(true, "AUTH-N2a");
    const b = await createAccount(true, "AUTH-N2b");
    try {
      const mealId = await insertMeal(a.id, { meal_type: "lunch", eaten_at: lunchtime(istDate(0)) });
      const draftId = await insertMeal(a.id, { meal_type: "dinner", eaten_at: lunchtime(istDate(0)), status: "draft", ai_model: "test" });
      const { data: recipe } = await admin
        .from("foods")
        .insert({ owner_id: a.id, name: "A's private dal", kcal: 80, source: "user", is_recipe: true, recipe_servings: 2, unit_grams: { g: 1, katori: 150 }, default_unit: "katori" })
        .select("id")
        .single();

      await signIn(context, b, baseURL!);
      for (const path of [`/meals/${mealId}`, `/log/review/${draftId}`, `/recipes/${recipe!.id}`]) {
        const res = await page.goto(path);
        expect(res?.status(), path).toBe(404);
        await expect(page.getByRole("heading", { name: "We couldn't find that" })).toBeVisible();
      }
      expect((await page.request.get(`/api/photos/${mealId}`)).status()).toBe(404);
      expect((await page.request.get(`/api/meals/${mealId}`)).status()).toBe(404);
      const csv = await (await page.request.get("/api/export?file=meals")).text();
      expect(csv.trim().split("\r\n")).toHaveLength(1); // header only
      await page.goto("/log/search?mode=search");
      await page.getByRole("combobox", { name: "Or search the food list" }).fill("private dal");
      await expect(page.getByText(/Nothing called/)).toBeVisible();
    } finally {
      // Both, even if one fails.
      const results = await Promise.allSettled([deleteAccount(a.id), deleteAccount(b.id)]);
      for (const r of results) if (r.status === "rejected") throw r.reason;
    }
  });

  test("AUTH-H2 signing out ends the session", async ({ page, account }) => {
    await page.goto("/profile");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await page.goto("/");
    await expect(page).toHaveURL(/\/welcome/);
    expect(account.id).toBeTruthy();
  });
});
