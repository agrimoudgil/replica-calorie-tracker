"use client";

import { useState } from "react";
import { Salad, Trash2 } from "lucide-react";
import { CustomFoodForm } from "@/components/custom-food-form";
import { Button, IconButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { BottomSheet, useToast } from "@/components/ui/overlays";
import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { Food } from "@/lib/nutrition/types";

const servingText = (f: Food) => (f.defaultUnit === "g" ? "per 100 g" : `per 1 ${f.defaultUnit} (${gramsFor(f, f.defaultUnit, 1)} g)`);
const servingKcal = (f: Food) => Math.round(nutrientsForGrams(f, gramsFor(f, f.defaultUnit, f.defaultUnit === "g" ? 100 : 1)).kcal);

export function MyFoods({ initial }: { initial: Food[] }) {
  const toast = useToast();
  const [foods, setFoods] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Food | null>(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    const res = await fetch(`/api/foods/${encodeURIComponent(deleting.id)}`, { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (res?.ok || res?.status === 404) {
      setFoods((list) => list.filter((f) => f.id !== deleting.id));
      toast.show(`${deleting.name} deleted`);
      setDeleting(null);
    } else {
      toast.show("Couldn't delete. Try again.", { tone: "error" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setCreating(true)}>Create a food</Button>
      {foods.length === 0 ? (
        <EmptyState icon={<Salad />} title="No foods yet" body="Create foods you eat often, like a home recipe or a packaged snack, and they'll show up in search." />
      ) : (
        <ul className="flex flex-col rounded-lg border border-border">
          {foods.map((f) => (
            <li key={f.id} className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-4 py-2 last:border-b-0">
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-base font-semibold">{f.name}</span>
                <span className="text-sm text-muted tabular-nums">
                  {servingKcal(f)} kcal {servingText(f)}
                </span>
              </div>
              <IconButton label={`Delete ${f.name}`} onClick={() => setDeleting(f)}>
                <Trash2 aria-hidden className="size-4 text-muted" />
              </IconButton>
            </li>
          ))}
        </ul>
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
          <Button variant="danger" size="lg" onClick={remove} loading={busy}>Delete food</Button>
          <Button variant="ghost" onClick={() => setDeleting(null)} disabled={busy}>Keep it</Button>
        </div>
      </BottomSheet>
    </div>
  );
}
