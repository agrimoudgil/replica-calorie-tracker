import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { localHour } from "@/lib/dates";
import { parseMealType, suggestMealType } from "@/lib/meal-type";
import { UNITS, type Food, type Unit } from "@/lib/nutrition/types";
import { FoodLogger } from "./food-logger";

export const metadata = { title: "Add food · Replica calorie tracker" };

// Quick-add chips: everyday foods, in this order when they exist in the catalogue.
const POPULAR = ["seed-phulka", "seed-dal-tadka", "seed-rice", "seed-chai", "seed-poha", "seed-curd", "seed-idli", "seed-banana"];

/** S07: type a meal or search the food list. Calories come from the catalogue: free, no AI. */
export default async function AddFoodPage({ searchParams }: PageProps<"/log/search">) {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");
  const { meal, mode, items } = await searchParams;
  const foods = await db.listFoods(userId);
  const popular = POPULAR.map((id) => foods.find((f) => f.id === id)).filter((f) => f !== undefined);
  const initialLines = parseItemsParam(typeof items === "string" ? items : "", foods);
  return (
    <Screen>
      <ScreenHeader title="Add food" subtitle="Type it or search. Calories come from our food list." back="/" />
      <FoodLogger
        initialMealType={parseMealType(meal) ?? suggestMealType(localHour(new Date(), profile.timezone))}
        focus={mode === "search" ? "search" : "type"}
        popular={popular}
        initialLines={initialLines}
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
