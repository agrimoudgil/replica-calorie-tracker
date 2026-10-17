import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { isQuickAdd } from "@/lib/data/meal-math";
import type { Meal } from "@/lib/data/types";
import { MEAL_LABEL } from "@/lib/meal-type";
import type { MealType } from "@/lib/nutrition/types";

const fmt = new Intl.NumberFormat("en-IN");
const qty = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/**
 * One meal of the day as a diary section: eaten against this meal's budget, each food
 * as a row (tap to open the meal), and + to add to it. Two lunches show as two groups.
 */
export function MealSection({ type, meals, budget, addHref, time }: { type: MealType; meals: Meal[]; budget: number; addHref: string; time: Intl.DateTimeFormat }) {
  const eaten = Math.round(meals.reduce((s, m) => s + m.items.reduce((t, i) => t + i.nutrients.kcal, 0), 0));
  const label = MEAL_LABEL[type];
  return (
    <section aria-labelledby={`meal-${type}`} className="rounded-lg border border-border bg-bg shadow-card">
      <div className="flex min-h-14 items-center justify-between gap-3 pl-4 pr-2">
        <h3 id={`meal-${type}`} className="text-base font-semibold">{label}</h3>
        <span className="flex items-center gap-1">
          <span className={cn("text-sm tabular-nums", eaten > budget ? "font-semibold text-warning" : "text-muted")}>
            {fmt.format(eaten)} of {fmt.format(budget)} kcal
          </span>
          <Link href={addHref} aria-label={`Add to ${label.toLowerCase()}`} className="grid size-11 place-items-center rounded-pill text-accent hover:bg-accent-soft">
            <Plus aria-hidden className="size-5" />
          </Link>
        </span>
      </div>
      {meals.length === 0 ? (
        <p className="border-t border-border px-4 py-3 text-sm text-muted">Nothing logged yet</p>
      ) : (
        meals.map((m) => (
          <div key={m.id} className="border-t border-border">
            {meals.length > 1 && <p className="px-4 pt-2 text-xs text-muted">{time.format(new Date(m.eatenAt))}</p>}
            <ul>
              {m.items.map((i) => (
                <li key={i.id}>
                  <Link href={`/meals/${m.id}`} className="flex min-h-12 items-center justify-between gap-3 px-4 py-2 hover:bg-surface">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-base">{i.name}</span>
                      <span className="text-sm text-muted">{isQuickAdd(i) ? "Quick add" : `${qty.format(i.quantity)} ${i.unit}`}</span>
                    </span>
                    <span className="shrink-0 text-sm tabular-nums">{fmt.format(Math.round(i.nutrients.kcal))} kcal</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
