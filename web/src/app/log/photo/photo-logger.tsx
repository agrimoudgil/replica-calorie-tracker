"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SegmentedControl } from "@/components/ui/fields";
import { PhotoCapture, type CaptureState } from "@/components/ui/media";
import { resizeToJpeg } from "@/lib/client/resize-image";
import type { MealType } from "@/lib/nutrition/types";

const MEAL_OPTIONS: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "snack", label: "Snack" },
  { value: "dinner", label: "Dinner" },
];

export function PhotoLogger({ initialMealType }: { initialMealType: MealType }) {
  const router = useRouter();
  const [mealType, setMealType] = useState(initialMealType);
  const [state, setState] = useState<CaptureState>("idle");
  const [preview, setPreview] = useState<string>();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const previewRef = useRef<string | undefined>(undefined);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const onFile = async (file: File) => {
    setMessage(null);
    if (!file.type.startsWith("image/")) {
      setState("idle");
      return setMessage("That file isn't a photo. Choose an image.");
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = URL.createObjectURL(file);
    setPreview(previewRef.current);
    setState("uploading");
    setProgress(15);

    let jpeg: Blob;
    try {
      jpeg = await resizeToJpeg(file);
    } catch {
      setState("idle");
      return setMessage("This photo format isn't supported here. Take a new photo or choose a JPEG.");
    }

    setProgress(45);
    const mealId = crypto.randomUUID();
    const form = new FormData();
    form.set("image", jpeg, "meal.jpg");
    form.set("mealId", mealId);
    form.set("mealType", mealType);
    form.set("eatenAt", new Date().toISOString());

    // One automatic retry with the same meal id: the server returns the same draft.
    let res: Response | null = null;
    for (let attempt = 0; attempt < 2 && !res; attempt++) {
      res = await fetch("/api/estimate/photo", { method: "POST", body: form }).catch(() => null);
    }
    setProgress(90);

    if (!res) {
      setState("idle");
      return setMessage("You seem to be offline. Check your connection and try again.");
    }
    if (res.ok) {
      setProgress(100);
      router.push(`/log/review/${mealId}`);
      return;
    }
    const body = await res.json().catch(() => null);
    if (res.status === 401) return router.push("/onboarding");
    if (body?.error === "not_food") return setState("not-food");
    setState("idle");
    setMessage(body?.message ?? "Couldn't read that photo. Try again.");
  };

  return (
    <div className="flex flex-col gap-5">
      <SegmentedControl legend="Which meal?" value={mealType} onChange={setMealType} options={MEAL_OPTIONS} />
      <PhotoCapture state={state} previewUrl={preview} progress={progress} onFile={onFile} />
      {state === "uploading" && (
        <p role="status" className="text-center text-sm text-muted">Working out what&apos;s on your plate…</p>
      )}
      {message && (
        <p role="alert" className="text-sm text-danger">{message}</p>
      )}
    </div>
  );
}
