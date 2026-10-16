"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthScoreBadge } from "@/components/ui/badges";
import { SegmentedControl } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/feedback";
import { FoodItemRow, type FoodItem } from "@/components/ui/food";
import { useToast } from "@/components/ui/overlays";
import type { Meal, MealItem } from "@/lib/data/types";
import { changeUnit, rescaleItem, sumNutrients } from "@/lib/nutrition/portions";
import { healthScore } from "@/lib/nutrition/score";
import type { MealType, Unit } from "@/lib/nutrition/types";

const MEAL_OPTIONS: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "snack", label: "Snack" },
  { value: "dinner", label: "Dinner" },
];

const fmt = new Intl.NumberFormat("en-IN");

const toRow = (i: MealItem): FoodItem => ({
  id: i.id,
  name: i.name,
  nameHi: i.nameHi,
  quantity: i.quantity,
  unit: i.unit,
  kcal: i.nutrients.kcal,
  confidence: i.aiConfidence,
});

export function ReviewForm({ meal, unitGrams, dayPath = "/" }: { meal: Meal; unitGrams: Record<string, Partial<Record<Unit, number>>>; dayPath?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<MealItem[]>(meal.items);
  const [mealType, setMealType] = useState<MealType>(meal.mealType);
  const [busy, setBusy] = useState<"save" | "discard" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => sumNutrients(items.map((i) => i.nutrients)), [items]);
  const score = items.length ? healthScore(totals) : null;

  const change = (row: FoodItem) =>
    setItems((list) =>
      list.map((i) => {
        if (i.id !== row.id) return i;
        const units = i.foodId ? unitGrams[i.foodId] : undefined;
        const food = units ? { unitGrams: units } : null;
        return row.unit !== i.unit ? changeUnit(i, row.unit, food) : rescaleItem(i, row.quantity, row.unit, food);
      }),
    );

  const remove = (row: FoodItem) => {
    const index = items.findIndex((i) => i.id === row.id);
    const removed = items[index];
    setItems((list) => list.filter((i) => i.id !== row.id));
    toast.show(`${removed.name} removed`, {
      action: {
        label: "Undo",
        onClick: () => setItems((list) => [...list.slice(0, index), removed, ...list.slice(index)]),
      },
    });
  };

  const save = async () => {
    setBusy("save");
    setError(null);
    const res = await fetch(`/api/meals/${meal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealType,
        items: items.map(({ id, quantity, unit }) => ({ id, quantity, unit })),
        expectedUpdatedAt: meal.updatedAt,
      }),
    }).catch(() => null);
    if (res?.ok) {
      router.push(`${dayPath}${dayPath.includes("?") ? "&" : "?"}saved=${meal.id}`);
      router.refresh();
      return;
    }
    setBusy(null);
    const body = await res?.json().catch(() => null);
    const detail = body?.fields ? Object.values<string>(body.fields)[0] : undefined;
    setError(res ? (detail ?? body?.message ?? "Couldn't save. Try again.") : "You seem to be offline. Your changes are still here; try again.");
  };

  const discard = async () => {
    setBusy("discard");
    const res = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" }).catch(() => null);
    if (res && (res.ok || res.status === 404)) {
      router.push(dayPath);
      router.refresh();
      return;
    }
    setBusy(null);
    setError("Couldn't delete. Try again.");
  };

  return (
    <div className="flex flex-col gap-5">
      {meal.aiModel === "demo" && (
        <p className="flex gap-2 rounded-md bg-accent-soft p-3 text-sm text-on-accent-soft">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>Demo estimate: no AI looked at this photo, so these are sample items. Real estimates switch on when an Anthropic API key is added on the server.</span>
        </p>
      )}

      {meal.photoPath && (
        // eslint-disable-next-line @next/next/no-img-element -- private, per-user image route
        <img src={`/api/photos/${meal.id}`} alt="Your meal photo" className="aspect-[4/3] w-full rounded-lg bg-surface object-cover" />
      )}

      <section aria-labelledby="summary-heading" className="flex items-center justify-between gap-3 rounded-lg bg-surface p-4">
        <h2 id="summary-heading" className="sr-only">Meal total</h2>
        <div className="flex flex-col">
          <span className="text-xl font-bold tabular-nums">{fmt.format(Math.round(totals.kcal))} kcal</span>
          <span className="flex flex-wrap gap-x-2 text-sm text-muted tabular-nums">
            {[
              ["Protein", totals.proteinG],
              ["Carbs", totals.carbG],
              ["Fat", totals.fatG],
              ["Fibre", totals.fiberG],
            ].map(([label, value]) => (
              <span key={label} className="whitespace-nowrap">
                {label} {Math.round(value as number)} g
              </span>
            ))}
          </span>
        </div>
        {score !== null && <HealthScoreBadge score={score} />}
      </section>

      <SegmentedControl legend="Which meal?" value={mealType} onChange={setMealType} options={MEAL_OPTIONS} />

      <section aria-labelledby="items-heading" className="flex flex-col gap-2">
        <h2 id="items-heading" className="text-lg font-semibold">What we found</h2>
        {items.length === 0 ? (
          <EmptyState icon={<Utensils />} title="No items left" body="Undo a removal, or discard this meal and try another photo." />
        ) : (
          <div className="rounded-lg border border-border px-4">
            {items.map((item) => (
              <FoodItemRow key={item.id} item={toRow(item)} editable onChange={change} onRemove={remove} />
            ))}
          </div>
        )}
      </section>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={save} loading={busy === "save"} disabled={items.length === 0 || busy !== null}>
          {meal.status === "draft" ? "Save meal" : "Save changes"}
        </Button>
        <Button variant="ghost" onClick={discard} loading={busy === "discard"} disabled={busy !== null}>
          {meal.status === "draft" ? "Discard" : "Delete meal"}
        </Button>
      </div>
    </div>
  );
}
