import Link from "next/link";
import { redirect } from "next/navigation";
import { Camera, ChevronRight, Lightbulb, Type } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/screen";
import { CalorieRing, MacroBar, NutrientBar } from "@/components/ui/progress";
import { PHOTO_LOGGING } from "@/lib/ai";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { supabaseEnabled } from "@/lib/supabase/config";
import { isIsoDate, localDate, localHour } from "@/lib/dates";
import { dailyNutrientRows, lastNDates, type NutrientRow } from "@/lib/insights/reference";
import { MEAL_LABEL, mealBudgets, suggestMealType } from "@/lib/meal-type";
import { MEAL_TYPES } from "@/lib/nutrition/types";
import { DayNav, longDate } from "./day-nav";
import { MealSection } from "./meal-section";
import { SavedNotice, TodayAddButton } from "./today-actions";

const fmt = new Intl.NumberFormat("en-IN");

/** S02 Today, and any past day via ?date=YYYY-MM-DD: calories, the day's meals as a food diary, macros and nutrients. */
export default async function DayPage({ searchParams }: PageProps<"/">) {
  // The main address: visitors who aren't signed in see what Oswald is first.
  const userId = await currentUserId();
  if (!userId) redirect(supabaseEnabled ? "/welcome" : "/onboarding");
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");

  const now = new Date();
  const tz = profile.timezone;
  const today = localDate(now, tz);
  const { saved, date } = await searchParams;
  const selected = typeof date === "string" && isIsoDate(date) ? date : today;
  if (selected > today) redirect("/");
  const isToday = selected === today;
  const here = isToday ? "/" : `/?date=${selected}`;

  const stripDates = lastNDates(today, 7);
  const [day, stripMeals] = await Promise.all([db.getDay(userId, selected), db.getMealsBetween(userId, stripDates[0], today)]);
  const t = profile.targets;
  const savedMeal = typeof saved === "string" ? day.meals.find((m) => m.id === saved) : undefined;
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", timeZone: tz });
  const suggested = suggestMealType(localHour(now, tz));
  const budgets = mealBudgets(t.kcal);

  const items = day.meals.flatMap((m) => m.items);
  const coverage = (key: NutrientRow["key"]) => (items.length ? items.filter((i) => i.nutrients[key] !== undefined).length / items.length : 1);
  const nutrientRows = dailyNutrientRows(
    { ironMg: day.totals.ironMg, calciumMg: day.totals.calciumMg, sodiumMg: day.totals.sodiumMg, satFatG: day.totals.satFatG, sugarG: day.totals.sugarG },
    { ironMg: coverage("ironMg"), calciumMg: coverage("calciumMg"), sodiumMg: coverage("sodiumMg"), satFatG: coverage("satFatG"), sugarG: coverage("sugarG") },
    profile.sex,
    t.kcal,
  );

  return (
    <Screen className="pb-28">
      <ScreenHeader
        title={isToday ? (profile.displayName ? `Hi, ${profile.displayName}` : "Today") : longDate(selected)}
        subtitle={isToday ? longDate(today) : "A past day. You can still add, edit or delete meals."}
        action={
          isToday ? undefined : (
            <Link href="/" className="inline-flex h-11 shrink-0 items-center rounded-md px-3 text-sm font-semibold text-accent hover:bg-accent-soft">
              Today
            </Link>
          )
        }
      />

      <DayNav selected={selected} today={today} stripDates={stripDates} loggedDates={new Set(stripMeals.map((m) => m.localDate))} />

      {savedMeal && (
        <SavedNotice
          mealId={savedMeal.id}
          returnTo={here}
          label={`${MEAL_LABEL[savedMeal.mealType]} saved · ${fmt.format(Math.round(savedMeal.items.reduce((s, i) => s + i.nutrients.kcal, 0)))} kcal`}
        />
      )}

      <section aria-labelledby="calories-heading" className="flex flex-col items-center gap-3 rounded-lg bg-surface p-5">
        <h2 id="calories-heading" className="sr-only">Calories {isToday ? "today" : `on ${longDate(selected)}`}</h2>
        <CalorieRing eaten={Math.round(day.totals.kcal)} target={t.kcal} past={!isToday} />
        <p className="text-sm text-muted">
          <span className="font-semibold text-fg tabular-nums">{fmt.format(Math.round(day.totals.kcal))}</span> eaten of{" "}
          <span className="tabular-nums">{fmt.format(t.kcal)}</span> kcal
        </p>
        {isToday && (
          // One tap to log: the camera when photo
          // logging is on, otherwise typing (free, no AI).
          <Link
            href={PHOTO_LOGGING ? `/log/photo?meal=${suggested}` : `/log/search?mode=type&meal=${suggested}`}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-accent px-5 text-sm font-semibold text-on-accent hover:brightness-110"
          >
            {PHOTO_LOGGING ? <Camera aria-hidden className="size-4" /> : <Type aria-hidden className="size-4" />}
            {PHOTO_LOGGING ? "Take a photo" : "Type what you ate"}
          </Link>
        )}
      </section>

      {/* The day as a food diary: each meal with its foods and its share of the budget. */}
      <section aria-labelledby="meals-heading" className="flex flex-col gap-3">
        <h2 id="meals-heading" className="text-lg font-semibold">Meals</h2>
        {MEAL_TYPES.map((type) => (
          <MealSection
            key={type}
            type={type}
            meals={day.meals.filter((m) => m.mealType === type)}
            budget={budgets[type]}
            addHref={isToday ? `/log/search?mode=search&meal=${type}` : `/log/search?mode=search&meal=${type}&date=${selected}`}
            time={time}
          />
        ))}
        {!isToday && (
          <Link
            href={`/log/search?mode=type&date=${selected}`}
            className="inline-flex h-11 items-center justify-center rounded-md border border-border text-sm font-semibold hover:bg-surface"
          >
            Add a meal to this day
          </Link>
        )}
      </section>

      <section aria-labelledby="macros-heading" className="flex flex-col gap-4">
        <h2 id="macros-heading" className="text-lg font-semibold">Macros</h2>
        <MacroBar macro="protein" value={day.totals.proteinG} target={t.proteinG} />
        <MacroBar macro="carb" value={day.totals.carbG} target={t.carbG} />
        <MacroBar macro="fat" value={day.totals.fatG} target={t.fatG} />
        <MacroBar macro="fiber" value={day.totals.fiberG} target={t.fiberG} />
        <details className="group rounded-lg border border-border">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
            More nutrients
            <ChevronRight aria-hidden className="size-5 text-muted transition-transform group-open:rotate-90" />
          </summary>
          <div className="flex flex-col gap-4 px-4 pb-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted">Log a meal to see iron, calcium, salt and more.</p>
            ) : (
              nutrientRows.map((r) => (
                <NutrientBar key={r.key} label={r.label} value={r.value} unit={r.unit} kind={r.kind} target={r.target} note={r.note} lowCoverage={r.coverage < 0.7} />
              ))
            )}
            <p className="text-xs text-muted">References: ICMR-NIN 2020 (iron, calcium), WHO (sodium, saturated fat). Estimates for general wellness.</p>
          </div>
        </details>
      </section>

      {isToday && (
        <>
          <Link href="/insights" className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border px-4 text-base hover:bg-surface">
            <span className="flex items-center gap-3">
              <Lightbulb aria-hidden className="size-5 text-accent" />
              Ideas for your next meal
            </span>
            <ChevronRight aria-hidden className="size-5 text-muted" />
          </Link>
          <TodayAddButton suggested={suggested} photo={PHOTO_LOGGING} />
        </>
      )}
    </Screen>
  );
}
