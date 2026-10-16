import { cn } from "@/lib/cn";

export type Macro = "protein" | "carb" | "fat" | "fiber";

const macroColor: Record<Macro, string> = {
  protein: "var(--macro-protein)",
  carb: "var(--macro-carb)",
  fat: "var(--macro-fat)",
  fiber: "var(--macro-fiber)",
};

const macroBg: Record<Macro, string> = {
  protein: "bg-protein",
  carb: "bg-carb",
  fat: "bg-fat",
  fiber: "bg-fiber",
};

const macroLabel: Record<Macro, string> = {
  protein: "Protein",
  carb: "Carbs",
  fat: "Fat",
  fiber: "Fibre",
};

const fmt = new Intl.NumberFormat("en-IN");

type CalorieRingProps = {
  eaten: number;
  target: number;
  size?: "large" | "small";
  macro?: Macro;
  label?: string;
};

export function CalorieRing({ eaten, target, size = "large", macro, label }: CalorieRingProps) {
  const px = size === "large" ? 180 : 56;
  const stroke = size === "large" ? 14 : 6;
  const r = (px - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = target > 0 ? Math.min(eaten / target, 1) : 0;
  const over = target > 0 && eaten > target;
  const left = Math.max(target - eaten, 0);
  const color = over ? "var(--warning)" : macro ? macroColor[macro] : "var(--accent)";
  const summary = over
    ? `${fmt.format(eaten)} of ${fmt.format(target)} kcal eaten, over by ${fmt.format(eaten - target)}`
    : `${fmt.format(eaten)} of ${fmt.format(target)} kcal eaten, ${fmt.format(left)} left`;

  return (
    <div role="img" aria-label={label ?? summary} className="relative inline-grid place-items-center" style={{ width: px, height: px }}>
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden className="-rotate-90">
        <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-[var(--motion-base)]"
        />
      </svg>
      {size === "large" && (
        <div aria-hidden className="absolute inset-0 grid place-content-center text-center">
          <span className="text-display font-bold tabular-nums">{fmt.format(over ? eaten - target : left)}</span>
          <span className="text-xs font-medium text-muted">{over ? "kcal over" : "kcal left"}</span>
        </div>
      )}
    </div>
  );
}

type MacroBarProps = { macro: Macro; value: number; target: number };

export function MacroBar({ macro, value, target }: MacroBarProps) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
  const over = target > 0 && value > target;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{macroLabel[macro]}</span>
        <span className={cn("tabular-nums", over ? "text-warning" : "text-muted")}>
          {Math.round(value)} / {target} g
        </span>
      </div>
      <div
        role="meter"
        aria-label={macroLabel[macro]}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-valuenow={Math.round(value)}
        aria-valuetext={`${Math.round(value)} of ${target} grams`}
        className="h-2 overflow-hidden rounded-pill bg-track"
      >
        <div className={cn("h-full rounded-pill", over ? "bg-warning" : macroBg[macro])} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ProgressSteps({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted">
        Step {step} of {total}
      </p>
      <div aria-hidden className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn("h-1.5 flex-1 rounded-pill", i < step ? "bg-accent" : "bg-track")} />
        ))}
      </div>
    </div>
  );
}
