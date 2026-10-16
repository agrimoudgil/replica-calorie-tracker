import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { localHour } from "@/lib/dates";
import { parseMealType, suggestMealType } from "@/lib/meal-type";
import { FoodLogger } from "./food-logger";

export const metadata = { title: "Add food · Replica calorie tracker" };

// Quick-add chips: everyday foods, in this order when they exist in the catalogue.
const POPULAR = ["seed-phulka", "seed-dal-tadka", "seed-rice", "seed-chai", "seed-poha", "seed-curd", "seed-idli", "seed-banana"];

/** S07: type a meal or search the food list. Calories come from the catalogue: free, no AI. */
export default async function AddFoodPage({ searchParams }: PageProps<"/log/search">) {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");
  const { meal, mode } = await searchParams;
  const foods = await db.listFoods(userId);
  const popular = POPULAR.map((id) => foods.find((f) => f.id === id)).filter((f) => f !== undefined);
  return (
    <Screen>
      <ScreenHeader title="Add food" subtitle="Type it or search. Calories come from our food list." back="/" />
      <FoodLogger
        initialMealType={parseMealType(meal) ?? suggestMealType(localHour(new Date(), profile.timezone))}
        focus={mode === "search" ? "search" : "type"}
        popular={popular}
      />
    </Screen>
  );
}
