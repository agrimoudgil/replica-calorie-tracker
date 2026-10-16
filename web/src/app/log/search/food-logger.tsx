"use client";

import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Utensils } from "lucide-react";
import { CustomFoodForm } from "@/components/custom-food-form";
import { FoodSearchField } from "@/components/food-search";
import { QuickAddForm } from "@/components/macro-inputs";
import { Button } from "@/components/ui/button";
import { HealthScoreBadge } from "@/components/ui/badges";
import { Chip, SegmentedControl } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/feedback";
import { FoodItemRow, type FoodItem } from "@/components/ui/food";
import { BottomSheet } from "@/components/ui/overlays";
import { quickAddItem } from "@/lib/data/meal-math";
import type { QuickAdd } from "@/lib/data/types";
import { changeUnit, defaultQuantity, gramsFor, nutrientsForGrams, sumNutrients } from "@/lib/nutrition/portions";
import { healthScore } from "@/lib/nutrition/score";
import type { Food, MealType, Unit } from "@/lib/nutrition/types";
import { portionText } from "@/lib/format";
import type { QuickFood } from "@/lib/recents";

const MEAL_OPTIONS: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "snack", label: "Snack" },
  { value: "dinner", label: "Dinner" },
];

type Line = { key: string; food: Food; quantity: number; unit: Unit };

const fmt = new Intl.NumberFormat("en-IN");
const portion = (l: Pick<Line, "food" | "quantity" | "unit">) => {
  const grams = gramsFor(l.food, l.unit, l.quantity);
  return { grams, nutrients: nutrientsForGrams(l.food, grams) };
};

type FoodLoggerProps = {
  initialMealType: MealType;
  focus: "type" | "search";
  popular: Food[];
  favourites: QuickFood[];
  /** The person's recipes (not already favourites): one tap adds a serving. */
  recipes: QuickFood[];
  recents: QuickFood[];
  favouriteIds: string[];
  /** Foods to start with, e.g. from an insights idea. */
  initialLines?: Array<Omit<Line, "key">>;
  /** Set when adding to a past day: the day, and the usual time for each meal on it. */
  pastDay?: { date: string; eatenAt: Record<MealType, string> };
};

