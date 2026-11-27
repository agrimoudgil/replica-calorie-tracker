"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/fields";
import type { Rating } from "@/lib/data/types";

const EASE = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
];
const WHATSAPP = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
] as const;
type WhatsApp = (typeof WHATSAPP)[number]["value"];

/**
 * Three short questions, all optional: how easy logging is, what's missing, and whether they'd
 * rather log on WhatsApp. `kind="prompt"` is the one-time card on Today after the third saved meal
 * (with "Not now"); `kind="profile"` is the form on Profile, usable any time.
 */
export function FeedbackForm({ kind }: { kind: "prompt" | "profile" }) {
  const router = useRouter();
  const missingId = useId();
  const [ease, setEase] = useState<Rating | null>(null);
  const [missing, setMissing] = useState("");
  const [whatsapp, setWhatsapp] = useState<WhatsApp | null>(null);
  const [busy, setBusy] = useState<"send" | "later" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const send = async (dismissed: boolean) => {
    setBusy(dismissed ? "later" : "send");
    setError(null);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dismissed ? { kind, dismissed: true } : { kind, ease, missing: missing.trim() || null, prefersWhatsapp: whatsapp }),
    }).catch(() => null);
    setBusy(null);
    if (res?.ok) {
      if (kind === "prompt" && dismissed) return router.refresh(); // the card simply goes away
      setSent(true);
      setEase(null);
      setMissing("");
      setWhatsapp(null);
      return;
    }
    const detail = await res?.json().catch(() => null);
    setError(res ? ((detail?.fields && Object.values<string>(detail.fields)[0]) ?? detail?.message ?? "Couldn't send. Try again.") : "You seem to be offline. Try again.");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (ease === null && !missing.trim() && whatsapp === null) return setError("Answer at least one question.");
    void send(false);
  };

  if (sent) {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-lg bg-accent-soft p-4">
        <p className="text-base font-semibold">Thank you!</p>
        <p className="text-sm">Every answer is read, and the most common ones decide what Oswald does next.</p>
        {kind === "profile" && (
          <Button variant="ghost" onClick={() => setSent(false)}>Send more</Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <SegmentedControl legend="How easy is logging your meals? (1 very hard, 5 very easy)" options={EASE} value={ease ? String(ease) : null}
        onChange={(v) => setEase(Number(v) as Rating)} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={missingId} className="text-sm font-semibold">What&apos;s missing or annoying? (optional)</label>
        <textarea
          id={missingId}
          value={missing}
          onChange={(e) => setMissing(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="e.g. couldn't find my dish, too many taps, want reminders"
          className="min-h-20 resize-y rounded-md border border-input bg-bg px-3 py-2.5 text-base placeholder:text-muted"
        />
      </div>
      <SegmentedControl legend="Would you rather log meals by sending a WhatsApp message?" options={[...WHATSAPP]} value={whatsapp}
        onChange={(v) => setWhatsapp(v as WhatsApp)} />
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" loading={busy === "send"} disabled={busy !== null}>Send feedback</Button>
      {kind === "prompt" && (
        <Button variant="ghost" loading={busy === "later"} disabled={busy !== null} onClick={() => void send(true)}>Not now</Button>
      )}
      <p className="text-xs text-muted">Your answers are stored with your account and read without your name or email. Deleting your account deletes them.</p>
    </form>
  );
}

/** The one-time card on Today, after the third saved meal. */
export function FeedbackPrompt() {
  return (
    <section aria-labelledby="feedback-heading" className="flex flex-col gap-3 rounded-lg border border-accent p-4">
      <div className="flex items-center gap-2">
        <MessageSquareHeart aria-hidden className="size-5 shrink-0 text-accent" />
        <h2 id="feedback-heading" className="text-base font-semibold">Quick question (30 seconds)</h2>
      </div>
      <p className="text-sm text-muted">You&apos;ve logged a few meals. Tell us honestly how it&apos;s going: Oswald is a free public test and your answers shape it.</p>
      <FeedbackForm kind="prompt" />
    </section>
  );
}
