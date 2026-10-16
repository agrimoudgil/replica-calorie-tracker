"use client";

import { useId } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";
import { ConfidenceBadge, HealthScoreBadge, type Confidence } from "./badges";

export const UNITS = ["katori", "piece", "glass", "tbsp", "g"] as const;
export type Unit = (typeof UNITS)[number];

type PortionStepperProps = {
  name: string;
  quantity: number;
  unit: Unit;
  onChange: (quantity: number, unit: Unit) => void;
  step?: number;
  min?: number;
};

export function PortionStepper({ name, quantity, unit, onChange, step = 0.5, min = 0.5 }: PortionStepperProps) {
  const id = useId();
  const invalid = !(quantity >= min);
  return (
    <div className="flex items-center gap-1" role="group" aria-label={`Portion of ${name}`}>
      <IconButton label={`Less ${name}`} tone="surface" disabled={quantity - step < min} onClick={() => onChange(quantity - step, unit)}>
        <Minus aria-hidden className="size-4" />
      </IconButton>
      <label htmlFor={`${id}-q`} className="sr-only">Quantity</label>
      <input
        id={`${id}-q`}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={Number.isFinite(quantity) ? quantity : ""}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(parseFloat(e.target.value), unit)}
        className={cn("h-11 w-14 rounded-md border bg-bg text-center text-base tabular-nums", invalid ? "border-danger" : "border-input")}
      />
      <IconButton label={`More ${name}`} tone="surface" onClick={() => onChange((Number.isFinite(quantity) ? quantity : 0) + step, unit)}>
        <Plus aria-hidden className="size-4" />
      </IconButton>
      <label htmlFor={`${id}-u`} className="sr-only">Unit</label>
      <select
        id={`${id}-u`}
        value={unit}
        onChange={(e) => onChange(quantity, e.target.value as Unit)}
        className="h-11 rounded-md border border-input bg-bg px-2 text-sm"
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>{u}</option>
        ))}
      </select>
    </div>
  );
}

export type FoodItem = {
  id: string;
  name: string;
  nameHi?: string;
  quantity: number;
  unit: Unit;
  kcal: number;
  confidence?: Confidence;
};

type FoodItemRowProps = {
  item: FoodItem;
  editable?: boolean;
  onChange?: (item: FoodItem) => void;
  onRemove?: (item: FoodItem) => void;
};

export function FoodItemRow({ item, editable = false, onChange, onRemove }: FoodItemRowProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0">
      <div className="flex min-h-11 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-semibold">{item.name}</span>
          {item.nameHi && <span lang="hi" className="text-xs text-muted">{item.nameHi}</span>}
          {!editable && (
            <span className="text-sm text-muted">
              {item.quantity} {item.unit}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-sm font-semibold tabular-nums">{Math.round(item.kcal)} kcal</span>
          {editable && onRemove && (
            <IconButton label={`Remove ${item.name}`} onClick={() => onRemove(item)}>
              <Trash2 aria-hidden className="size-4 text-muted" />
            </IconButton>
          )}
        </div>
      </div>
      {editable && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PortionStepper name={item.name} quantity={item.quantity} unit={item.unit} onChange={(quantity, unit) => onChange?.({ ...item, quantity, unit })} />
          {item.confidence && item.confidence !== "high" && <ConfidenceBadge level={item.confidence} />}
        </div>
      )}
    </div>
  );
}

export type MealType = "breakfast" | "lunch" | "snack" | "dinner";
const mealLabel: Record<MealType, string> = { breakfast: "Breakfast", lunch: "Lunch", snack: "Snack", dinner: "Dinner" };

type MealCardProps = {
  type: MealType;
  href?: string;
  items?: string[];
  kcal?: number;
  score?: number;
  onAdd?: () => void;
  loading?: boolean;
};

export function MealCard({ type, href = "#", items = [], kcal = 0, score, onAdd, loading }: MealCardProps) {
  const base = "rounded-lg border border-border bg-bg p-4 shadow-card";
  if (loading) {
    return (
      <div aria-busy="true" aria-label={`Loading ${mealLabel[type]}`} className={cn(base, "flex flex-col gap-2")}>
        <span className="h-4 w-24 animate-pulse rounded-sm bg-surface" />
        <span className="h-3 w-40 animate-pulse rounded-sm bg-surface" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className={cn(base, "flex items-center justify-between gap-3")}>
        <div className="flex flex-col">
          <span className="text-base font-semibold">{mealLabel[type]}</span>
          <span className="text-sm text-muted">Nothing logged yet</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label={`Add ${mealLabel[type].toLowerCase()}`}
          className="inline-flex h-11 items-center gap-1.5 rounded-pill bg-accent-soft px-4 text-sm font-semibold text-on-accent-soft"
        >
          <Plus aria-hidden className="size-4" /> Add
        </button>
      </div>
    );
  }
  return (
    <Link href={href} className={cn(base, "flex flex-col gap-2 transition-colors hover:bg-surface")}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold">{mealLabel[type]}</span>
        <span className="text-sm font-semibold tabular-nums">{Math.round(kcal)} kcal</span>
      </span>
      <span className="line-clamp-2 text-sm text-muted">{items.join(", ")}</span>
      {score !== undefined && <HealthScoreBadge score={score} />}
    </Link>
  );
}
