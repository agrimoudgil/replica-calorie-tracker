/*
 * Where each estimated food sits in the meal photo, so the review screen can put a
 * numbered marker on it. Boxes are fractions of the photo's width and height
 * (x, y = top-left corner). They are kept in the browser tab only (sessionStorage),
 * for the review right after the photo; without them the review is the plain list.
 */

export type Box = { x: number; y: number; w: number; h: number };
export type PhotoBoxes = { aspect: number; boxes: Record<string, Box> };

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const round4 = (n: number) => Math.round(n * 10_000) / 10_000;

/** A box inside the photo with some area, or null. */
export function cleanBox(raw: unknown): Box | null {
  if (!raw || typeof raw !== "object") return null;
  const { x, y, w, h } = raw as Record<string, unknown>;
  if (![x, y, w, h].every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  const left = clamp01(x as number);
  const top = clamp01(y as number);
  const box = { x: round4(left), y: round4(top), w: round4(clamp01((x as number) + (w as number)) - left), h: round4(clamp01((y as number) + (h as number)) - top) };
  return box.w > 0.01 && box.h > 0.01 ? box : null;
}

export const photoBoxesKey = (mealId: string) => `rct-photo-boxes:${mealId}`;

/** Parses what the photo screen stored; anything malformed gives null. */
export function readPhotoBoxes(json: string | null): PhotoBoxes | null {
  if (!json) return null;
  try {
    const value = JSON.parse(json) as { aspect?: unknown; boxes?: unknown };
    const aspect = value.aspect;
    if (typeof aspect !== "number" || !(aspect > 0.2 && aspect < 5) || !value.boxes || typeof value.boxes !== "object") return null;
    const boxes: Record<string, Box> = {};
    for (const [id, raw] of Object.entries(value.boxes)) {
      const box = cleanBox(raw);
      if (box) boxes[id] = box;
    }
    return Object.keys(boxes).length ? { aspect, boxes } : null;
  } catch {
    return null;
  }
}

/**
 * The centre of `box` as left/top percentages of a frame of `frameAspect` (width / height)
 * that shows the photo with object-fit: cover, so the photo's overflowing edges are cut
 * off equally. Kept a little inside the frame so a marker is never half hidden.
 */
export function markerPosition(box: Box, photoAspect: number, frameAspect = 4 / 3): { left: number; top: number } {
  let cx = box.x + box.w / 2;
  let cy = box.y + box.h / 2;
  if (photoAspect > frameAspect) {
    const shown = frameAspect / photoAspect; // fraction of the photo's width in view
    cx = (cx - (1 - shown) / 2) / shown;
  } else {
    const shown = photoAspect / frameAspect;
    cy = (cy - (1 - shown) / 2) / shown;
  }
  const inside = (n: number) => Math.round(Math.min(0.92, Math.max(0.08, n)) * 1000) / 10;
  return { left: inside(cx), top: inside(cy) };
}
