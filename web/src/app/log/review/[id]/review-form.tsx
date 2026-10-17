"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Info, Plus, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HealthScoreBadge } from "@/components/ui/badges";
import { SegmentedControl } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/feedback";
import { FoodItemRow, type FoodItem } from "@/components/ui/food";
import { useToast } from "@/components/ui/overlays";
import { cleanMacros, isQuickAdd, itemFromFood, quickAddItem } from "@/lib/data/meal-math";
import type { ItemEdit, MacroNumbers, Meal, MealItem, QuickAdd } from "@/lib/data/types";
import { changeUnit, defaultQuantity, rescaleItem, sumNutrients } from "@/lib/nutrition/portions";
import { healthScore } from "@/lib/nutrition/score";
import type { Food, MealType, Unit } from "@/lib/nutrition/types";
import { markerPosition, photoBoxesKey, readPhotoBoxes } from "@/lib/photo-boxes";
import { AddItemSheet, FixItemSheet, type Fix } from "./item-sheets";
import { PhotoPicker, type PhotoMarker } from "./photo-picker";

const MEAL_OPTIONS: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "snack", label: "Snack" },
  { value: "dinner", label: "Dinner" },
];

const fmt = new Intl.NumberFormat("en-IN");

/**
 * One line of the meal while editing. `item` is the live preview; the other fields say
 * what to send: existing items by id (with any rename / swap / own numbers), new
 * catalogue foods by food id, quick adds as typed. The server recomputes everything.
 */
type Row = {
  key: string;
  kind: "existing" | "food" | "quick";
  item: MealItem;
  food: Pick<Food, "unitGrams"> | null;
  name?: string;
  swapTo?: string;
  override?: MacroNumbers;
  custom?: QuickAdd;
};

const macrosOf = (n: MealItem["nutrients"]): MacroNumbers => ({ kcal: n.kcal, proteinG: n.proteinG, carbG: n.carbG, fatG: n.fatG, fiberG: n.fiberG });

const noSubscribe = () => () => {};
const storedBoxes = (mealId: string) => {
  try {
    return sessionStorage.getItem(photoBoxesKey(mealId));
  } catch {
    return null;
  }
};

const toRow = (r: Row): FoodItem => ({
  id: r.key,
  name: r.item.name,
  nameHi: r.item.nameHi,
  quantity: r.item.quantity,
  unit: r.item.unit,
  kcal: r.item.nutrients.kcal,
  confidence: r.item.aiConfidence,
  entered: isQuickAdd(r.item) ? "quick" : r.item.source === "user" ? "own" : undefined,
});

function toEdit(r: Row): ItemEdit {
  const extra = { ...(r.name ? { name: r.name } : {}), ...(r.override ? { override: r.override } : {}) };
  if (r.kind === "quick") return { custom: r.custom! };
  if (r.kind === "food") return { foodId: r.item.foodId!, quantity: r.item.quantity, unit: r.item.unit, ...extra };
  return { id: r.key, quantity: r.item.quantity, unit: r.item.unit, ...(r.swapTo ? { foodId: r.swapTo } : {}), ...extra };
}

