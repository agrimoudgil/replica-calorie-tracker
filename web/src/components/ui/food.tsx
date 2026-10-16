"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Minus, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "./button";
import { ConfidenceBadge, HealthScoreBadge, type Confidence } from "./badges";

import { MEAL_LABEL } from "@/lib/meal-type";
import { UNITS, type MealType, type Unit } from "@/lib/nutrition/types";

export { UNITS, type MealType, type Unit };

/** How much one tap of − / + changes the quantity, per unit. */
const UNIT_STEP: Record<Unit, number> = { piece: 1, katori: 0.5, glass: 0.5, tbsp: 1, g: 10 };

type PortionStepperProps = {
  name: string;
  quantity: number;
  unit: Unit;
  onChange: (quantity: number, unit: Unit) => void;
};

export function PortionStepper({ name, quantity, unit, onChange }: PortionStepperProps) {
  const step = UNIT_STEP[unit];
  const min = unit === "g" ? 1 : 0.25;
  const id = useId();
  // While typing, show exactly what was typed (even an empty field); commit valid numbers.
  const [typed, setTyped] = useState<string | null>(null);
  const typedNumber = typed === null ? quantity : parseFloat(typed);
  const invalid = !(typedNumber >= min);
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
        value={typed ?? quantity}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          setTyped(e.target.value);
          const n = parseFloat(e.target.value);
          if (n >= min) onChange(n, unit);
        }}
        onBlur={() => setTyped(null)}
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
  /** Numbers typed by the person: "quick" = a quick add (no portion), "own" = a food with their numbers. */
  entered?: "quick" | "own";
};

type FoodItemRowProps = {
  item: FoodItem;
  editable?: boolean;
  onChange?: (item: FoodItem) => void;
  onRemove?: (item: FoodItem) => void;
  /** Shows a star toggle when given. */
  favourite?: boolean;
  onToggleFavourite?: (item: FoodItem) => void;
  /** Shows a "fix this item" button when given. */
  onEdit?: (item: FoodItem) => void;
};

export function FoodItemRow({ item, editable = false, onChange, onRemove, favourite, onToggleFavourite, onEdit }: FoodItemRowProps) {
  const quick = item.entered === "quick";
  return (
    <div className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0">
      <div className="flex min-h-11 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-base font-semibold">{item.name}</span>
          {item.nameHi && <span lang="hi" className="text-xs text-muted">{item.nameHi}</span>}
          {(!editable || quick) && (
            <span className="text-sm text-muted">{quick ? "Quick add, your numbers" : `${item.quantity} ${item.unit}`}</span>
          )}
          {item.entered === "own" && <span className="text-xs text-muted">Your numbers</span>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="text-sm font-semibold tabular-nums">{Math.round(item.kcal)} kcal</span>
          {onEdit && (
            <IconButton label={`Fix ${item.name}`} onClick={() => onEdit(item)}>
              <Pencil aria-hidden className="size-4 text-muted" />
            </IconButton>
          )}
          {onToggleFavourite && (
            <IconButton
              label={favourite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
              aria-pressed={Boolean(favourite)}
              onClick={() => onToggleFavourite(item)}
            >
              <Star aria-hidden className={cn("size-4", favourite ? "fill-current text-warning" : "text-muted")} />
            </IconButton>
          )}
          {editable && onRemove && (
            <IconButton label={`Remove ${item.name}`} onClick={() => onRemove(item)}>
              <Trash2 aria-hidden className="size-4 text-muted" />
            </IconButton>
          )}
        </div>
      </div>
      {editable && !quick && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <PortionStepper name={item.name} quantity={item.quantity} unit={item.unit} onChange={(quantity, unit) => onChange?.({ ...item, quantity, unit })} />
          {item.confidence && item.confidence !== "high" && <ConfidenceBadge level={item.confidence} />}
        </div>
      )}
    </div>
  );
}

const addClass =
  "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-pill bg-accent-soft px-4 text-sm font-semibold text-on-accent-soft";

const mealLabel = MEAL_LABEL;

type MealCardProps = {
  type: MealType;
  href?: string;
  items?: string[];
  kcal?: number;
  score?: number | null;
  onAdd?: () => void;
  addHref?: string;
  loading?: boolean;
  /** Shown next to the meal name, e.g. the time when a day has two lunches. */
  time?: string;
};

export function MealCard({ type, href = "#", items = [], kcal = 0, score, onAdd, addHref, loading, time }: MealCardProps) {
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
        {addHref ? (
          <Link href={addHref} aria-label={`Add ${mealLabel[type].toLowerCase()}`} className={addClass}>
            <Plus aria-hidden className="size-4" /> Add
          </Link>
        ) : (
          <button type="button" onClick={onAdd} aria-label={`Add ${mealLabel[type].toLowerCase()}`} className={addClass}>
            <Plus aria-hidden className="size-4" /> Add
          </button>
        )}
      </div>
    );
  }
  return (
    <Link href={href} className={cn(base, "flex flex-col gap-2 transition-colors hover:bg-surface")}>
      <span className="flex items-center justify-between gap-2">
        <span className="text-base font-semibold">
          {mealLabel[type]}
          {time && <span className="font-normal text-muted"> · {time}</span>}
        </span>
        <span className="text-sm font-semibold tabular-nums">{Math.round(kcal)} kcal</span>
      </span>
      <span className="line-clamp-2 text-sm text-muted">{items.join(", ")}</span>
      {score !== undefined && score !== null && (
        <span className="self-start">
          <HealthScoreBadge score={score} />
        </span>
      )}
    </Link>
  );
}
