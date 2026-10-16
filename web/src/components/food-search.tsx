"use client";

import { useRef, useState } from "react";
import { SearchField } from "@/components/ui/fields";
import { gramsFor, nutrientsForGrams } from "@/lib/nutrition/portions";
import type { Food } from "@/lib/nutrition/types";

const fmt = new Intl.NumberFormat("en-IN");

/** Search box over the catalogue and the person's own foods, via /api/foods/search. */
export function FoodSearchField({
  label,
  placeholder = "Try roti, poha, chole",
  onPick,
  autoFocus,
  emptyMessage = (q: string) => `Nothing called “${q}” yet. Try another name, like roti for phulka, or create it as your own food.`,
}: {
  label: string;
  placeholder?: string;
  onPick: (food: Food) => void;
  autoFocus?: boolean;
  emptyMessage?: (q: string) => string;
}) {
  const [results, setResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef("");

  const search = (query: string) => {
    clearTimeout(timer.current);
    latest.current = query.trim();
    if (!latest.current) {
      setSearching(false);
      return setResults([]);
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      const q = latest.current;
      const res = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}`).catch(() => null);
      if (q !== latest.current) return; // a newer search is on its way
      setSearching(false);
      setResults(res?.ok ? ((await res.json()).foods as Food[]) : []);
    }, 200);
  };

  return (
    <SearchField
      label={label}
      placeholder={placeholder}
      filter={false}
      loading={searching}
      autoFocus={autoFocus}
      onQueryChange={search}
      emptyMessage={emptyMessage}
      options={results.map((f) => ({
        id: f.id,
        label: f.ownerId ? `${f.name} (yours)` : f.name,
        detail: `${fmt.format(Math.round(nutrientsForGrams(f, gramsFor(f, f.defaultUnit, 1)).kcal))} kcal / ${f.defaultUnit}`,
      }))}
      onPick={(o) => {
        const food = results.find((f) => f.id === o.id);
        if (food) onPick(food);
      }}
    />
  );
}
