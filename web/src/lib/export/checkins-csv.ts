import { toCsv, type Cell } from "@/lib/csv";
import type { CheckIn } from "@/lib/data/types";
import { ENERGY_LABEL, SORENESS_LABEL } from "@/lib/recovery";

export const CHECKIN_HEADER = ["Date", "Sleep (hours)", "Energy (1 to 5)", "Energy", "Soreness (1 to 5)", "Soreness"] as const;

/** One row per recovery check-in, oldest first. Ratings both as numbers (for charts) and words. */
export function checkInsCsv(checkIns: readonly CheckIn[]): string {
  const rows = [...checkIns]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((c): Cell[] => [c.date, c.sleepHours, c.energy, ENERGY_LABEL[c.energy], c.soreness, SORENESS_LABEL[c.soreness]]);
  return toCsv(CHECKIN_HEADER, rows);
}
