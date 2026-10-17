import { cn } from "@/lib/cn";

const pill = "inline-flex items-center gap-1 rounded-pill bg-surface px-2.5 py-1 text-xs font-medium";

export function HealthScoreBadge({ score }: { score: number }) {
  const tone = score <= 3 ? "text-danger" : score <= 6 ? "text-warning" : "text-success";
  // role="img": a plain span may not carry aria-label, so screen readers could skip it (BUG-003).
  return (
    <span role="img" className={cn(pill, tone)} aria-label={`Health score ${score} of 10`}>
      <span aria-hidden>Score</span>
      <span aria-hidden className="tabular-nums font-semibold">{score}/10</span>
    </span>
  );
}

export type Confidence = "high" | "medium" | "low";

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const tone = level === "high" ? "text-success" : level === "medium" ? "text-warning" : "text-danger";
  const text = level === "high" ? "Confident" : level === "medium" ? "Check portion" : "Unsure";
  return (
    <span className={cn(pill, tone)}>
      <span aria-hidden className="size-1.5 rounded-pill bg-current" />
      {text}
    </span>
  );
}
