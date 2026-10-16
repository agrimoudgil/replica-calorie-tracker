"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Salad, Trash2 } from "lucide-react";
import { CustomFoodForm } from "@/components/custom-food-form";
import { Button, IconButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { BottomSheet, useToast } from "@/components/ui/overlays";
import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { Food } from "@/lib/nutrition/types";

const servingText = (f: Food) => (f.defaultUnit === "g" ? "per 100 g" : `per 1 ${f.defaultUnit} (${Math.round(gramsFor(f, f.defaultUnit, 1))} g)`);
const servingKcal = (f: Food) => Math.round(nutrientsForGrams(f, gramsFor(f, f.defaultUnit, f.defaultUnit === "g" ? 100 : 1)).kcal);
const rowClass = "flex min-h-16 items-center justify-between gap-2 border-b border-border px-4 py-2 last:border-b-0";

export function MyFoods({ initial }: { initial: Food[] }) {
  const toast = useToast();
  const [foods, setFoods] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Food | null>(null);
  const [busy, setBusy] = useState(false);
  const recipes = foods.filter((f) => f.isRecipe);
  const plain = foods.filter((f) => !f.isRecipe);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await fetch(`/api/foods/${encodeURIComponent(deleting.id)}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (res?.ok || res?.status === 404) {
      setFoods((list) => list.filter((f) => f.id !== deleting.id));
      toast.show(`${deleting.name} deleted`);
      setDeleting(null);
    } else if (res?.status === 409) {
      // Still an ingredient of a recipe: say which, and keep it.
      const body = await res.json().catch(() => null);
      toast.show(body?.message ?? "It's used in one of your recipes.", { tone: "error" });
      setDeleting(null);
    } else {
      toast.show("Couldn't delete. Try again.", { tone: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3">
        <Link href="/recipes/new" className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-on-accent hover:brightness-110">
          Create a recipe
        </Link>
        <Button variant="secondary" onClick={() => setCreating(true)}>Create a food</Button>
      </div>

      {foods.length === 0 && (
        <EmptyState
          icon={<Salad />}
          title="Nothing here yet"
          body="Save a home recipe (like your dal: toor dal, onion, tomato, oil) or a packaged food, and log it in one tap from Add food."
        />
      )}

      {recipes.length > 0 && (
        <section aria-labelledby="recipes-heading" className="flex flex-col gap-2">
          <h2 id="recipes-heading" className="text-lg font-semibold">Recipes</h2>
          <ul className="flex flex-col rounded-lg border border-border">
            {recipes.map((f) => (
              <li key={f.id} className={rowClass}>
                <Link href={`/recipes/${encodeURIComponent(f.id)}`} className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-1">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-base font-semibold">{f.name}</span>
                    <span className="text-sm text-muted tabular-nums">{servingKcal(f)} kcal {servingText(f)}</span>
                  </span>
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-muted" />
                </Link>
                <Link
                  href={`/log/search?mode=search&items=${encodeURIComponent(`${f.id}:1:${f.defaultUnit}`)}`}
                  aria-label={`Log 1 ${f.defaultUnit} of ${f.name}`}
                  title={`Log 1 ${f.defaultUnit} of ${f.name}`}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-on-accent-soft"
                >
                  <Plus aria-hidden className="size-5" />
                </Link>
                <IconButton label={`Delete ${f.name}`} onClick={() => setDeleting(f)}>
                  <Trash2 aria-hidden className="size-4 text-muted" />
                </IconButton>
              </li>
            ))}
          </ul>
        </section>
      )}

      {plain.length > 0 && (
        <section aria-labelledby="foods-heading" className="flex flex-col gap-2">
          <h2 id="foods-heading" className="text-lg font-semibold">Foods</h2>
          <ul className="flex flex-col rounded-lg border border-border">
            {plain.map((f) => (
              <li key={f.id} className={rowClass}>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-base font-semibold">{f.name}</span>
                  <span className="text-sm text-muted tabular-nums">{servingKcal(f)} kcal {servingText(f)}</span>
                </div>
                <IconButton label={`Delete ${f.name}`} onClick={() => setDeleting(f)}>
                  <Trash2 aria-hidden className="size-4 text-muted" />
                </IconButton>
              </li>
            ))}
          </ul>
        </section>
      )}

      <BottomSheet open={creating} onClose={() => setCreating(false)} title="Create a food" full>
        {creating && (
          <CustomFoodForm
            onCancel={() => setCreating(false)}
            onCreated={(food) => {
              setFoods((list) => [...list, food].sort((a, b) => a.name.localeCompare(b.name)));
              setCreating(false);
              toast.show(`${food.name} saved`, { tone: "success" });
            }}
          />
        )}
      </BottomSheet>

      <BottomSheet open={deleting !== null} onClose={() => !busy && setDeleting(null)} title={deleting ? `Delete ${deleting.name}?` : "Delete food"}>
        <div className="flex flex-col gap-3 pb-2">
          <p className="text-base">It disappears from search. Meals you already logged with it keep their calories.</p>
          <Button variant="danger" size="lg" onClick={remove} loading={busy}>{deleting?.isRecipe ? "Delete recipe" : "Delete food"}</Button>
          <Button variant="ghost" onClick={() => setDeleting(null)} disabled={busy}>Keep it</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
