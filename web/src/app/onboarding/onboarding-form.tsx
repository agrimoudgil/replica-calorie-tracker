"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SegmentedControl, TextField } from "@/components/ui/fields";
import { profileSchema } from "@/lib/api/schemas";
import type { Profile } from "@/lib/data/types";
import type { DietType } from "@/lib/nutrition/types";
import type { ActivityLevel, Goal, Sex } from "@/lib/nutrition/targets";

const ACTIVITY: Array<{ value: ActivityLevel; label: string }> = [
  { value: "sedentary", label: "Mostly sitting" },
  { value: "light", label: "Light: 1–3 workouts a week" },
  { value: "moderate", label: "Active: 3–5 workouts a week" },
  { value: "active", label: "Very active: 6–7 workouts" },
  { value: "very_active", label: "Athlete or physical job" },
];

const DIETS: Array<{ value: DietType; label: string }> = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "eggetarian", label: "Eggetarian" },
  { value: "non_vegetarian", label: "Non-vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "jain", label: "Jain" },
];

const num = (v: string) => (v.trim() === "" ? undefined : Number(v));

export function OnboardingForm({ initial }: { initial: Profile | null }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.displayName ?? "");
  const [sex, setSex] = useState<Sex>(initial?.sex ?? "female");
  const [birthYear, setBirthYear] = useState(initial ? String(initial.birthYear) : "");
  const [height, setHeight] = useState(initial ? String(initial.heightCm) : "");
  const [weight, setWeight] = useState(initial ? String(initial.weightKg) : "");
  const [activity, setActivity] = useState<ActivityLevel>(initial?.activityLevel ?? "light");
  const [goal, setGoal] = useState<Goal>(initial?.goal ?? "maintain");
  const [diet, setDiet] = useState<DietType>(initial?.dietType ?? "vegetarian");
  const [consent, setConsent] = useState(Boolean(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload = {
      displayName: name,
      sex,
      birthYear: num(birthYear),
      heightCm: num(height),
      weightKg: num(weight),
      activityLevel: activity,
      goal,
      dietType: diet,
      consent,
    };
    const check = profileSchema().safeParse(payload);
    if (!check.success) {
      const next: Record<string, string> = {};
      for (const issue of check.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => null);
    setBusy(false);
    if (!res) return setFormError("You seem to be offline. Check your connection and try again.");
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (body?.fields) setErrors(body.fields);
      return setFormError(body?.message ?? "Couldn't save. Try again.");
    }
    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <TextField label="What should we call you? (optional)" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="given-name" error={errors.displayName} />

      <SegmentedControl
        legend="Sex (for the calorie formula)"
        value={sex}
        onChange={setSex}
        options={[
          { value: "female", label: "Female" },
          { value: "male", label: "Male" },
          { value: "other", label: "Other" },
        ]}
      />

      <div className="grid grid-cols-3 gap-3">
        <TextField label="Birth year" inputMode="numeric" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} placeholder="1995" error={errors.birthYear} />
        <TextField label="Height" suffix="cm" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="165" error={errors.heightCm} />
        <TextField label="Weight" suffix="kg" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="62" error={errors.weightKg} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="activity" className="text-sm font-semibold">How active are you?</label>
        <select id="activity" value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)} className="h-11 rounded-md border border-input bg-bg px-3 text-base">
          {ACTIVITY.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>

      <SegmentedControl
        legend="Your goal"
        value={goal}
        onChange={setGoal}
        options={[
          { value: "lose", label: "Lose weight" },
          { value: "maintain", label: "Maintain" },
          { value: "gain", label: "Gain" },
        ]}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="diet" className="text-sm font-semibold">What do you eat?</label>
        <select id="diet" value={diet} onChange={(e) => setDiet(e.target.value as DietType)} className="h-11 rounded-md border border-input bg-bg px-3 text-base">
          {DIETS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <p className="text-xs text-muted">Helps us tell paneer from chicken in photos and suggest meals you eat.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex min-h-11 items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
            className="mt-0.5 size-5 shrink-0 accent-[var(--accent)]"
          />
          <span>
            I agree that my body details, meals and meal photos are stored to give me estimates and insights. Estimates are for general wellness, not medical advice. I can delete everything at any time.
          </span>
        </label>
        {errors.consent && <p id="consent-error" className="text-xs text-danger">{errors.consent}</p>}
      </div>

      {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}

      <Button type="submit" size="lg" loading={busy}>
        {initial ? "Save changes" : "Work out my target"}
      </Button>
    </form>
  );
}