export function ReviewForm({ meal, unitGrams, dayPath = "/" }: { meal: Meal; unitGrams: Record<string, Partial<Record<Unit, number>>>; dayPath?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(() =>
    meal.items.map((item) => ({
      key: item.id,
      kind: "existing" as const,
      item,
      food: item.foodId && unitGrams[item.foodId] ? { unitGrams: unitGrams[item.foodId] } : null,
    })),
  );
  const [mealType, setMealType] = useState<MealType>(meal.mealType);
  const [busy, setBusy] = useState<"save" | "discard" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  /** Rows removed while editing, by key, so a photo marker or Undo can put them back. */
  const [leftOut, setLeftOut] = useState<Record<string, Row>>({});
  const firstOrder = useMemo(() => new Map(meal.items.map((i, n) => [i.id, n])), [meal.items]);
  const orderOf = (key: string) => firstOrder.get(key) ?? Number.MAX_SAFE_INTEGER;
  // Boxes from the photo screen, in this tab only (none on the server's first render).
  const boxesJson = useSyncExternalStore(noSubscribe, () => storedBoxes(meal.id), () => null);
  const photoBoxes = useMemo(() => {
    const parsed = meal.status === "draft" && meal.photoPath ? readPhotoBoxes(boxesJson) : null;
    return parsed && meal.items.filter((i) => parsed.boxes[i.id]).length > 1 ? parsed : null;
  }, [boxesJson, meal]);

  const totals = useMemo(() => sumNutrients(rows.map((r) => r.item.nutrients)), [rows]);
  const score = rows.length ? healthScore(totals) : null;
  const update = (key: string, f: (r: Row) => Row) => setRows((list) => list.map((r) => (r.key === key ? f(r) : r)));

  /** Portion changes rescale the preview; own numbers scale along so what you see is what is saved. */
  const changePortion = (row: FoodItem) =>
    update(row.id, (r) => {
      if (isQuickAdd(r.item)) return r;
      const item = row.unit !== r.item.unit ? changeUnit(r.item, row.unit, r.food) : rescaleItem(r.item, row.quantity, row.unit, r.food);
      return { ...r, item, ...(r.override ? { override: cleanMacros(macrosOf(item.nutrients)) } : {}) };
    });

  const applyFix = (key: string, fix: Fix) => {
    update(key, (r) => {
      let next = { ...r };
      if (fix.swapTo) {
        const f = fix.swapTo;
        next = { ...next, food: f, item: { ...next.item, ...itemFromFood(f, next.item.quantity, next.item.unit), aiConfidence: undefined } };
        if (next.kind === "existing") next.swapTo = f.id;
        next.override = undefined;
      }
      if (fix.name) next = { ...next, name: fix.name, item: { ...next.item, name: fix.name } };
      if (fix.override) {
        const own = cleanMacros(fix.override);
        if (next.kind === "quick") {
          const custom = { ...next.custom!, ...own, name: next.item.name };
          next = { ...next, custom, item: { ...next.item, ...quickAddItem(custom), id: next.item.id, position: next.item.position } };
        } else {
          next = { ...next, override: own, item: { ...next.item, nutrients: { ...next.item.nutrients, ...own }, source: "user", aiConfidence: undefined } };
        }
      } else if (fix.name && next.kind === "quick") {
        next = { ...next, custom: { ...next.custom!, name: fix.name } };
      }
      return next;
    });
    setFixing(null);
  };

  const addFood = (food: Food) => {
    const key = crypto.randomUUID();
    setRows((list) => [...list, { key, kind: "food", food, item: { ...itemFromFood(food, defaultQuantity(food.defaultUnit), food.defaultUnit), id: key, position: list.length } }]);
    setAdding(false);
    toast.show(`${food.name} added`);
  };

  const quickAdd = (q: QuickAdd) => {
    const key = crypto.randomUUID();
    setRows((list) => [...list, { key, kind: "quick", food: null, custom: q, item: { ...quickAddItem(q), id: key, position: list.length } }]);
    setAdding(false);
    toast.show(`${q.name} added`);
  };

  /** Puts a removed row back: the estimate's items in their first order, added foods after them. */
  const restore = (row: Row) => {
    setLeftOut((map) => Object.fromEntries(Object.entries(map).filter(([key]) => key !== row.key)));
    setRows((list) => (list.some((r) => r.key === row.key) ? list : [...list, row].sort((a, b) => orderOf(a.key) - orderOf(b.key))));
  };

  const remove = (row: FoodItem) => {
    const removed = rows.find((r) => r.key === row.id);
    if (!removed) return;
    setRows((list) => list.filter((r) => r.key !== row.id));
    setLeftOut((map) => ({ ...map, [removed.key]: removed }));
    toast.show(`${removed.item.name} removed`, { action: { label: "Undo", onClick: () => restore(removed) } });
  };

  // Tap-to-pick on the photo: numbered markers where the estimate saw each food.
  const markers: PhotoMarker[] = photoBoxes
    ? meal.items
        .filter((i) => photoBoxes.boxes[i.id])
        .map((i, n) => {
          const row = rows.find((r) => r.key === i.id) ?? leftOut[i.id];
          return { key: i.id, n: n + 1, name: row?.item.name ?? i.name, kept: rows.some((r) => r.key === i.id), ...markerPosition(photoBoxes.boxes[i.id], photoBoxes.aspect) };
        })
    : [];
  const markerOf = new Map(markers.map((m) => [m.key, m.n]));
  const togglePick = (key: string) => {
    const kept = rows.find((r) => r.key === key);
    if (kept) remove(toRow(kept));
    else if (leftOut[key]) restore(leftOut[key]);
  };
  const forget = () => {
    try {
      sessionStorage.removeItem(photoBoxesKey(meal.id));
    } catch {
      // nothing stored
    }
  };

  const save = async () => {
    setBusy("save");
    setError(null);
    const res = await fetch(`/api/meals/${meal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealType, items: rows.map(toEdit), expectedUpdatedAt: meal.updatedAt }),
    }).catch(() => null);
    if (res?.ok) {
      forget();
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
      forget();
      router.push(dayPath);
      router.refresh();
      return;
    }
    setBusy(null);
    setError("Couldn't delete. Try again.");
  };

  const fixingRow = rows.find((r) => r.key === fixing) ?? null;

  return (
    <div className="flex flex-col gap-5">
      {meal.aiModel === "demo" && (
        <p className="flex gap-2 rounded-md bg-accent-soft p-3 text-sm text-on-accent-soft">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>Demo estimate: no AI looked at this photo, so these are sample items. Real estimates switch on when an Anthropic API key is added on the server.</span>
        </p>
      )}

      {meal.photoPath && markers.length > 0 && <PhotoPicker src={`/api/photos/${meal.id}`} markers={markers} onToggle={togglePick} />}
      {meal.photoPath && markers.length === 0 && (
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
        <h2 id="items-heading" className="text-lg font-semibold">{meal.status === "draft" && meal.aiModel ? "What we found" : "Items"}</h2>
        {rows.length > 0 && <p className="text-xs text-muted">Wrong item or numbers? Tap the pencil to rename it, swap it or enter your own numbers.</p>}
        {rows.length === 0 ? (
          <EmptyState icon={<Utensils />} title="No items left" body="Add a food below, undo a removal, or discard this meal." />
        ) : (
          <div className="rounded-lg border border-border px-4">
            {rows.map((r) => (
              <FoodItemRow key={r.key} item={{ ...toRow(r), marker: markerOf.get(r.key) }} editable onChange={changePortion} onRemove={remove} onEdit={() => setFixing(r.key)} />
            ))}
          </div>
        )}
        <Button variant="secondary" onClick={() => setAdding(true)} icon={<Plus aria-hidden className="size-4" />}>
          Add a food
        </Button>
      </section>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={save} loading={busy === "save"} disabled={rows.length === 0 || busy !== null}>
          {meal.status === "draft" ? "Save meal" : "Save changes"}
        </Button>
        <Button variant="ghost" onClick={discard} loading={busy === "discard"} disabled={busy !== null}>
          {meal.status === "draft" ? "Discard" : "Delete meal"}
        </Button>
      </div>

      <FixItemSheet
        item={fixingRow?.item ?? null}
        quick={fixingRow ? isQuickAdd(fixingRow.item) : false}
        onApply={(fix) => fixing && applyFix(fixing, fix)}
        onClose={() => setFixing(null)}
      />
      <AddItemSheet open={adding} onAddFood={addFood} onQuickAdd={quickAdd} onClose={() => setAdding(false)} />
    </div>
  );
}
