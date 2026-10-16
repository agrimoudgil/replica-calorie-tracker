"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, X } from "lucide-react";
import { AddButton } from "@/components/ui/nav";
import type { MealType } from "@/lib/nutrition/types";

export function TodayAddButton({ suggested }: { suggested: MealType }) {
  const router = useRouter();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--tab-bar-h)+env(safe-area-inset-bottom)+16px)] z-30">
      <div className="mx-auto flex max-w-[var(--content-max)] justify-end px-4">
        <AddButton
          className="pointer-events-auto"
          onPick={(method) => {
            if (method === "photo") router.push(`/log/photo?meal=${suggested}`);
            else if (method === "voice") router.push("/log/voice");
            else router.push("/log/search");
          }}
        />
      </div>
    </div>
  );
}

/** Shown after a save: confirms it and offers Undo (deletes the meal just saved). */
export function SavedNotice({ mealId, label }: { mealId: string; label: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "undoing" | "error">("idle");

  const undo = async () => {
    setState("undoing");
    const res = await fetch(`/api/meals/${mealId}`, { method: "DELETE" }).catch(() => null);
    if (!res || (!res.ok && res.status !== 404)) return setState("error");
    router.replace("/");
    router.refresh();
  };

  return (
    <div role="status" className="flex items-center gap-3 rounded-md bg-fg px-4 py-2 text-sm text-bg">
      <CircleCheck aria-hidden className="size-5 shrink-0" />
      <span className="min-w-0 flex-1">{state === "error" ? "Couldn't undo. Try again." : label}</span>
      <button type="button" onClick={undo} disabled={state === "undoing"} className="h-11 shrink-0 px-2 font-semibold underline underline-offset-2 disabled:opacity-60">
        {state === "undoing" ? "Undoing…" : "Undo"}
      </button>
      <button type="button" aria-label="Dismiss" onClick={() => router.replace("/")} className="grid size-11 shrink-0 place-items-center">
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}
