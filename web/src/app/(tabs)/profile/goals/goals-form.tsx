"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { useToast } from "@/components/ui/overlays";
import { targetsSchema } from "@/lib/api/schemas";
import { MEAL_LABEL, mealBudgets } from "@/lib/meal-type";
import { macroKcal, type Targets } from "@/lib/nutrition/targets";
import { MEAL_TYPES } from "@/lib/nutrition/types";

const FIELDS: Array<{ key: keyof Targets; label: string; suffix: string }> = [
  { key: "kcal", label: "Calories", suffix: "kcal" },
  { key: "proteinG", label: "Protein", suffix: "g" },
  { key: "carbG", label: "Carbs", suffix: "g" },
  { key: "fatG", label: "Fat", suffix: "g" },
  { key: "fiberG", label: "Fibre", suffix: "g" },
];

const fmt = new Intl.NumberFormat("en-IN");
const toDraft = (t: Targets) => Object.fromEntries(FIELDS.map(({ key }) => [key, String(t[key])])) as Record<keyof Targets, string>;

/** Goals & budgets: your own daily targets, or the ones worked out from your body details. */
export function GoalsForm({ current, suggested, custom }: { current: Targets; suggested: Targets; custom: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState(() => toDraft(current));
  const [isCustom, setIsCustom] = useState(custom);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);

  const values = Object.fromEntries(FIELDS.map(({ key }) => [key, draft[key].trim() === "" ? NaN : Number(draft[key])])) as Targets;
  const valid = FIELDS.every(({ key }) => Number.isFinite(values[key]));
  const fromMacros = valid ? macroKcal(values) : null;
  const gap = fromMacros === null ? 0 : fromMacros - values.kcal;

  const send = async (method: "PUT" | "DELETE") => {
    setErrors({});
    setBusy(method === "PUT" ? "save" : "reset");
    const res = await fetch("/api/profile/targets", {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "PUT" ? JSON.stringify(values) : undefined,
    }).catch(() => null);
    setBusy(null);
    const body = await res?.json().catch(() => null);
    if (!res?.ok) {
      return setErrors(body?.fields ?? { form: res ? (body?.message ?? "Couldn't save. Try again.") : "You seem to be offline. Try again." });
    }
    setIsCustom(method === "PUT");
    if (method === "DELETE") setDraft(toDraft(body.targets as Targets));
    toast.show(method === "PUT" ? "Your targets are saved" : "Back to suggested targets", { tone: "success" });
    router.refresh();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const check = targetsSchema.safeParse(values);
    if (!check.success) {
      const next: Record<string, string> = {};
      for (const issue of check.error.issues) next[String(issue.path[0])] ??= issue.message;
      return setErrors(next);
    }
    void send("PUT");
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <p role="status" className="rounded-md bg-surface px-4 py-3 text-sm">
        {isCustom ? "You're using your own targets. Changing your body details won't change them." : "You're using targets worked out from your body details and goal."}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map(({ key, label, suffix }) => (
          <TextField
            key={key}
            label={label}
            suffix={suffix}
            inputMode="numeric"
            value={draft[key]}
            onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
            error={errors[key]}
            className={key === "kcal" ? "col-span-2" : undefined}
          />
        ))}
      </div>

      {fromMacros !== null && (
        <p className={Math.abs(gap) > values.kcal * 0.1 ? "text-sm text-warning" : "text-sm text-muted"}>
          Protein, carbs and fat add up to {fmt.format(Math.round(fromMacros))} kcal
          {Math.abs(gap) > values.kcal * 0.1 ? `, ${fmt.format(Math.abs(Math.round(gap)))} ${gap > 0 ? "more" : "less"} than your calorie target. You can still save.` : "."}
        </p>
      )}

      {valid && values.kcal > 0 && (
        <section aria-labelledby="budgets-heading" className="flex flex-col gap-2">
          <h2 id="budgets-heading" className="text-sm font-semibold">Meal budgets on Today</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {MEAL_TYPES.map((t) => (
              <li key={t} className="flex justify-between rounded-md bg-surface px-3 py-2">
                <span>{MEAL_LABEL[t]}</span>
                <span className="tabular-nums">{fmt.format(mealBudgets(values.kcal)[t])} kcal</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
      <Button type="submit" size="lg" loading={busy === "save"} disabled={busy !== null}>Save my targets</Button>
      {isCustom && (
        <Button variant="ghost" onClick={() => void send("DELETE")} loading={busy === "reset"} disabled={busy !== null}>
          Use suggested targets ({fmt.format(suggested.kcal)} kcal)
        </Button>
      )}
      <p className="text-xs text-muted">
        Suggested from your details: {fmt.format(suggested.kcal)} kcal, protein {suggested.proteinG} g, carbs {suggested.carbG} g, fat {suggested.fatG} g, fibre {suggested.fiberG} g. Estimates for general wellness, not medical advice.
      </p>
    </form>
  );
}
