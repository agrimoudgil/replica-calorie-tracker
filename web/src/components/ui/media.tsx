"use client";

import { useRef, type ChangeEvent } from "react";
import { Camera, ImageUp, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/cn";

export type CaptureState = "idle" | "preview" | "uploading" | "denied" | "not-food";

type PhotoCaptureProps = {
  state: CaptureState;
  previewUrl?: string;
  progress?: number;
  onFile: (file: File) => void;
};

export function PhotoCapture({ state, previewUrl, progress = 0, onFile }: PhotoCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-surface">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={previewUrl} alt="Your meal photo" className="size-full object-cover" />
        ) : (
          <Camera aria-hidden className="size-12 text-muted" />
        )}
        {state === "uploading" && (
          <div className="absolute inset-x-4 bottom-4">
            <div role="progressbar" aria-label="Reading your meal" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-pill bg-bg/70">
              <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {state === "denied" && (
        <p role="alert" className="text-sm text-danger">
          Camera access is off for this site. Turn it on in your browser settings, or choose a photo from your gallery.
        </p>
      )}
      {state === "not-food" && (
        <p role="alert" className="text-sm text-warning">
          We couldn&apos;t find food in that photo. Try again with the plate in the middle of the frame.
        </p>
      )}

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} aria-hidden onChange={pick} />
      <input ref={galleryRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={pick} />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={state === "uploading" || state === "denied"}
          onClick={() => cameraRef.current?.click()}
          className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-md bg-accent text-base font-semibold text-on-accent disabled:opacity-50"
        >
          <Camera aria-hidden className="size-5" /> Take photo
        </button>
        <button
          type="button"
          disabled={state === "uploading"}
          onClick={() => galleryRef.current?.click()}
          className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-md border border-border bg-surface text-base font-semibold disabled:opacity-50"
        >
          <ImageUp aria-hidden className="size-5" /> Gallery
        </button>
      </div>
    </div>
  );
}

export type VoiceState = "idle" | "listening" | "processing" | "unsupported" | "denied";

export function VoiceButton({ state, transcript, onToggle }: { state: VoiceState; transcript?: string; onToggle: () => void }) {
  const listening = state === "listening";
  const blocked = state === "unsupported" || state === "denied";
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Start speaking"}
        disabled={blocked || state === "processing"}
        onClick={onToggle}
        className={cn(
          "relative grid size-20 place-items-center rounded-pill text-on-accent transition-transform active:scale-95 disabled:opacity-50",
          blocked ? "bg-input" : "bg-accent",
        )}
      >
        {listening && <span aria-hidden className="absolute inset-0 animate-ping rounded-pill bg-accent/40" />}
        {blocked ? <MicOff aria-hidden className="size-8" /> : <Mic aria-hidden className="size-8" />}
      </button>
      <p className="min-h-5 text-center text-sm text-muted">
        {state === "idle" && "Tap and say what you ate, e.g. “2 roti, dal and a bowl of curd”"}
        {state === "listening" && "Listening…"}
        {state === "processing" && "Working out the calories…"}
        {state === "unsupported" && "Voice isn't available in this browser. Type your meal instead."}
        {state === "denied" && "Microphone access is off. Type your meal instead."}
      </p>
      <p aria-live="polite" className={cn("rounded-md bg-surface px-3 py-2 text-base", !transcript && "sr-only")}>
        {transcript}
      </p>
    </div>
  );
}
