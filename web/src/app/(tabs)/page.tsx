import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { MealCard } from "@/components/ui/food";
import { CalorieRing, MacroBar } from "@/components/ui/progress";
import { db } from "@/lib/data";
import { mealScore } from "@/lib/data/meal-math";
import { requireUserId } from "@/lib/data/session";
import { localDate, localHour } from "@/lib/dates";
import { MEAL_LABEL, suggestMealType } from "@/lib/meal-type";
import { MEAL_TYPES } from "@/lib/nutrition/types";
import { SavedNotice, TodayAddButton } from "./today-actions";

const fmt = new Intl.NumberFormat("en-IN");

/** S02 Today: calories left, macros, and the day's meals. */
export default async function TodayPage({ searchParams }: PageProps<"/">) {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");

  const now = new Date();
  const day = await db.getDay(userId, localDate(now, profile.timezone));
  const t = profile.targets;
  const { saved } = await searchParams;
  const savedMeal = typeof saved === "string" ? day.meals.find((m) => m.id === saved) : undefined;
  const dateLabel = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: profile.timezone }).format(now);

  return (
    <Screen className="pb-28">
      <ScreenHeader title={profile.displayName ? `Hi, ${profile.displayName}` : "Today"} subtitle={dateLabel} />

      {savedMeal && (
        <SavedNotice
          mealId={savedMeal.id}
          label={`${MEAL_LABEL[savedMeal.mealType]} saved · ${fmt.format(Math.round(savedMeal.items.reduce((s, i) => s + i.nutrients.kcal, 0)))} kcal`}
        />
      )}

      <section aria-labelledby="calories-heading" className="flex flex-col items-center gap-3 rounded-lg bg-surface p-5">
        <h2 id="calories-heading" className="sr-only">Calories today</h2>
        <CalorieRing eaten={Math.round(day.totals.kcal)} target={t.kcal} />
        <p className="text-sm text-muted">
          <span className="font-semibold text-fg tabular-nums">{fmt.format(Math.round(day.totals.kcal))}</span> eaten of{" "}
          <span className="tabular-nums">{fmt.format(t.kcal)}</span> kcal
        </p>
      </section>

      <section aria-labelledby="macros-heading" className="flex flex-col gap-4">
        <h2 id="macros-heading" className="text-lg font-semibold">Macros</h2>
        <MacroBar macro="protein" value={day.totals.proteinG} target={t.proteinG} />
        <MacroBar macro="carb" value={day.totals.carbG} target={t.carbG} />
        <MacroBar macro="fat" value={day.totals.fatG} target={t.fatG} />
        <MacroBar macro="fiber" value={day.totals.fiberG} target={t.fiberG} />
      </section>

      <section aria-labelledby="meals-heading" className="flex flex-col gap-3">
        <h2 id="meals-heading" className="text-lg font-semibold">Meals</h2>
        {MEAL_TYPES.map((type) => {
          const meals = day.meals.filter((m) => m.mealType === type);
          const items = meals.flatMap((m) => m.items);
          return (
            <MealCard
              key={type}
              type={type}
              href={meals.length ? `/meals/${meals[meals.length - 1].id}` : undefined}
              items={items.map((i) => i.name)}
              kcal={items.reduce((s, i) => s + i.nutrients.kcal, 0)}
              score={mealScore(items)}
              addHref={`/log/photo?meal=${type}`}
            />
          );
        })}
      </section>

      <TodayAddButton suggested={suggestMealType(localHour(now, profile.timezone))} />
    </Screen>
  );
}
