/**
 * Where to go after saving a new recipe from Add food: back there, with one serving added
 * to the foods already picked (`items`, in Add food's "id:quantity:unit,..." form).
 */
export type LogTarget = { meal?: string; date?: string; items?: string };

/** Add food's address for a log target, optionally with one more food in the meal. */
export function logHref(to: LogTarget, extra?: string): string {
  const items = [to.items, extra].filter(Boolean).join(",");
  const params = new URLSearchParams({ mode: "search", ...(to.meal ? { meal: to.meal } : {}), ...(to.date ? { date: to.date } : {}), ...(items ? { items } : {}) });
  return `/log/search?${params}`;
}
