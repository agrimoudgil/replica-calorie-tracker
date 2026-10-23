"use client";

import { useId, useState, type FormEvent } from "react";
import { MacroInputs, fromDraft, toDraft, type MacroDraft } from "@/components/macro-inputs";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import type { MacroNumbers } from "@/lib/data/types";
import type { Food, Unit } from "@/lib/nutrition/types";

const SERVINGS: Array<{ value: Unit; label: string; hint: string }> = [
  { value: "piece", label: "1 piece", hint: "e.g. one thepla, one laddoo" },
  { value: "katori", label: "1 katori", hint: "a 150 ml bowl" },
  { value: "glass", label: "1 glass", hint: "about 250 ml" },
  { value: "tbsp", label: "1 tablespoon", hint: "about 15 g" },
  { value: "g", label: "100 g", hint: "from a pack label" },
];
const TYPICAL_GRAMS: Record<Unit, string> = { piece: "", katori: "150", glass: "250", tbsp: "15", g: "100" };

/** Starting values, e.g. from a barcode lookup: one serving's unit, weight and numbers. */
export type CustomFoodStart = { name: string; unit: Unit; gramsPerUnit: number; perServing: Partial<MacroNumbers> };

/** Create your own food from one serving's nutrition (e.g. from a pack label or a home recipe). */
export function CustomFoodForm({
  initialName = "",
  start,
  onCreated,
  onCancel,
}: {
  initialName?: string;
  start?: CustomFoodStart;
  onCreated: (food: Food) => void;
  onCancel?: () => void;
}) {
  const unitId = useId();
  const [name, setName] = useState(start?.name ?? initialName);
  const [unit, setUnit] = useState<Unit>(start?.unit ?? "piece");
  const [grams, setGrams] = useState(start && start.unit !== "g" ? String(start.gramsPerUnit) : "");
  const [numbers, setNumbers] = useState<MacroDraft>(toDraft(start?.perServing ?? {}));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Give the food a name.";
    const g = unit === "g" ? 100 : Number(grams);
    if (unit !== "g" && !(g > 0 && g <= 2000)) next.grams = "How many grams is one serving? (1 to 2,000)";
    if (numbers.kcal.trim() === "") next.numbers = "Enter the calories.";
    const parsed = fromDraft(numbers);
    if (!next.numbers && !parsed.value) next.numbers = parsed.error ?? "Check the numbers.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const res = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), unit, gramsPerUnit: g, perServing: parsed.value }),
    }).catch(() => null);
    setBusy(false);
    const body = await res?.json().catch(() => null);
    if (res?.ok) return onCreated(body as Food);
    const detail = body?.fields ? Object.values<string>(body.fields)[0] : undefined;
    setErrors({ form: res ? (detail ?? body?.message ?? "Couldn't save the food. Try again.") : "You seem to be offline. Try again." });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextField label="Food name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Mom's methi thepla" error={errors.name} />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={unitId} className="text-sm font-semibold">One serving is</label>
          <select
            id={unitId}
            value={unit}
            onChange={(e) => {
              const u = e.target.value as Unit;
              setUnit(u);
              if (!grams || Object.values(TYPICAL_GRAMS).includes(grams)) setGrams(TYPICAL_GRAMS[u]);
            }}
            className="h-11 rounded-md border border-input bg-bg px-3 text-base"
          >
            {SERVINGS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <p className="text-xs text-muted">{SERVINGS.find((s) => s.value === unit)?.hint}</p>
        </div>
        {unit !== "g" && (
          <TextField label="Weighs about" suffix="g" inputMode="decimal" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="40" error={errors.grams} />
        )}
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold">Nutrition for {SERVINGS.find((s) => s.value === unit)?.label.toLowerCase()}</legend>
        <MacroInputs value={numbers} onChange={setNumbers} />
        {errors.numbers && <p role="alert" className="text-xs text-danger">{errors.numbers}</p>}
      </fieldset>
      {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
      <Button type="submit" size="lg" loading={busy}>Save food</Button>
      {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
      <p className="text-xs text-muted">Only you can see your foods. They show up in search, Recent and Favourites like any other.</p>
    </form>
  );
}
