"use client";

import { cn } from "@/lib/cn";

export type PhotoMarker = { key: string; n: number; name: string; kept: boolean; left: number; top: number };

/**
 * The meal photo with a numbered marker on each food the estimate found. Tapping a
 * marker leaves that food out of the meal, or puts it back; the list below follows.
 */
export function PhotoPicker({ src, markers, onToggle }: { src: string; markers: PhotoMarker[]; onToggle: (key: string) => void }) {
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- private, per-user image route */}
        <img src={src} alt="Your meal photo" className="aspect-[4/3] w-full rounded-lg bg-surface object-cover" />
        <div role="group" aria-label="Foods on the photo">
          {markers.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={m.kept}
              aria-label={`${m.n}. Keep ${m.name}`}
              onClick={() => onToggle(m.key)}
              style={{ left: `${m.left}%`, top: `${m.top}%` }}
              className={cn(
                "absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-base font-bold shadow-pop",
                m.kept ? "border-2 border-bg bg-accent text-on-accent" : "border-2 border-dashed border-muted bg-bg text-muted line-through",
              )}
            >
              {m.n}
            </button>
          ))}
        </div>
      </div>
      <figcaption className="text-xs text-muted">Tap a number to leave that food out of this meal. Tap it again to put it back.</figcaption>
    </figure>
  );
}
