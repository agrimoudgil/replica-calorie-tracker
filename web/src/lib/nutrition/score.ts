import type { Nutrients } from "./types";

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/**
 * Our own 0–10 meal score, computed per 100 kcal so portion size does not matter.
 * Starts at 5. Fibre and protein add up to 2.5 each; sugar and saturated fat take
 * away up to 2 each; sodium up to 1. Unknown values count as neutral.
 * Returns null for things with (almost) no energy, like water or black tea.
 */
export function healthScore(n: Nutrients): number | null {
  if (n.kcal < 10) return null;
  const per100 = (v: number | undefined) => ((v ?? 0) / n.kcal) * 100;

  const fiber = clamp((per100(n.fiberG) / 3) * 2.5, 0, 2.5);
  const protein = clamp((per100(n.proteinG) / 6) * 2.5, 0, 2.5);
  const sugar = n.sugarG === undefined ? 0 : clamp(((per100(n.sugarG) - 2) / 6) * 2, 0, 2);
  const satFat = n.satFatG === undefined ? 0 : clamp(((per100(n.satFatG) - 1) / 3) * 2, 0, 2);
  const sodium = n.sodiumMg === undefined ? 0 : clamp((per100(n.sodiumMg) - 150) / 300, 0, 1);

  return Math.round(clamp(5 + fiber + protein - sugar - satFat - sodium, 0, 10));
}
