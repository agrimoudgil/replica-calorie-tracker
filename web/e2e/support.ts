import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

/*
 * Shared pieces for the end-to-end tests (see playwright.config.ts):
 * - throwaway example.com users on the live project, deleted after each test;
 * - a `page` that fails the test on any console error or 5xx response;
 * - an axe accessibility check (WCAG 2.1 A and AA);
 * - small database helpers that use the secret key, in this test process only.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
const secret = process.env.SUPABASE_SECRET_KEY ?? "";
if (!url || !publishable || !secret) throw new Error("The e2e tests need the Supabase keys in web/.env.local.");

export const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

/** Photo logging switched on for the server under test (PHOTO_LOGGING=on; off by default). */
export const PHOTO_ON = process.env.PHOTO_LOGGING?.trim().toLowerCase() === "on";

export type Account = { id: string; email: string; password: string };

export const PROFILE_ROW = {
  sex: "female",
  birth_year: 1992,
  height_cm: 160,
  weight_kg: 60,
  activity_level: "light",
  goal: "maintain",
  diet_type: "vegetarian",
  daily_kcal_target: 1760,
  protein_g_target: 72,
  carb_g_target: 249,
  fat_g_target: 53,
  fiber_g_target: 25,
};

/** `tag` (a case id like "AUTH-E3") goes into the address, so a user left behind names its test. */
export async function createAccount(withProfile = true, tag = "x"): Promise<Account> {
  const email = `rct-e2e-${tag.toLowerCase().replace(/[^a-z0-9]+/g, "")}-${crypto.randomUUID()}@example.com`;
  const password = `${crypto.randomUUID()}Aa1!`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  if (withProfile) {
    const { error: pe } = await admin.from("profiles").insert({ id: data.user.id, ...PROFILE_ROW });
    if (pe) throw pe;
  }
  return { id: data.user.id, email, password };
}

/** Recipes first (as the app does), then the user; every other row cascades. A user already deleted is fine. */
export async function deleteAccount(id: string) {
  await admin.from("foods").delete().eq("owner_id", id).eq("is_recipe", true);
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error && error.status !== 404) throw error;
}

/**
 * Deletes e2e test users created since `since` that are still there, and returns their
 * tags. Run after every suite, so a leak never stays in the project and is still reported.
 */
export async function sweepTestUsers(since: string): Promise<string[]> {
  const leaked: string[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    for (const u of data.users) {
      const match = /^rct-e2e-([a-z0-9]+)-/.exec(u.email ?? "");
      if (!match || Date.parse(u.created_at) < Date.parse(since)) continue;
      leaked.push(match[1]);
      await deleteAccount(u.id);
    }
    if (data.users.length < 1000) return leaked;
  }
}

/** Signs the browser context in, the way the app's own cookies would after an email link. */
export async function signIn(context: BrowserContext, account: Account, baseURL: string) {
  const jar = new Map<string, string>();
  const ssr = createServerClient(url, publishable, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach((c) => jar.set(c.name, c.value)),
    },
  });
  const { error } = await ssr.auth.signInWithPassword({ email: account.email, password: account.password });
  if (error) throw error;
  await context.addCookies([...jar].map(([name, value]) => ({ name, value, domain: new URL(baseURL).hostname, path: "/", sameSite: "Lax" as const })));
}

type Fixtures = {
  /** Console errors this test expects (e.g. the browser logging a deliberate 404). Push to it. */
  expectedConsole: RegExp[];
  /** A signed-in throwaway user (with a profile unless `withProfile` is false). */
  account: Account;
};
type Options = { withProfile: boolean };

// The fixture callback is called `provide`, not Playwright's usual `use`, so the React
// hooks lint rule doesn't mistake it for React's use().
export const test = base.extend<Fixtures & Options>({
  withProfile: [true, { option: true }],
  expectedConsole: async ({}, provide) => {
    await provide([]);
  },
  account: async ({ context, withProfile, baseURL }, provide, testInfo) => {
    const account = await createAccount(withProfile, testInfo.title.split(" ")[0]);
    try {
      await signIn(context, account, baseURL!);
      await provide(account);
    } finally {
      await deleteAccount(account.id);
    }
  },
  page: async ({ page, expectedConsole }, provide) => {
    const problems: string[] = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      const where = m.location().url ? ` (${new URL(m.location().url).pathname})` : "";
      problems.push(`console: ${m.text().split("\n")[0]}${where}`);
    });
    page.on("pageerror", (e) => problems.push(`page error: ${e.message}`));
    page.on("response", (r) => {
      if (r.status() >= 500) problems.push(`${r.status()} on ${new URL(r.url()).pathname}`);
    });
    await provide(page);
    const unexpected = problems.filter((p) => !expectedConsole.some((re) => re.test(p)));
    expect(unexpected, "console errors or 5xx responses").toEqual([]);
  },
});

