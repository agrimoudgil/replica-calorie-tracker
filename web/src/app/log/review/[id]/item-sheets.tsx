"use client";

import { useState } from "react";
import { FoodSearchField } from "@/components/food-search";
import { MacroInputs, QuickAddForm, fromDraft, toDraft, type MacroDraft } from "@/components/macro-inputs";
import { Button } from "@/components/ui/button";
import { SegmentedControl, TextField } from "@/components/ui/fields";
import { BottomSheet } from "@/components/ui/overlays";
import { itemFromFood } from "@/lib/data/meal-math";
import type { MacroNumbers, MealItem, QuickAdd } from "@/lib/data/types";
import type { Food } from "@/lib/nutrition/types";

export type Fix = { name?: string; swapTo?: Food; override?: MacroNumbers };

const macrosOf = (n: MealItem["nutrients"]): MacroNumbers => ({ kcal: n.kcal, proteinG: n.proteinG, carbG: n.carbG, fatG: n.fatG, fiberG: n.fiberG });

/**
 * "Fix this item": rename it, swap it for a food from the list, and/or type your own
 * numbers for the portion you ate. Numbers count as yours only if you change them.
 */
export function FixItemSheet({ item, quick, onApply, onClose }: { item: MealItem | null; quick: boolean; onApply: (fix: Fix) => void; onClose: () => void }) {
  return (
    <BottomSheet open={item !== null} onClose={onClose} title={item ? `Fix ${item.name}` : "Fix item"} full>
      {/* Re-mount per item so the form starts from that item's values. */}
      {item && <FixItemForm key={item.id} item={item} quick={quick} onApply={onApply} onClose={onClose} />}
    </BottomSheet>
  );
}

function FixItemForm({ item, quick, onApply, onClose }: { item: MealItem; quick: boolean; onApply: (fix: Fix) => void; onClose: () => void }) {
  const [name, setName] = useState(item.name);
  const [swapTo, setSwapTo] = useState<Food | null>(null);
  const [numbers, setNumbers] = useState<MacroDraft>(toDraft(macrosOf(item.nutrients)));
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show the numbers the item will really have: the swapped food's, for this portion.
  const swap = (food: Food | null) => {
    setSwapTo(food);
    setName(food ? food.name : item.name);
    setNumbers(toDraft(macrosOf(food ? itemFromFood(food, item.quantity, item.unit).nutrients : item.nutrients)));
    setTouched(false);
    setError(null);
  };

  const apply = () => {
    const fix: Fix = {};
    if (name.trim() && name.trim() !== item.name) fix.name = name.trim();
    if (swapTo) fix.swapTo = swapTo;
    if (touched) {
      const parsed = fromDraft(numbers);
      if (!parsed.value) return setError(parsed.error ?? "Check the numbers.");
      fix.override = parsed.value;
    }
    onApply(fix);
  };

  return (
    <div className="flex flex-col gap-5 pb-2">
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />

      {!quick && (
        <div className="flex flex-col gap-2">
          <FoodSearchField label="Wrong food? Swap it for one from the list" onPick={swap} />
          {swapTo && (
            <p role="status" className="rounded-md bg-accent-soft px-3 py-2 text-sm text-on-accent-soft">
              Will become <strong>{swapTo.name}</strong>, {item.quantity} {item.unit}, with its calories from the food list.{" "}
              <button type="button" className="font-semibold underline" onClick={() => swap(null)}>Undo swap</button>
            </p>
          )}
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">
          {quick ? "Numbers" : `Your own numbers for this portion (${item.quantity} ${item.unit}, about ${Math.round(item.grams)} g)`}
        </legend>
        {!quick && <p className="text-xs text-muted">Only change these if you know better, for example from a food label. Otherwise leave them.</p>}
        <MacroInputs value={numbers} onChange={(d) => { setNumbers(d); setTouched(true); }} />
      </fieldset>

      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex flex-col gap-2">
        <Button size="lg" onClick={apply}>Apply</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

/** "Add a food" to a meal: search the list, or quick-add by hand. */
export function AddItemSheet({ open, onAddFood, onQuickAdd, onClose }: { open: boolean; onAddFood: (f: Food) => void; onQuickAdd: (q: QuickAdd) => void; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Add a food" full>
      {/* Mounted only while open, so every time starts fresh on Search. */}
      {open && <AddItemBody onAddFood={onAddFood} onQuickAdd={onQuickAdd} />}
    </BottomSheet>
  );
}

function AddItemBody({ onAddFood, onQuickAdd }: { onAddFood: (f: Food) => void; onQuickAdd: (q: QuickAdd) => void }) {
  const [mode, setMode] = useState<"search" | "quick">("search");
  return (
    <>
      <div className="flex flex-col gap-5 pb-2">
        <SegmentedControl
          legend="How?"
          value={mode}
          onChange={setMode}
          options={[
            { value: "search", label: "Search" },
            { value: "quick", label: "Quick add" },
          ]}
        />
        {mode === "search" ? (
          <FoodSearchField label="Search the food list" onPick={onAddFood} autoFocus />
        ) : (
          <QuickAddForm onAdd={onQuickAdd} submitLabel="Add to meal" />
        )}
      </div>
    </>
  );
}
