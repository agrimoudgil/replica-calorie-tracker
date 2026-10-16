import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { addDays, isIsoDate, localDate, localHour, zonedTimeToUtc } from "@/lib/dates";
import { parseMealType, suggestMealType } from "@/lib/meal-type";
import { MEAL_TYPES, UNITS, type Food, type MealType, type Unit } from "@/lib/nutrition/types";
import { recentFoods, type QuickFood } from "@/lib/recents";
import { FoodLogger } from "./food-logger";

export const metadata = { title: "Add food · Replica calorie tracker" };

// Shown only to people with no recent or favourite foods yet.
const POPULAR = ["seed-phulka", "seed-dal-tadka", "seed-rice", "seed-chai", "seed-poha", "seed-curd", "seed-idli", "seed-banana"];

/** When a meal added to a past day is recorded as eaten, in the user's local time. */
const USUAL_TIME: Record<MealType, [number, number]> = { breakfast: [8, 30], lunch: [13, 30], snack: [17, 0], dinner: [20, 30] };

/** S07: type a meal or search the food list. Calories come from the catalogue: free, no AI. */
export default async function AddFoodPage({ searchParams }: PageProps<"/log/search">) {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");
  const tz = profile.timezone;
  const today = localDate(new Date(), tz);
  const { meal, mode, items, date } = await searchParams;
  const pastDate = typeof date === "string" && isIsoDate(date) && date < today ? date : null;

  const [foods, recentMeals, favouriteIds] = await Promise.all([
    db.listFoods(userId),
    db.getMealsBetween(userId, addDays(today, -30), today),
    db.listFavouriteFoodIds(userId),
  ]);
  const recents = recentFoods(recentMeals, foods, 12);
  const favourites: QuickFood[] = favouriteIds.flatMap((id) => {
    const usual = recents.find((r) => r.food.id === id);
    const food = foods.find((f) => f.id === id);
    return usual ? [usual] : food ? [{ food, quantity: 1, unit: food.defaultUnit, count: 0 }] : [];
  });
  // Your recipes get their own row (at your usual portion), unless they're already a favourite.
  const recipes: QuickFood[] = foods
    .filter((f) => f.isRecipe && f.ownerId === userId && !favouriteIds.includes(f.id))
    .map((food) => recents.find((r) => r.food.id === food.id) ?? { food, quantity: 1, unit: food.defaultUnit, count: 0 });
  const popular = favourites.length || recents.length || recipes.length ? [] : POPULAR.map((id) => foods.find((f) => f.id === id)).filter((f) => f !== undefined);

  return (
    <Screen>
      <ScreenHeader
        title="Add food"
        subtitle={pastDate ? `Adding to ${new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${pastDate}T00:00:00Z`))}.` : "Type it or search. Calories come from our food list."}
        back={pastDate ? `/?date=${pastDate}` : "/"}
      />
      <FoodLogger
        initialMealType={parseMealType(meal) ?? suggestMealType(localHour(new Date(), tz))}
        focus={mode === "search" ? "search" : "type"}
        popular={popular}
        favourites={favourites}
        recipes={recipes}
        recents={recents.filter((r) => !favouriteIds.includes(r.food.id) && !r.food.isRecipe).slice(0, 8)}
        favouriteIds={favouriteIds}
        initialLines={parseItemsParam(typeof items === "string" ? items : "", foods)}
        pastDay={
          pastDate
            ? {
                date: pastDate,
                eatenAt: Object.fromEntries(MEAL_TYPES.map((t) => [t, zonedTimeToUtc(pastDate, ...USUAL_TIME[t], tz)])) as Record<MealType, string>,
              }
            : undefined
        }
      />
    </Screen>
  );
}

/** "seed-phulka:2:piece,seed-dal-tadka:1:katori" (from an insights idea) → starting foods. Bad parts are ignored. */
function parseItemsParam(value: string, foods: Food[]): Array<{ food: Food; quantity: number; unit: Unit }> {
  return value
    .split(",")
    .slice(0, 12)
    .flatMap((part) => {
      const [id, q, unit] = part.split(":");
      const food = foods.find((f) => f.id === id);
      const quantity = Number(q);
      if (!food || !(quantity > 0 && quantity <= 3000) || !(UNITS as readonly string[]).includes(unit)) return [];
      return [{ food, quantity, unit: unit as Unit }];
    });
}