export { expect };

/** axe (WCAG 2.1 A and AA) on what the page shows now. `soft` keeps going, to report every screen. */
export async function expectAccessible(page: Page, { soft = false } = {}) {
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const found = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
  (soft ? expect.soft : expect)(found, `accessibility on ${new URL(page.url()).pathname}`).toEqual([]);
}

// ---- data helpers ----------------------------------------------------------------

type ItemRow = Record<string, unknown>;

export const PHULKA: ItemRow = {
  food_id: "seed-phulka", name: "Phulka", name_hi: "फुलका", quantity: 2, unit: "piece", grams: 70,
  kcal: 207.9, protein_g: 6.9, carb_g: 38.5, fat_g: 2.6, fiber_g: 6.3, sugar_g: 1.1, sat_fat_g: 0.4, sodium_mg: 280, calcium_mg: 21, iron_mg: 2.2, source: "db",
};
export const DAL: ItemRow = {
  food_id: "seed-dal-tadka", name: "Dal tadka", name_hi: "दाल तड़का", quantity: 1, unit: "katori", grams: 150,
  kcal: 180, protein_g: 9, carb_g: 22.5, fat_g: 6, fiber_g: 4.5, sugar_g: 1.5, sat_fat_g: 2.3, sodium_mg: 525, calcium_mg: 37.5, iron_mg: 2.3, source: "db",
};

/** Inserts a meal with items straight into the database and returns its id. */
export async function insertMeal(
  userId: string,
  meal: { meal_type: string; eaten_at: string; status?: "saved" | "draft"; ai_model?: string; health_score?: number },
  items: ItemRow[] = [PHULKA, DAL],
): Promise<string> {
  const status = meal.status ?? "saved";
  // "text", not "photo": a photo meal must have a stored photo.
  const { data, error } = await admin
    .from("meals")
    .insert({ user_id: userId, input_method: meal.ai_model ? "text" : "search", ...meal, status, saved_at: status === "saved" ? meal.eaten_at : null })
    .select("id")
    .single();
  if (error) throw error;
  const { error: ie } = await admin.from("meal_items").insert(items.map((i, position) => ({ meal_id: data.id, user_id: userId, position, ...i })));
  if (ie) throw ie;
  return data.id;
}

export async function savedMeals(userId: string) {
  const { data, error } = await admin.from("meals").select("id, meal_type, local_date, photo_path, meal_items(name, quantity, unit, grams, kcal, source, food_id, position)").eq("user_id", userId).eq("status", "saved").order("eaten_at");
  if (error) throw error;
  return data;
}

/** A day in India, `offset` days from today (YYYY-MM-DD). */
export function istDate(offset = 0): string {
  return new Date(Date.now() + offset * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** 13:30 IST on an IST day, as UTC. */
export const lunchtime = (date: string) => `${date}T08:00:00.000Z`;

/** A real JPEG made by the browser's canvas, for the photo picker. */
export async function jpeg(page: Page): Promise<{ name: string; mimeType: string; buffer: Buffer }> {
  const dataUrl = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 160;
    c.height = 120;
    const g = c.getContext("2d")!;
    g.fillStyle = "#d9a441";
    g.fillRect(0, 0, 160, 120);
    g.fillStyle = "#7a3e12";
    g.beginPath();
    g.arc(80, 60, 40, 0, Math.PI * 2);
    g.fill();
    return c.toDataURL("image/jpeg", 0.9);
  });
  return { name: "thali.jpg", mimeType: "image/jpeg", buffer: Buffer.from(dataUrl.split(",")[1], "base64") };
}

/** Picks a file through the Gallery button on the photo screen. */
export async function pickPhoto(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Gallery" }).click();
  await (await chooser).setFiles(file);
}
