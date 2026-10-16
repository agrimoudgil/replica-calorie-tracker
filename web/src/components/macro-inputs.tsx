"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import type { MacroNumbers, QuickAdd } from "@/lib/data/types";

export type MacroDraft = Record<keyof MacroNumbers, string>;

export const toDraft = (m: Partial<MacroNumbers>): MacroDraft => ({
  kcal: m.kcal === undefined ? "" : String(Math.round(m.kcal)),
  proteinG: m.proteinG === undefined ? "" : String(Math.round(m.proteinG * 10) / 10),
  carbG: m.carbG === undefined ? "" : String(Math.round(m.carbG * 10) / 10),
  fatG: m.fatG === undefined ? "" : String(Math.round(m.fatG * 10) / 10),
  fiberG: m.fiberG === undefined ? "" : String(Math.round(m.fiberG * 10) / 10),
});

/** Parses typed numbers; blank counts as 0. Returns an error message for anything else odd. */
export function fromDraft(d: MacroDraft): { value?: MacroNumbers; error?: string } {
  const out = {} as MacroNumbers;
  for (const key of Object.keys(d) as Array<keyof MacroNumbers>) {
    const raw = d[key].trim();
    const n = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(n) || n < 0) return { error: "Use numbers of zero or more." };
    out[key] = n;
  }
  if (out.kcal > 5000) return { error: "Calories look too high for one item." };
  return { value: out };
}

const FIELDS: Array<[keyof MacroNumbers, string, string]> = [
  ["kcal", "Calories", "kcal"],
  ["proteinG", "Protein", "g"],
  ["carbG", "Carbs", "g"],
  ["fatG", "Fat", "g"],
  ["fiberG", "Fibre", "g"],
];

/** Calories, protein, carbs, fat and fibre inputs in a compact grid. */
export function MacroInputs({ value, onChange, required = ["kcal"] }: { value: MacroDraft; onChange: (d: MacroDraft) => void; required?: Array<keyof MacroNumbers> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {FIELDS.map(([key, label, unit]) => (
        <TextField
          key={key}
          label={required.includes(key) ? label : `${label} (optional)`}
          suffix={unit}
          inputMode="decimal"
          value={value[key]}
          onChange={(e) => onChange({ ...value, [key]: e.target.value })}
          className={key === "kcal" ? "col-span-2" : undefined}
        />
      ))}
    </div>
  );
}

/** "Quick add": a name and the numbers, when a food can't be found or weighed. */
export function QuickAddForm({ onAdd, submitLabel = "Add" }: { onAdd: (q: QuickAdd) => void; submitLabel?: string }) {
  const [name, setName] = useState("");
  const [numbers, setNumbers] = useState<MacroDraft>(toDraft({}));
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (numbers.kcal.trim() === "") return setError("Enter the calories.");
    const parsed = fromDraft(numbers);
    if (!parsed.value) return setError(parsed.error ?? "Check the numbers.");
    onAdd({ name: name.trim() || "Quick add", ...parsed.value });
    setName("");
    setNumbers(toDraft({}));
    setError(null);
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <TextField label="What was it? (optional)" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder="e.g. Office canteen thali" />
      <MacroInputs value={numbers} onChange={setNumbers} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" variant="secondary">{submitLabel}</Button>
    </form>
  );
}
