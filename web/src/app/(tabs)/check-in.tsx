"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl, TextField } from "@/components/ui/fields";
import { BottomSheet } from "@/components/ui/overlays";
import type { CheckIn, Rating } from "@/lib/data/types";
import { ENERGY_LABEL, RATINGS, SORENESS_LABEL, sleepText } from "@/lib/recovery";

const fmt = new Intl.NumberFormat("en-IN");

/** What the person ate the day before, against their targets. */
export type DayBefore = { kcal: number; kcalTarget: number; proteinG: number; proteinTarget: number };

/** Today's recovery check-in, next to the calories: last night's sleep, energy and soreness. */
export function CheckInCard({ date, isToday, checkIn, dayBefore }: { date: string; isToday: boolean; checkIn: CheckIn | null; dayBefore: DayBefore | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  return (
    <section aria-labelledby="checkin-heading" className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Moon aria-hidden className="size-5 shrink-0 text-accent" />
          <h2 id="checkin-heading" className="text-base font-semibold">Recovery check-in</h2>
        </div>
        {checkIn ? (
          <Button variant="ghost" aria-label="Edit check-in" onClick={() => setOpen(true)}>Edit</Button>
        ) : (
          <Button variant="secondary" onClick={() => setOpen(true)}>Check in</Button>
        )}
      </div>
      {checkIn ? (
        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Sleep" value={sleepText(checkIn.sleepHours)} />
          <Stat label="Energy" value={ENERGY_LABEL[checkIn.energy]} />
          <Stat label="Soreness" value={SORENESS_LABEL[checkIn.soreness]} />
        </dl>
      ) : (
        <p className="text-sm text-muted">{isToday ? "How did you sleep, and how do you feel today? It takes a few seconds." : "How you slept and felt that day."}</p>
      )}
      {dayBefore && (
        <p className="text-sm text-muted">
          {isToday ? "Yesterday" : "The day before"} you ate <span className="tabular-nums">{fmt.format(Math.round(dayBefore.kcal))}</span> of{" "}
          <span className="tabular-nums">{fmt.format(dayBefore.kcalTarget)}</span> kcal and <span className="tabular-nums">{fmt.format(Math.round(dayBefore.proteinG))}</span> of{" "}
          <span className="tabular-nums">{fmt.format(dayBefore.proteinTarget)}</span> g protein.
        </p>
      )}
      <BottomSheet open={open} onClose={() => setOpen(false)} title={isToday ? "Today's check-in" : "Check-in for this day"}>
        {/* Mounted only while open, so it starts from the saved check-in every time. */}
        {open && (
          <CheckInForm
            date={date}
            checkIn={checkIn}
            // In one transition, so the sheet closes as the card shows the new numbers.
            onDone={() =>
              startTransition(() => {
                setOpen(false);
                router.refresh();
              })
            }
          />
        )}
      </BottomSheet>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-surface px-2 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

const options = (labels: Record<Rating, string>) => RATINGS.map((r) => ({ value: String(r), label: labels[r] }));

function CheckInForm({ date, checkIn, onDone }: { date: string; checkIn: CheckIn | null; onDone: () => void }) {
  const [sleep, setSleep] = useState(checkIn ? String(checkIn.sleepHours) : "");
  const [energy, setEnergy] = useState<Rating | null>(checkIn?.energy ?? null);
  const [soreness, setSoreness] = useState<Rating | null>(checkIn?.soreness ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"save" | "remove" | null>(null);

  const send = async (method: "PUT" | "DELETE", body?: object) => {
    setBusy(method === "PUT" ? "save" : "remove");
    const res = await fetch(`/api/checkins/${date}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    if (res?.ok) return onDone(); // still busy until the sheet closes
    setBusy(null);
    const detail = await res?.json().catch(() => null);
    setErrors({ form: res ? ((detail?.fields && Object.values<string>(detail.fields)[0]) ?? detail?.message ?? "Couldn't save. Try again.") : "You seem to be offline. Try again." });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const hours = Number(sleep.trim().replace(",", "."));
    const next: Record<string, string> = {};
    if (sleep.trim() === "" || !Number.isFinite(hours) || hours < 0 || hours > 16) next.sleep = "Enter the hours you slept, from 0 to 16.";
    if (!energy || !soreness) next.form = `Choose your ${!energy ? "energy" : "soreness"}.`;
    setErrors(next);
    if (Object.keys(next).length) return;
    void send("PUT", { sleepHours: hours, energy, soreness });
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <TextField
        label="Sleep last night"
        suffix="hours"
        inputMode="decimal"
        autoComplete="off"
        placeholder="e.g. 7.5"
        value={sleep}
        onChange={(e) => setSleep(e.target.value)}
        help="Roughly is fine."
        error={errors.sleep}
      />
      <SegmentedControl legend="Energy today" options={options(ENERGY_LABEL)} value={energy ? String(energy) : null} onChange={(v) => setEnergy(Number(v) as Rating)} />
      <SegmentedControl legend="Muscle soreness" options={options(SORENESS_LABEL)} value={soreness ? String(soreness) : null} onChange={(v) => setSoreness(Number(v) as Rating)} />
      {errors.form && <p role="alert" className="text-sm text-danger">{errors.form}</p>}
      <Button type="submit" size="lg" loading={busy === "save"} disabled={busy !== null}>Save check-in</Button>
      {checkIn && (
        <Button variant="ghost" loading={busy === "remove"} disabled={busy !== null} onClick={() => void send("DELETE")}>
          Remove this check-in
        </Button>
      )}
      <p className="text-xs text-muted">Only you can see your check-ins. They sit next to what you ate, so you can spot what helps you feel better.</p>
    </form>
  );
}
