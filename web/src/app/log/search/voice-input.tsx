"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

/*
 * Voice input through the browser's own speech recognition (Web Speech API). It costs
 * nothing, but the browser's speech service hears the audio (Google in Chrome, Apple in
 * Safari), as the privacy page says. Only the text it returns reaches Oswald.
 */

type SpeechResult = ArrayLike<{ transcript: string }> & { isFinal: boolean };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<SpeechResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionClass = new () => Recognition;

function speechApi(): RecognitionClass | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noSubscribe = () => () => {};

/** Whether this browser can turn speech into text; null while rendering on the server, where it isn't known yet. */
export function useSpeechSupported(): boolean | null {
  return useSyncExternalStore(noSubscribe, () => speechApi() !== null, () => null);
}

const ERRORS: Record<string, string> = {
  "not-allowed": "Allow the microphone for this site to use voice.",
  "service-not-allowed": "Allow the microphone for this site to use voice.",
  "no-speech": "Didn't catch that. Tap the mic and try again.",
  "audio-capture": "No microphone found.",
  network: "Voice needs an internet connection.",
};

type VoiceInputProps = {
  /** Called with the text heard so far (it grows while you speak). */
  onText: (text: string) => void;
  /** Called once when listening stops: with the final text, or a message when nothing was heard. */
  onDone: (result: { text: string } | { error: string }) => void;
  /** Called when listening starts. */
  onStart?: () => void;
  prominent?: boolean;
};

export function VoiceInput({ onText, onDone, onStart, prominent }: VoiceInputProps) {
  const [listening, setListening] = useState(false);
  const recognition = useRef<Recognition | null>(null);

  // Stop listening if the screen goes away mid-sentence.
  useEffect(() => () => recognition.current?.abort(), []);

  const start = () => {
    const Api = speechApi();
    if (!Api) return onDone({ error: "Your browser can't turn speech into text. Type instead." });
    const r = new Api();
    r.lang = "en-IN"; // Indian English, which copes best with Hindi food names
    r.interimResults = true;
    r.continuous = false;
    let heard = "";
    let failed: string | null = null;
    r.onresult = (e) => {
      heard = Array.from(e.results, (result) => result[0]?.transcript ?? "").join(" ").replace(/\s+/g, " ").trim();
      onText(heard);
    };
    r.onerror = (e) => {
      failed = ERRORS[e.error] ?? (e.error === "aborted" ? null : "Voice stopped. Try again or type instead.");
    };
    r.onend = () => {
      recognition.current = null;
      setListening(false);
      if (failed) onDone({ error: failed });
      else if (heard) onDone({ text: heard });
      else onDone({ error: ERRORS["no-speech"] });
    };
    recognition.current = r;
    setListening(true);
    onStart?.();
    r.start();
  };

  return listening ? (
    <Button variant={prominent ? "primary" : "secondary"} size={prominent ? "lg" : "md"} icon={<Square aria-hidden className="size-4" />} onClick={() => recognition.current?.stop()}>
      Listening… tap to stop
    </Button>
  ) : (
    <Button variant={prominent ? "primary" : "secondary"} size={prominent ? "lg" : "md"} icon={<Mic aria-hidden className="size-4" />} onClick={start}>
      {prominent ? "Tap and say what you ate" : "Speak"}
    </Button>
  );
}
