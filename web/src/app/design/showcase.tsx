"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Moon, Salad, Sun, Utensils } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { CalorieRing, MacroBar, ProgressSteps } from "@/components/ui/progress";
import { ConfidenceBadge, HealthScoreBadge } from "@/components/ui/badges";
import { Chip, SearchField, SegmentedControl, Switch, TextField } from "@/components/ui/fields";
import { FoodItemRow, MealCard, type FoodItem } from "@/components/ui/food";
import { AddButton, TabBar } from "@/components/ui/nav";
import { BottomSheet, ToastProvider, useToast } from "@/components/ui/overlays";
import { EmptyState, Skeleton } from "@/components/ui/feedback";
import { PhotoCapture, VoiceButton, type CaptureState, type VoiceState } from "@/components/ui/media";
import { TrendChart } from "@/components/ui/charts";
import { ChatBubble } from "@/components/ui/chat";

const sampleFoods = [
  { id: "1", label: "Phulka (roti)", detail: "1 piece · 85 kcal" },
  { id: "2", label: "Dal tadka", detail: "1 katori · 180 kcal" },
  { id: "3", label: "Poha", detail: "1 plate · 250 kcal" },
  { id: "4", label: "Paneer bhurji", detail: "1 katori · 290 kcal" },
  { id: "5", label: "Curd (dahi)", detail: "1 katori · 100 kcal" },
];

