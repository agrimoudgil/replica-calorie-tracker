import Link from "next/link";
import { redirect } from "next/navigation";
import { CircleAlert, CircleCheck, Info, Lightbulb, Plus } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/screen";
import { TrendChart } from "@/components/ui/charts";
import { EmptyState } from "@/components/ui/feedback";
import { MacroBar } from "@/components/ui/progress";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { localDate, localHour } from "@/lib/dates";
import { nextMealIdeas, ideaToQuery, type MealIdea } from "@/lib/insights/next-meal";
import { lastNDates } from "@/lib/insights/reference";
import { MIN_DAYS, weeklyInsights, type Gap } from "@/lib/insights/weekly";
import { MEAL_LABEL, suggestMealType } from "@/lib/meal-type";
import type { Food, MealType } from "@/lib/nutrition/types";
import { cn } from "@/lib/cn";
import { portionText } from "@/lib/format";

export const metadata = { title: "Insights" };

const fmt = new Intl.NumberFormat("en-IN");
const weekday = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });

/** S09: next-meal ideas, the week's trend, gaps and wins. Rules on your logged meals; no AI. */
export default async function InsightsPage() {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");

  const now = new Date();
  const today = localDate(now, profile.timezone);
  // Weekly numbers use the last 7 completed days; today is still going, so it only
  // appears on the chart (and drives the next-meal ideas).
  const dates = lastNDates(today, 8).slice(0, 7);
  const [meals, foods] = await Promise.all([db.getMealsBetween(userId, dates[0], today), db.listFoods(userId)]);
  const todayMeals = meals.filter((m) => m.localDate === today);

  const week = weeklyInsights({
    dates,
    meals: meals.filter((m) => m.localDate !== today),
    targets: profile.targets,
    sex: profile.sex,
    goal: profile.goal,
    diet: profile.dietType,
    foods,
  });
  const next = nextMealIdeas({
    hourType: suggestMealType(localHour(now, profile.timezone)),
    todayMeals,
    targets: profile.targets,
    diet: profile.dietType,
    foods,
  });
  const t = profile.targets;
  const todayKcal = Math.round(todayMeals.flatMap((m) => m.items).reduce((s, i) => s + i.nutrients.kcal, 0));

  return (
    <Screen>
      <ScreenHeader title="Insights" subtitle="From your logged meals. Free, no AI." />

      <section aria-labelledby="next-heading" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="next-heading" className="text-lg font-semibold">Ideas for {MEAL_LABEL[next.mealType].toLowerCase()}</h2>
          {next.remainingKcal > 0 && <span className="text-sm text-muted tabular-nums">{fmt.format(next.remainingKcal)} kcal left today</span>}
        </div>
        {next.state === "done" ? (
          <p className="rounded-lg bg-surface p-4 text-base">
            You&apos;ve reached today&apos;s calorie target. Still hungry? Salad, a katori of curd or a piece of fruit are light choices.
          </p>
        ) : next.ideas.length === 0 ? (
          <p className="rounded-lg bg-surface p-4 text-sm text-muted">No plate in our list fits what&apos;s left today. Try a light snack like curd or fruit.</p>
        ) : (
          <>
            {next.state === "light" && <p className="text-sm text-muted">Only a little left today, so these are light options.</p>}
            <ul className="flex flex-col gap-3">
              {next.ideas.map((idea) => (
                <li key={idea.title}>
                  <IdeaCard idea={idea} mealType={next.mealType} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="week-heading" className="flex flex-col gap-3">
        <h2 id="week-heading" className="text-lg font-semibold">This week</h2>
        <TrendChart
          kind="bar"
          title="Calories per day"
          unit="kcal"
          target={t.kcal}
          points={[
            ...week.days.map((d) => ({ label: weekday.format(new Date(`${d.date}T00:00:00Z`)), value: d.logged ? d.kcal : null })),
            { label: "Today", value: todayMeals.length ? todayKcal : null },
          ]}
        />
        <p className="text-xs text-muted">Averages use the last 7 full days. Today joins them tomorrow.</p>
        {week.average && (
          <dl className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Avg kcal" value={fmt.format(Math.round(week.average.kcal))} />
            <Stat label="On target" value={`${week.daysOnTarget}/${week.loggedDays} days`} />
            <Stat label="Avg score" value={week.averageScore === null ? "–" : `${week.averageScore}/10`} />
          </dl>
        )}
        {!week.enoughData && (
          <EmptyState
            icon={<Lightbulb />}
            title="More insights after 3 days"
            body={`Log meals on ${MIN_DAYS} different days to see your gaps and wins. ${week.loggedDays === 1 ? "1 full day" : `${week.loggedDays} full days`} logged so far this week.`}
          />
        )}
      </section>

      {week.enoughData && week.average && (
        <>
          <section aria-labelledby="gaps-heading" className="flex flex-col gap-3">
            <h2 id="gaps-heading" className="text-lg font-semibold">Watch out for</h2>
            {week.gaps.length === 0 ? (
              <p className="rounded-lg bg-surface p-4 text-sm">Nothing stands out this week. Nice balance.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {week.gaps.map((gap) => (
                  <li key={gap.id}>
                    <GapCard gap={gap} mealType={next.mealType} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {week.highlights.length > 0 && (
            <section aria-labelledby="wins-heading" className="flex flex-col gap-3">
              <h2 id="wins-heading" className="text-lg font-semibold">Going well</h2>
              <ul className="flex flex-col gap-2">
                {week.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-base">
                    <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="balance-heading" className="flex flex-col gap-4">
            <h2 id="balance-heading" className="text-lg font-semibold">Daily average vs target</h2>
            <MacroBar macro="protein" value={week.average.proteinG} target={t.proteinG} />
            <MacroBar macro="carb" value={week.average.carbG} target={t.carbG} />
            <MacroBar macro="fat" value={week.average.fatG} target={t.fatG} />
            <MacroBar macro="fiber" value={week.average.fiberG} target={t.fiberG} />
          </section>
        </>
      )}

      <p className="text-xs text-muted">
        Insights use estimated values and general guidelines (ICMR-NIN for iron and calcium, WHO for salt). They are for general wellness, not medical advice.
      </p>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-surface px-2 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

const addHref = (query: string, mealType: MealType) => `/log/search?mode=search&meal=${mealType}&items=${encodeURIComponent(query)}`;

function IdeaCard({ idea, mealType }: { idea: MealIdea; mealType: MealType }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-border p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold">{idea.title}</h3>
        <span className="shrink-0 text-sm font-semibold tabular-nums">{fmt.format(Math.round(idea.nutrients.kcal))} kcal</span>
      </div>
      <p className="text-sm text-muted">{idea.items.map((i) => portionText(i.quantity, i.unit, i.food.name)).join(" · ")}</p>
      <p className="text-sm">{idea.reason}</p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted tabular-nums">
          Protein {Math.round(idea.nutrients.proteinG)} g · Fibre {Math.round(idea.nutrients.fiberG)} g
        </span>
        <Link
          href={addHref(ideaToQuery(idea), mealType)}
          // Starts with the visible words, so voice control users can say "Add this" (WCAG 2.5.3; BUG-002).
          aria-label={`Add this to ${MEAL_LABEL[mealType].toLowerCase()}: ${idea.title}`}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pill bg-accent-soft px-4 text-sm font-semibold text-on-accent-soft"
        >
          <Plus aria-hidden className="size-4" /> Add this
        </Link>
      </div>
    </article>
  );
}

function GapCard({ gap, mealType }: { gap: Gap; mealType: MealType }) {
  const Icon = gap.severity === "high" ? CircleAlert : Info;
  return (
    <article className="flex flex-col gap-2 rounded-lg bg-surface p-4">
      <h3 className={cn("flex items-center gap-2 text-base font-semibold", gap.severity === "high" ? "text-danger" : "text-warning")}>
        <Icon aria-hidden className="size-5 shrink-0" />
        {gap.title}
      </h3>
      <p className="text-sm">{gap.detail}</p>
      {gap.tip && <p className="text-sm text-muted">{gap.tip}</p>}
      {gap.foods.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted">Good sources from your food list</p>
          <div className="flex flex-wrap gap-2">
            {gap.foods.map((f) => (
              <FoodChip key={f.id} food={f} mealType={mealType} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function FoodChip({ food, mealType }: { food: Food; mealType: MealType }) {
  return (
    <Link
      href={addHref(`${food.id}:1:${food.defaultUnit}`, mealType)}
      aria-label={`Add ${food.name}`}
      className="inline-flex h-9 items-center gap-1 rounded-pill border border-border bg-bg px-3.5 text-sm font-medium hover:bg-surface"
    >
      <Plus aria-hidden className="size-3.5" /> {food.name}
    </Link>
  );
}