export function FoodLogger({ initialMealType, focus, popular, favourites: initialFavourites, recipes, recents, favouriteIds: initialIds, initialLines = [], pastDay }: FoodLoggerProps) {
  const router = useRouter();
  const textId = useId();
  const [favouriteIds, setFavouriteIds] = useState(() => new Set(initialIds));
  const [favourites, setFavourites] = useState(initialFavourites);
  const [mealType, setMealType] = useState(initialMealType);
  const [text, setText] = useState("");
  const [typed, setTyped] = useState<string[]>([]);
  const [lines, setLines] = useState<Line[]>(() => initialLines.map((l, i) => ({ ...l, key: `start-${i}` })));
  const [quickLines, setQuickLines] = useState<Array<{ key: string; custom: QuickAdd }>>([]);
  const [parsing, setParsing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const mealId = useRef<string | null>(null);

  const totals = useMemo(
    () => sumNutrients([...lines.map((l) => portion(l).nutrients), ...quickLines.map((q) => quickAddItem(q.custom).nutrients)]),
    [lines, quickLines],
  );
  const count = lines.length + quickLines.length;
  const score = count ? healthScore(totals) : null;

  const changeLines = (update: (list: Line[]) => Line[]) => {
    mealId.current = null; // a changed meal is a new save, never a silent retry of the old one
    setError(null);
    setLines(update);
  };

  const addQuick = (custom: QuickAdd) => {
    mealId.current = null;
    setError(null);
    setQuickLines((list) => [...list, { key: crypto.randomUUID(), custom }]);
    setNotice(`Added ${custom.name}.`);
  };

  const add = (food: Food, quantity?: number, unit: Unit = food.defaultUnit) =>
    changeLines((list) => {
      const q = quantity ?? defaultQuantity(unit);
      const same = list.find((l) => l.food.id === food.id && l.unit === unit);
      if (same) return list.map((l) => (l === same ? { ...l, quantity: l.quantity + q } : l));
      return [...list, { key: crypto.randomUUID(), food, quantity: q, unit }];
    });

  /** Stars or un-stars a basket food, updating the Favourites row straight away. */
  const toggleFavourite = async (line: Line) => {
    const on = !favouriteIds.has(line.food.id);
    const apply = (value: boolean) => {
      setFavouriteIds((ids) => {
        const next = new Set(ids);
        if (value) next.add(line.food.id);
        else next.delete(line.food.id);
        return next;
      });
      setFavourites((list) =>
        value
          ? [...list.filter((f) => f.food.id !== line.food.id), { food: line.food, quantity: line.quantity, unit: line.unit, count: 0 }]
          : list.filter((f) => f.food.id !== line.food.id),
      );
    };
    apply(on);
    const res = await fetch(`/api/favourites/${encodeURIComponent(line.food.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favourite: on }),
    }).catch(() => null);
    if (!res?.ok) {
      apply(!on);
      setNotice("Couldn't update favourites. Try again.");
    }
  };

  const findFoods = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return setNotice("Type what you ate first, for example “2 roti and dal”.");
    setParsing(true);
    setNotice(null);
    const res = await fetch("/api/foods/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: value }),
    }).catch(() => null);
    setParsing(false);
    if (!res?.ok) return setNotice(res ? "Couldn't read that. Try shorter phrases separated by commas." : "You seem to be offline.");
    const body: { items: Array<{ food: Food; quantity: number; unit: Unit }>; unmatched: string[] } = await res.json();
    body.items.forEach((i) => add(i.food, i.quantity, i.unit));
    if (body.items.length) {
      setTyped((t) => [...t, value]);
      setText("");
    }
    const added = body.items.length ? `Added ${body.items.length} ${body.items.length === 1 ? "food" : "foods"}.` : "";
    const missing = body.unmatched.length ? ` Couldn't find: ${body.unmatched.join(", ")}. Try searching for ${body.unmatched.length === 1 ? "it" : "them"} below.` : "";
    setNotice((added + missing).trim() || "Couldn't find any foods in that. Try searching below.");
  };

  const editLine = (row: FoodItem) =>
    changeLines((list) =>
      list.map((l) => {
        if (l.key !== row.id) return l;
        if (row.unit === l.unit) return { ...l, quantity: row.quantity };
        const converted = changeUnit({ quantity: l.quantity, unit: l.unit, ...portion(l) }, row.unit, l.food);
        return { ...l, quantity: converted.quantity, unit: converted.unit };
      }),
    );

  const save = async () => {
    setSaving(true);
    setError(null);
    mealId.current ??= crypto.randomUUID();
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: mealId.current,
        mealType,
        inputMethod: typed.length ? "text" : "search",
        rawText: typed.length ? typed.join("; ").slice(0, 1000) : null,
        eatenAt: pastDay ? pastDay.eatenAt[mealType] : new Date().toISOString(),
        items: [...lines.map((l) => ({ foodId: l.food.id, quantity: l.quantity, unit: l.unit })), ...quickLines.map((q) => ({ custom: q.custom }))],
      }),
    }).catch(() => null);
    if (res?.ok) {
      router.push(pastDay ? `/?date=${pastDay.date}&saved=${mealId.current}` : `/?saved=${mealId.current}`);
      router.refresh();
      return;
    }
    setSaving(false);
    const body = await res?.json().catch(() => null);
    const detail = body?.fields ? Object.values<string>(body.fields)[0] : undefined;
    setError(res ? (detail ?? body?.message ?? "Couldn't save. Try again.") : "You seem to be offline. Your foods are still here; try again.");
  };

  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl legend="Which meal?" value={mealType} onChange={setMealType} options={MEAL_OPTIONS} />

      <form onSubmit={findFoods} className="flex flex-col gap-2">
        <label htmlFor={textId} className="text-sm font-semibold">Type what you ate</label>
        <textarea
          id={textId}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          maxLength={500}
          rows={2}
          autoFocus={focus === "type"}
          placeholder="e.g. 2 roti, 1 katori dal aur dahi"
          className="min-h-20 resize-y rounded-md border border-input bg-bg px-3 py-2.5 text-base placeholder:text-muted"
        />
        <Button type="submit" variant="secondary" loading={parsing}>Find foods</Button>
      </form>

      <p role="status" className={notice ? "rounded-md bg-surface px-3 py-2 text-sm" : "sr-only"}>{notice}</p>

      <div className="flex flex-col gap-3">
        <FoodSearchField label="Or search the food list" autoFocus={focus === "search"} onPick={(f) => add(f)} />
        <QuickRow label="Favourites" foods={favourites} onAdd={(q) => add(q.food, q.quantity, q.unit)} />
        <QuickRow label="Your recipes" foods={recipes.filter((r) => !favouriteIds.has(r.food.id))} onAdd={(q) => add(q.food, q.quantity, q.unit)} />
        <QuickRow label="Recent" foods={recents.filter((r) => !favouriteIds.has(r.food.id))} onAdd={(q) => add(q.food, q.quantity, q.unit)} />
        {popular.length > 0 && (
          <QuickRow label="Popular" foods={popular.map((food) => ({ food, quantity: 1, unit: food.defaultUnit, count: 0 }))} onAdd={(q) => add(q.food)} plain />
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCreating(true)}>Can&apos;t find it? Create your own food</Button>
          {/* Carries the foods already picked, so they're still here after the recipe is saved. */}
          <Link
            href={`/recipes/new?${new URLSearchParams({
              from: "log",
              meal: mealType,
              ...(pastDay ? { date: pastDay.date } : {}),
              ...(lines.length ? { items: lines.map((l) => `${l.food.id}:${l.quantity}:${l.unit}`).join(",") } : {}),
            })}`}
            className="inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold text-accent hover:bg-accent-soft"
          >
            Cook it often? Save it as a recipe
          </Link>
        </div>
      </div>

      <details className="group rounded-lg border border-border">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
          Quick add calories and protein
          <ChevronRight aria-hidden className="size-5 text-muted transition-transform group-open:rotate-90" />
        </summary>
        <div className="px-4 pb-4">
          <p className="pb-3 text-sm text-muted">For food you can&apos;t find or weigh, like a canteen thali. Just the numbers you know.</p>
          <QuickAddForm onAdd={addQuick} />
        </div>
      </details>

      <BottomSheet open={creating} onClose={() => setCreating(false)} title="Create your own food" full>
        {/* Mounted only while open, so it starts empty every time. */}
        {creating && (
          <CustomFoodForm
            onCancel={() => setCreating(false)}
            onCreated={(food) => {
              setCreating(false);
              add(food);
              setNotice(`Created ${food.name} and added it. It's in search from now on.`);
            }}
          />
        )}
      </BottomSheet>

      <section aria-labelledby="meal-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="meal-heading" className="text-lg font-semibold">Your meal</h2>
          {score !== null && <HealthScoreBadge score={score} />}
        </div>
        {count === 0 ? (
          <EmptyState icon={<Utensils />} title="Nothing added yet" body="Type your meal above, search, tap a food, or quick add the numbers." />
        ) : (
          <>
            <div className="rounded-lg border border-border px-4">
              {lines.map((l) => (
                <FoodItemRow
                  key={l.key}
                  item={{ id: l.key, name: l.food.name, nameHi: l.food.nameHi, quantity: l.quantity, unit: l.unit, kcal: portion(l).nutrients.kcal }}
                  editable
                  onChange={editLine}
                  onRemove={(row) => changeLines((list) => list.filter((x) => x.key !== row.id))}
                  favourite={favouriteIds.has(l.food.id)}
                  onToggleFavourite={() => toggleFavourite(l)}
                />
              ))}
              {quickLines.map((q) => (
                <FoodItemRow
                  key={q.key}
                  item={{ id: q.key, name: q.custom.name, quantity: 1, unit: "piece", kcal: q.custom.kcal, entered: "quick" }}
                  editable
                  onRemove={() => {
                    mealId.current = null;
                    setQuickLines((list) => list.filter((x) => x.key !== q.key));
                  }}
                />
              ))}
            </div>
            <p className="flex flex-wrap gap-x-2 rounded-lg bg-surface p-4 text-sm text-muted tabular-nums">
              <span className="w-full text-xl font-bold text-fg">{fmt.format(Math.round(totals.kcal))} kcal</span>
              {[
                ["Protein", totals.proteinG],
                ["Carbs", totals.carbG],
                ["Fat", totals.fatG],
                ["Fibre", totals.fiberG],
              ].map(([label, value]) => (
                <span key={label} className="whitespace-nowrap">{label} {Math.round(value as number)} g</span>
              ))}
            </p>
          </>
        )}
      </section>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button size="lg" onClick={save} loading={saving} disabled={count === 0 || saving}>
        Save meal
      </Button>
    </div>
  );
}

/** A labelled row of one-tap chips. Recent and favourite chips add your usual portion. */
function QuickRow({ label, foods, onAdd, plain }: { label: string; foods: QuickFood[]; onAdd: (q: QuickFood) => void; plain?: boolean }) {
  if (!foods.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {foods.map((q) => (
          <Chip key={q.food.id} onClick={() => onAdd(q)}>
            + {plain ? q.food.name : portionText(q.quantity, q.unit, q.food.name)}
          </Chip>
        ))}
      </div>
    </div>
  );
}
