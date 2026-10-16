/*
 * Seeds the Supabase database.
 *   npm run db:seed          → the shared food catalogue (safe to run again; it upserts)
 *   npm run db:seed -- --demo → also a fake demo user with a week of meals
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in web/.env.local.
 * The demo user uses an example.com address: no real person.
 */
import { createClient } from "@supabase/supabase-js";
import { foodToRow } from "@/lib/data/supabase-store";
import { mealScore } from "@/lib/data/meal-math";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import { computeTargets } from "@/lib/nutrition/targets";
import type { MealType, Unit } from "@/lib/nutrition/types";
import type { MealItem } from "@/lib/data/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in web/.env.local first.");
  process.exit(1);
}
const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function seedFoods() {
  const { error } = await admin.from("foods").upsert(SEED_FOODS.map(foodToRow), { onConflict: "id" });
  if (error) throw new Error(`foods: ${error.message}`);
  console.log(`Catalogue: ${SEED_FOODS.length} foods upserted.`);
}

const DEMO_EMAIL = "demo.user@example.com";
const DAY_PLAN: Array<[MealType, number, Array<[string, number, Unit]>]> = [
  ["breakfast", 8, [["seed-poha", 1.5, "katori"], ["seed-chai", 1, "glass"]]],
  ["lunch", 13, [["seed-phulka", 2, "piece"], ["seed-dal-tadka", 1, "katori"], ["seed-bhindi", 1, "katori"], ["seed-curd", 1, "katori"]]],
  ["snack", 17, [["seed-banana", 1, "piece"], ["seed-chai", 1, "glass"]]],
  ["dinner", 20, [["seed-rice", 1, "katori"], ["seed-rajma", 1, "katori"], ["seed-salad", 1, "katori"]]],
];

async function seedDemo() {
  const { data: list, error: listError } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw new Error(`list users: ${listError.message}`);
  let user = list.users.find((u) => u.email === DEMO_EMAIL);
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({ email: DEMO_EMAIL, email_confirm: true });
    if (error) throw new Error(`create demo user: ${error.message}`);
    user = data.user;
  }
  const t = computeTargets({ sex: "female", age: 31, heightCm: 158, weightKg: 62, activity: "light", goal: "lose" });
  const { error: pErr } = await admin.from("profiles").upsert({
    id: user.id, display_name: "Demo", sex: "female", birth_year: new Date().getUTCFullYear() - 31, height_cm: 158, weight_kg: 62,
    activity_level: "light", goal: "lose", diet_type: "vegetarian", daily_kcal_target: t.kcal, protein_g_target: t.proteinG,
    carb_g_target: t.carbG, fat_g_target: t.fatG, fiber_g_target: t.fiberG,
  });
  if (pErr) throw new Error(`demo profile: ${pErr.message}`);

  // Fresh week each run: remove the demo user's old meals (secret key, so filter by user).
  await admin.from("meals").delete().eq("user_id", user.id);
  let count = 0;
  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    for (const [mealType, hourIst, plan] of DAY_PLAN) {
      if (daysAgo === 0 && hourIst > 13) continue; // today: only up to lunch
      const eaten = new Date();
      eaten.setUTCDate(eaten.getUTCDate() - daysAgo);
      eaten.setUTCHours(hourIst - 5, 30, 0, 0); // IST = UTC+5:30
      const items = plan.map(([foodId, quantity, unit], position) => {
        const food = SEED_FOODS.find((f) => f.id === foodId)!;
        const grams = gramsFor(food, unit, quantity * (0.8 + ((daysAgo + position) % 5) * 0.1));
        return { food, quantity, unit, grams, position, nutrients: nutrientsForGrams(food, grams) };
      });
      const { data: meal, error } = await admin
        .from("meals")
        .insert({
          user_id: user.id, status: "saved", meal_type: mealType, input_method: "search", eaten_at: eaten.toISOString(),
          saved_at: eaten.toISOString(), health_score: mealScore(items as unknown as MealItem[]),
        })
        .select("id")
        .single();
      if (error) throw new Error(`demo meal: ${error.message}`);
      const { error: iErr } = await admin.from("meal_items").insert(
        items.map((i) => ({
          meal_id: meal.id, user_id: user.id, food_id: i.food.id, position: i.position, name: i.food.name, name_hi: i.food.nameHi ?? null,
          quantity: i.quantity, unit: i.unit, grams: i.grams, kcal: i.nutrients.kcal, protein_g: i.nutrients.proteinG,
          carb_g: i.nutrients.carbG, fat_g: i.nutrients.fatG, fiber_g: i.nutrients.fiberG, sugar_g: i.nutrients.sugarG ?? null,
          sat_fat_g: i.nutrients.satFatG ?? null, sodium_mg: i.nutrients.sodiumMg ?? null, calcium_mg: i.nutrients.calciumMg ?? null,
          iron_mg: i.nutrients.ironMg ?? null, source: "db",
        })),
      );
      if (iErr) throw new Error(`demo items: ${iErr.message}`);
      count++;
    }
  }
  console.log(`Demo user ${DEMO_EMAIL}: profile and ${count} meals over 7 days.`);
}

async function main() {
  await seedFoods();
  if (process.argv.includes("--demo")) await seedDemo();
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : "Seeding failed.");
  process.exit(1);
});
