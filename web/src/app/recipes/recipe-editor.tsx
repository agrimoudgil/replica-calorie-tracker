"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CookingPot } from "lucide-react";
import { CustomFoodForm } from "@/components/custom-food-form";
import { FoodSearchField } from "@/components/food-search";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { EmptyState } from "@/components/ui/feedback";
import { FoodItemRow, type FoodItem } from "@/components/ui/food";
import { BottomSheet, useToast } from "@/components/ui/overlays";
import { MAX_INGREDIENTS, SERVING_UNITS, recipeNumbers } from "@/lib/data/recipe";
import type { Recipe, ServingUnit } from "@/lib/data/types";
import { logHref, type LogTarget } from "@/lib/log-link";
import { changeUnit, defaultQuantity, gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { Food, Unit } from "@/lib/nutrition/types";

type Line = { key: string; food: Food; quantity: number; unit: Unit };

const SERVING_LABEL: Record<ServingUnit, string> = { katori: "1 katori", piece: "1 piece", glass: "1 glass", tbsp: "1 tablespoon" };
const fmt = new Intl.NumberFormat("en-IN");
const round = (n: number) => fmt.format(Math.round(n));

/** S13b: build a recipe from ingredients. One serving's numbers update as you type. */
export function RecipeEditor({ recipe, logTo, back }: { recipe?: Recipe; logTo?: LogTarget; back: string }) {
  const router = useRouter();
  const toast = useToast();
  const unitId = useId();
  const [name, setName] = useState(recipe?.food.name ?? "");
  const [servings, setServings] = useState(String(recipe?.servings ?? 4));
  const [servingUnit, setServingUnit] = useState<ServingUnit>(recipe?.servingUnit ?? "katori");
  const [cooked, setCooked] = useState(recipe?.cookedGrams ? String(recipe.cookedGrams) : "");
  const [lines, setLines] = useState<Line[]>(() => (recipe?.ingredients ?? []).map((i) => ({ key: i.food.id, food: i.food, quantity: i.quantity, unit: i.unit })));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [creatingFood, setCreatingFood] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const servingCount = Number(servings);
  const cookedGrams = cooked.trim() ? Number(cooked) : undefined;
  const numbers = useMemo(
    () =>
      recipeNumbers(
        { servings: servingCount > 0 ? servingCount : 1, cookedGrams: cookedGrams && cookedGrams > 0 ? cookedGrams : undefined, ingredients: lines.map((l) => ({ foodId: l.food.id, quantity: l.quantity, unit: l.unit })) },
        lines.map((l) => l.food),
      ),
    [lines, servingCount, cookedGrams],
  );

  const addIngredient = (food: Food) => {
    setErrors((e) => ({ ...e, ingredients: "" }));
    setLines((list) => {
      const same = list.find((l) => l.food.id === food.id && l.unit === food.defaultUnit);
      if (same) return list.map((l) => (l === same ? { ...l, quantity: l.quantity + defaultQuantity(l.unit) } : l));
      if (list.length >= MAX_INGREDIENTS) return list;
      return [...list, { key: crypto.randomUUID(), food, quantity: defaultQuantity(food.defaultUnit), unit: food.defaultUnit }];
    });
  };

  const editLine = (row: FoodItem) =>
    setLines((list) =>
      list.map((l) => {
        if (l.key !== row.id) return l;
        if (row.unit === l.unit) return { ...l, quantity: row.quantity };
        const grams = gramsFor(l.food, l.unit, l.quantity);
        const converted = changeUnit({ quantity: l.quantity, unit: l.unit, grams, nutrients: nutrientsForGrams(l.food, grams) }, row.unit, l.food);
        return { ...l, quantity: converted.quantity, unit: converted.unit };
      }),
    );

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Give the recipe a name.";
    if (!(servingCount > 0 && servingCount <= 50)) next.servings = "Enter 1 to 50 servings.";
    if (cookedGrams !== undefined && !(cookedGrams >= 1 && cookedGrams <= 50000)) next.cooked = "Enter the weight in grams, or leave it empty.";
    if (!lines.length) next.ingredients = "Add at least one ingredient.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const res = await fetch(recipe ? `/api/recipes/${encodeURIComponent(recipe.food.id)}` : "/api/recipes", {
      method: recipe ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        servings: servingCount,
        servingUnit,
        ...(cookedGrams ? { cookedGrams } : {}),
        ingredients: lines.map((l) => ({ foodId: l.food.id, quantity: l.quantity, unit: l.unit })),
      }),
    }).catch(() => null);
    const body = await res?.json().catch(() => null);
    if (!res?.ok) {
      setSaving(false);
      const detail = body?.fields ? Object.values<string>(body.fields)[0] : undefined;
      return setErrors({ form: res ? (detail ?? body?.message ?? "Couldn't save the recipe. Try again.") : "You seem to be offline. Your recipe is still here; try again." });
    }
    const saved = body as Recipe;
    if (!recipe && logTo) {
      toast.show(`${saved.food.name} saved and added`, { tone: "success" });
      router.push(logHref(logTo, `${saved.food.id}:1:${saved.servingUnit}`));
    } else {
      toast.show(recipe ? `${saved.food.name} updated` : `${saved.food.name} saved`, { tone: "success" });
      router.push(back);
    }
    router.refresh();
  };

  const remove = async () => {
    if (!recipe) return;
    setDeleting(true);
    const res = await fetch(`/api/foods/${encodeURIComponent(recipe.food.id)}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok || res?.status === 404) {
      toast.show(`${recipe.food.name} deleted`);
      router.push("/profile/foods");
      router.refresh();
      return;
    }
    setDeleting(false);
    toast.show("Couldn't delete. Try again.", { tone: "error" });
  };

  const per = numbers.perServing;
  return (
    <>
      <form onSubmit={save} noValidate className="flex flex-col gap-6">
        <TextField label="Recipe name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. My dal tadka" error={errors.name} />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="It makes"
            inputMode="decimal"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            suffix={servingCount === 1 ? "serving" : "servings"}
            error={errors.servings}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor={unitId} className="text-sm font-semibold">One serving is</label>
            <select id={unitId} value={servingUnit} onChange={(e) => setServingUnit(e.target.value as ServingUnit)} className="h-11 rounded-md border border-input bg-bg px-3 text-base">
              {SERVING_UNITS.map((u) => (
                <option key={u} value={u}>{SERVING_LABEL[u]}</option>
              ))}
            </select>
          </div>
        </div>

        <section aria-labelledby="ingredients-heading" className="flex flex-col gap-3">
          <h2 id="ingredients-heading" className="text-lg font-semibold">Ingredients</h2>
          <FoodSearchField
            label="Add an ingredient"
            placeholder="Try toor dal, onion, oil"
            onPick={addIngredient}
            include={(f) => !f.isRecipe}
            emptyMessage={(q) => `Nothing called “${q}”. Try another name, or create it as your own food below.`}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCreatingFood(true)}>Can&apos;t find an ingredient? Create it</Button>
          </div>
          {lines.length === 0 ? (
            <EmptyState icon={<CookingPot />} title="No ingredients yet" body="Add what goes in the pot, with the amounts for the whole recipe." />
          ) : (
            <div className="rounded-lg border border-border px-4">
              {lines.map((l) => (
                <FoodItemRow
                  key={l.key}
                  item={{ id: l.key, name: l.food.name, nameHi: l.food.nameHi, quantity: l.quantity, unit: l.unit, kcal: nutrientsForGrams(l.food, gramsFor(l.food, l.unit, l.quantity)).kcal }}
                  editable
                  onChange={editLine}
                  onRemove={(row) => setLines((list) => list.filter((x) => x.key !== row.id))}
                />
              ))}
            </div>
          )}
          {errors.ingredients && <p role="alert" className="text-sm text-danger">{errors.ingredients}</p>}
        </section>

        <TextField
          label="Cooked weight (optional)"
          inputMode="decimal"
          suffix="g"
          value={cooked}
          onChange={(e) => setCooked(e.target.value)}
          placeholder={numbers.rawGrams ? String(Math.round(numbers.rawGrams)) : "e.g. 900"}
          error={errors.cooked}
          help={`Weigh the finished dish without the pot, so logging it in grams is right too. Empty = the ingredients' weight${numbers.rawGrams ? ` (${round(numbers.rawGrams)} g)` : ""}.`}
        />

        <section aria-labelledby="serving-heading" aria-live="polite" className="flex flex-col gap-1 rounded-lg bg-surface p-4">
          <h2 id="serving-heading" className="text-sm font-semibold text-muted">
            One serving: {SERVING_LABEL[servingUnit]}{lines.length ? `, about ${round(numbers.servingGrams)} g` : ""}
          </h2>
          <p className="text-xl font-bold tabular-nums">{round(per.kcal)} kcal</p>
          <p className="flex flex-wrap gap-x-3 text-sm text-muted tabular-nums">
            <span>Protein {round(per.proteinG)} g</span>
            <span>Carbs {round(per.carbG)} g</span>
            <span>Fat {round(per.fatG)} g</span>
            <span>Fibre {round(per.fiberG)} g</span>
          </p>
          {lines.length > 0 && <p className="text-xs text-muted tabular-nums">Whole recipe: {round(numbers.total.kcal)} kcal</p>}
        </section>

        {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" loading={saving}>{recipe ? "Save changes" : logTo ? "Save and add to meal" : "Save recipe"}</Button>
          {recipe && (
            <Link
              href={`/log/search?mode=search&items=${encodeURIComponent(`${recipe.food.id}:1:${recipe.servingUnit}`)}`}
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-surface px-4 text-sm font-semibold hover:bg-border/60"
            >
              Log {SERVING_LABEL[recipe.servingUnit]} now
            </Link>
          )}
          {recipe && <Button variant="ghost" onClick={() => setConfirmDelete(true)}>Delete recipe</Button>}
          <p className="text-xs text-muted">Only you can see your recipes. Changing one later doesn&apos;t change meals you already logged.</p>
        </div>
      </form>

      {/* Outside the form: the ingredient sheet holds a form of its own. */}
      <BottomSheet open={creatingFood} onClose={() => setCreatingFood(false)} title="Create an ingredient" full>
        {creatingFood && (
          <CustomFoodForm
            onCancel={() => setCreatingFood(false)}
            onCreated={(food) => {
              setCreatingFood(false);
              addIngredient(food);
            }}
          />
        )}
      </BottomSheet>

      {recipe && (
        <BottomSheet open={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)} title={`Delete ${recipe.food.name}?`}>
          <div className="flex flex-col gap-3 pb-2">
            <p className="text-base">It disappears from search. Meals you already logged with it keep their calories.</p>
            <Button variant="danger" size="lg" onClick={remove} loading={deleting}>Delete recipe</Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={deleting}>Keep it</Button>
          </div>
        </BottomSheet>
      )}
    </>
  );
}
