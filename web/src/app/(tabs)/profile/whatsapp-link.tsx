"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * Links this journal to the Oswald WhatsApp tracker: a one-time code the person sends there as
 * LINK <code>. Linked, meals they save on WhatsApp appear in Today. `guest`: an email-only start,
 * so the account lives in this browser.
 */
export function WhatsAppLink({ linkedAt, guest }: { linkedAt: string | null; guest: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (method: "POST" | "DELETE", url: string) => {
    setBusy(true);
    setError(null);
    const res = await fetch(url, { method }).catch(() => null);
    const body = await res?.json().catch(() => null);
    setBusy(false);
    if (!res) setError("You seem to be offline. Nothing changed.");
    else if (!res.ok) setError(body?.message ?? "That didn't work. Try again.");
    return res?.ok ? body : null;
  };

  const getCode = async () => {
    const body = await call("POST", "/api/whatsapp/link-code");
    if (body?.code) setCode({ code: body.code, expiresAt: body.expiresAt });
  };
  const unlink = async () => {
    if (await call("DELETE", "/api/whatsapp/link")) router.refresh();
  };

  return (
    <section aria-labelledby="whatsapp-heading" className="flex flex-col gap-3">
      <h2 id="whatsapp-heading" className="text-lg font-semibold">WhatsApp</h2>
      {linkedAt ? (
        <>
          <p className="text-sm text-muted">
            Linked on {dateFmt.format(new Date(linkedAt))}. Meals you save on Oswald WhatsApp from then on appear in Today, marked
            &ldquo;From WhatsApp&rdquo;. Corrections, UNDO and deletion there update them here.
          </p>
          <Button variant="secondary" className="w-full" disabled={busy} loading={busy} onClick={unlink}>Unlink WhatsApp</Button>
          <p className="text-xs text-muted">Unlinking stops new copies. Meals already copied stay here.</p>
        </>
      ) : code ? (
        <div className="flex flex-col gap-2 rounded-lg bg-surface p-4">
          <p className="text-sm">On WhatsApp, send this to Oswald within 10 minutes:</p>
          <p className="text-display font-bold tracking-wider tabular-nums" aria-live="polite">LINK {code.code}</p>
          <p className="text-sm text-muted">It works once. Then refresh this page to see it linked.</p>
          <Button variant="ghost" onClick={() => router.refresh()}>I&apos;ve sent it</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted">
            Log meals by chatting with Oswald on WhatsApp (private testers for now) and see them here. Only meals you save after
            linking are copied.
          </p>
          {guest && (
            <p className="text-sm text-muted">
              You started with just your email, so this account lives in this browser. If you sign out or clear it, linked meals
              would keep arriving in an account you can&apos;t open; unlink first.
            </p>
          )}
          <Button variant="secondary" className="w-full" icon={<MessageCircle aria-hidden className="size-4" />} disabled={busy} loading={busy} onClick={getCode}>
            Get a link code
          </Button>
        </>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </section>
  );
}
