import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/screen";
import { HealthScoreBadge } from "@/components/ui/badges";
import { FoodItemRow } from "@/components/ui/food";
import { db } from "@/lib/data";
import { mealTotals } from "@/lib/data/meal-math";
import { currentUserId } from "@/lib/data/session";
import { MEAL_LABEL } from "@/lib/meal-type";

const fmt = new Intl.NumberFormat("en-IN");

/** S08: one saved meal with its items and nutrients. */
export default async function MealPage({ params }: PageProps<"/meals/[id]">) {
  const userId = await currentUserId();
  if (!userId) redirect("/onboarding");
  const meal = await db.getMeal(userId, (await params).id);
  if (!meal) notFound();
  if (meal.status === "draft") redirect(`/log/review/${meal.id}`);

  const profile = await db.getProfile(userId);
  const t = mealTotals(meal);
  const time = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: profile?.timezone,
  }).format(new Date(meal.eatenAt));

  const rows: Array<[string, number | undefined, string]> = [
    ["Protein", t.proteinG, "g"],
    ["Carbs", t.carbG, "g"],
    ["Fat", t.fatG, "g"],
    ["Fibre", t.fiberG, "g"],
    ["Sugar", t.sugarG, "g"],
    ["Saturated fat", t.satFatG, "g"],
    ["Sodium", t.sodiumMg, "mg"],
    ["Calcium", t.calciumMg, "mg"],
    ["Iron", t.ironMg, "mg"],
  ];

  return (
    <Screen>
      <ScreenHeader
        title={MEAL_LABEL[meal.mealType]}
        subtitle={time}
        back="/"
        action={
          <Link href={`/log/review/${meal.id}`} aria-label="Edit meal" className="grid size-11 place-items-center rounded-md hover:bg-surface">
            <Pencil aria-hidden className="size-5" />
          </Link>
        }
      />
      {meal.photoPath && (
        // eslint-disable-next-line @next/next/no-img-element -- private, per-user image route
        <img src={`/api/photos/${meal.id}`} alt={`Photo of your ${MEAL_LABEL[meal.mealType].toLowerCase()}`} className="aspect-[4/3] w-full rounded-lg bg-surface object-cover" />
      )}

      <section className="flex items-center justify-between rounded-lg bg-surface p-4">
        <span className="text-xl font-bold tabular-nums">{fmt.format(Math.round(t.kcal))} kcal</span>
        {meal.healthScore !== null && <HealthScoreBadge score={meal.healthScore} />}
      </section>

      <section aria-labelledby="items-heading" className="flex flex-col gap-2">
        <h2 id="items-heading" className="text-lg font-semibold">Items</h2>
        <div className="rounded-lg border border-border px-4">
          {meal.items.map((i) => (
            <FoodItemRow key={i.id} item={{ id: i.id, name: i.name, nameHi: i.nameHi, quantity: i.quantity, unit: i.unit, kcal: i.nutrients.kcal }} />
          ))}
        </div>
      </section>

      <section aria-labelledby="nutrients-heading" className="flex flex-col gap-2">
        <h2 id="nutrients-heading" className="text-lg font-semibold">Nutrients</h2>
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, value, unit]) => (
              <tr key={label} className="border-b border-border last:border-b-0">
                <th scope="row" className="py-2.5 text-left font-normal text-muted">{label}</th>
                <td className="py-2.5 text-right tabular-nums">{value === undefined ? "–" : `${Math.round(value * 10) / 10} ${unit}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted">Estimates for general wellness, not medical advice.</p>
      </section>
    </Screen>
  );
}
