import { notFound } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { localDate } from "@/lib/dates";
import type { Unit } from "@/lib/nutrition/types";
import { ReviewForm } from "./review-form";

export const metadata = { title: "Check your meal" };

/** S05: check the estimate, fix portions, remove wrong items, save. */
export default async function ReviewPage({ params }: PageProps<"/log/review/[id]">) {
  const userId = await requireUserId();
  const { id } = await params;
  const [meal, profile] = await Promise.all([db.getMeal(userId, id), db.getProfile(userId)]);
  if (!meal) notFound();
  // After saving or deleting, go back to the day this meal belongs to.
  const dayPath = meal.localDate === localDate(new Date(), profile?.timezone) ? "/" : `/?date=${meal.localDate}`;

  // Unit weights of the foods in this meal (world foods included), for live portion changes.
  const foods = await db.getFoods(userId, meal.items.flatMap((i) => (i.foodId ? [i.foodId] : [])));
  const unitGrams: Record<string, Partial<Record<Unit, number>>> = {};
  for (const item of meal.items) {
    const food = item.foodId ? foods.find((f) => f.id === item.foodId) : undefined;
    if (food) unitGrams[food.id] = food.unitGrams;
  }

  return (
    <Screen>
      <ScreenHeader
        title={meal.status === "draft" ? "Check your meal" : "Edit meal"}
        subtitle={meal.status === "draft" ? "Fix anything we got wrong, then save." : undefined}
        back={meal.status === "draft" ? "/log/photo" : `/meals/${meal.id}`}
      />
      <ReviewForm meal={meal} unitGrams={unitGrams} dayPath={dayPath} />
    </Screen>
  );
}