const swatches = [
  "bg", "surface", "border", "border-input", "text", "text-muted", "accent", "on-accent", "accent-soft",
  "focus", "danger", "success", "warning", "macro-protein", "macro-carb", "macro-fat", "macro-fiber",
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={title} className="flex flex-col gap-4 border-t border-border pt-6">
      <h2 id={title} className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Demo() {
  const toast = useToast();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "snack" | "dinner">("lunch");
  const [reminders, setReminders] = useState(true);
  const [chips, setChips] = useState<string[]>(["Vegetarian"]);
  const [sheet, setSheet] = useState(false);
  const [capture, setCapture] = useState<CaptureState>("idle");
  const [voice, setVoice] = useState<VoiceState>("idle");
  const [items, setItems] = useState<FoodItem[]>([
    { id: "a", name: "Phulka", nameHi: "फुलका", quantity: 2, unit: "piece", kcal: 170, confidence: "high" },
    { id: "b", name: "Dal tadka", nameHi: "दाल तड़का", quantity: 1, unit: "katori", kcal: 180, confidence: "medium" },
    { id: "c", name: "Mixed sabzi", quantity: 1, unit: "katori", kcal: 140, confidence: "low" },
  ]);

  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [theme]);

  return (
    <main className="mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-8 px-4 pb-40 pt-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Design system</h1>
          <p className="text-sm text-muted">Every primitive, built once, before any screen. Placeholder accent until branding.</p>
        </div>
        <IconButton label={theme === "dark" ? "Use light theme" : "Use dark theme"} tone="surface" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
          {theme === "dark" ? <Sun aria-hidden className="size-5" /> : <Moon aria-hidden className="size-5" />}
        </IconButton>
      </header>

      <Section title="Colour roles">
        <ul className="grid grid-cols-3 gap-2">
          {swatches.map((s) => (
            <li key={s} className="flex flex-col gap-1">
              <span className="h-10 rounded-sm border border-border" style={{ background: `var(--${s})` }} />
              <span className="text-xs text-muted">{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type scale">
        <p className="text-display font-bold">1,240</p>
        <p className="text-xl font-bold">Good afternoon</p>
        <p className="text-lg font-semibold">Lunch</p>
        <p className="text-base">2 phulka, dal tadka and a katori of curd.</p>
        <p className="text-sm text-muted">Logged at 1:30 pm · photo</p>
        <p className="text-xs font-medium text-muted">STEP 2 OF 5</p>
        <p lang="hi" className="text-base">दाल तड़का, फुलका, दही</p>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-2">
          <Button>Save meal</Button>
          <Button variant="secondary">Edit</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="danger">Delete</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
        <Button size="lg" onClick={() => toast.show("Lunch saved · 490 kcal", { tone: "success", action: { label: "Undo", onClick: () => toast.show("Lunch removed") } })}>
          Save and show toast
        </Button>
      </Section>

      <Section title="Rings and macros">
        <div className="flex items-center justify-around">
          <CalorieRing eaten={1240} target={1900} />
          <div className="flex flex-col gap-3">
            <CalorieRing eaten={42} target={90} size="small" macro="protein" label="Protein 42 of 90 g" />
            <CalorieRing eaten={2100} target={1900} size="small" label="2,100 of 1,900 kcal, over" />
          </div>
        </div>
        <MacroBar macro="protein" value={42} target={90} />
        <MacroBar macro="carb" value={160} target={220} />
        <MacroBar macro="fat" value={68} target={60} />
        <MacroBar macro="fiber" value={11} target={30} />
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          <HealthScoreBadge score={8} />
          <HealthScoreBadge score={5} />
          <HealthScoreBadge score={2} />
          <ConfidenceBadge level="high" />
          <ConfidenceBadge level="medium" />
          <ConfidenceBadge level="low" />
        </div>
      </Section>

      <Section title="Meal cards">
        <MealCard type="breakfast" items={["Poha", "Masala chai"]} kcal={340} score={7} />
        <MealCard type="lunch" onAdd={() => toast.show("Opens the log menu")} />
        <MealCard type="dinner" loading />
      </Section>

      <Section title="Food items (review screen)">
        <div className="rounded-lg border border-border px-4">
          {items.map((item) => (
            <FoodItemRow
              key={item.id}
              item={item}
              editable
              onChange={(next) => setItems((list) => list.map((x) => (x.id === next.id ? next : x)))}
              onRemove={(gone) => {
                setItems((list) => list.filter((x) => x.id !== gone.id));
                toast.show(`${gone.name} removed`, { action: { label: "Undo", onClick: () => setItems((list) => [...list, gone]) } });
              }}
            />
          ))}
        </div>
        <FoodItemRow item={{ id: "d", name: "Curd (dahi)", quantity: 1, unit: "katori", kcal: 100 }} />
      </Section>

      <Section title="Fields">
        <TextField label="Weight" suffix="kg" inputMode="decimal" defaultValue="68.5" help="Weigh in the morning for steady numbers." />
        <TextField label="Height" suffix="cm" inputMode="numeric" defaultValue="17" error="Enter a height between 50 and 260 cm." />
        <TextField label="Name" placeholder="What should we call you?" />
        <TextField label="Email" defaultValue="you@example.com" disabled />
        <SearchField label="Search foods" placeholder="Try roti, dal, poha" options={sampleFoods} onPick={(o) => toast.show(`Added ${o.label}`)} />
        <SegmentedControl
          legend="Meal"
          value={mealType}
          onChange={setMealType}
          options={[
            { value: "breakfast", label: "Breakfast" },
            { value: "lunch", label: "Lunch" },
            { value: "snack", label: "Snack" },
            { value: "dinner", label: "Dinner" },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          {["Vegetarian", "High protein", "Under 400 kcal", "Jain"].map((c) => (
            <Chip key={c} selected={chips.includes(c)} onClick={() => setChips((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))}>
              {c}
            </Chip>
          ))}
          <Chip disabled>Disabled</Chip>
        </div>
        <Switch label="Meal reminders" checked={reminders} onChange={setReminders} />
        <Switch label="Auto-log from gallery (app only)" checked={false} onChange={() => {}} disabled />
      </Section>

      <Section title="Photo and voice">
        <SegmentedControl
          legend="Photo state"
          value={capture}
          onChange={setCapture}
          options={[
            { value: "idle", label: "Idle" },
            { value: "uploading", label: "Upload" },
            { value: "denied", label: "Denied" },
            { value: "not-food", label: "No food" },
          ]}
        />
        <PhotoCapture state={capture} progress={60} onFile={() => setCapture("uploading")} />
        <SegmentedControl
          legend="Voice state"
          value={voice}
          onChange={setVoice}
          options={[
            { value: "idle", label: "Idle" },
            { value: "listening", label: "Listen" },
            { value: "processing", label: "Busy" },
            { value: "unsupported", label: "None" },
          ]}
        />
        <VoiceButton
          state={voice}
          transcript={voice === "listening" || voice === "processing" ? "Do roti, ek katori dal aur salad" : undefined}
          onToggle={() => setVoice((v) => (v === "listening" ? "processing" : "listening"))}
        />
      </Section>

      <Section title="Sheet">
        <Button variant="secondary" onClick={() => setSheet(true)}>Open bottom sheet</Button>
        <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Log a meal">
          <p className="pb-4 text-sm text-muted">Choose how you want to log it. Esc or the close button returns focus to the opener.</p>
          <Button size="lg" onClick={() => setSheet(false)}>Done</Button>
        </BottomSheet>
      </Section>

      <Section title="Charts">
        <TrendChart
          kind="bar"
          title="Calories this week"
          unit="kcal"
          target={1900}
          points={[
            { label: "Mon", value: 1820 },
            { label: "Tue", value: 2050 },
            { label: "Wed", value: 1700 },
            { label: "Thu", value: 1950 },
            { label: "Fri", value: 1600 },
            { label: "Sat", value: null },
            { label: "Sun", value: 1240 },
          ]}
        />
        <TrendChart
          kind="line"
          title="Weight"
          unit="kg"
          points={[
            { label: "W1", value: 70.2 },
            { label: "W2", value: 69.8 },
            { label: "W3", value: 69.5 },
            { label: "W4", value: 69.1 },
            { label: "W5", value: 68.5 },
          ]}
        />
        <TrendChart kind="line" title="Weigh-ins" unit="kg" points={[]} />
      </Section>

      <Section title="Chat">
        <div role="log" aria-live="polite" className="flex flex-col gap-3">
          <ChatBubble role="user">I have 600 kcal left. Veg dinner ideas?</ChatBubble>
          <ChatBubble role="assistant">Try moong dal chilla with mint chutney (about 350 kcal, 18 g protein), plus a katori of curd.</ChatBubble>
          <ChatBubble role="assistant" state="streaming">Or a paneer tikka salad</ChatBubble>
          <ChatBubble role="user" state="error" onRetry={() => toast.show("Retrying…")}>And something sweet?</ChatBubble>
        </div>
      </Section>

      <Section title="Empty and loading">
        <EmptyState icon={<Utensils />} title="No meals yet today" body="Snap your plate or say what you ate. It takes about ten seconds." action={<Button>Log a meal</Button>} />
        <EmptyState icon={<Salad />} title="Not enough data yet" body="Log meals on three days to see your first weekly insight." />
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading">
          <Skeleton shape="ring" className="self-center" />
          <Skeleton />
          <Skeleton className="w-2/3" />
          <Skeleton shape="card" />
        </div>
      </Section>

      <Section title="Onboarding progress">
        <ProgressSteps step={2} total={5} />
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-[var(--content-max)] justify-end px-4 pb-3">
          <AddButton onPick={(m) => toast.show(`Log by ${m}`)} />
        </div>
        <TabBar current="/" />
      </div>
    </main>
  );
}

export function Showcase() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}
