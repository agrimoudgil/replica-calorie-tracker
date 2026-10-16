"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/overlays";

export function AccountActions({ realAccounts }: { realAccounts: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: understood }),
    }).catch(() => null);
    const body = await res?.json().catch(() => null);
    if (res?.ok) {
      router.replace(body?.redirect ?? "/");
      router.refresh();
      return;
    }
    setBusy(false);
    setError(res ? (body?.message ?? "Couldn't delete your account. Try again.") : "You seem to be offline. Nothing was deleted.");
  };

  return (
    <section aria-labelledby="account-heading" className="flex flex-col gap-3">
      <h2 id="account-heading" className="text-lg font-semibold">Account</h2>
      <form action="/auth/sign-out" method="post">
        <Button type="submit" variant="secondary" className="w-full" icon={<LogOut aria-hidden className="size-4" />}>
          Sign out
        </Button>
      </form>
      {realAccounts && (
        <form action="/auth/sign-out" method="post">
          <input type="hidden" name="scope" value="global" />
          <Button type="submit" variant="ghost" className="w-full">Sign out on all devices</Button>
        </form>
      )}
      <Button variant="ghost" className="w-full text-danger hover:bg-surface" onClick={() => setOpen(true)} icon={<Trash2 aria-hidden className="size-4" />}>
        Delete account
      </Button>

      <BottomSheet open={open} onClose={() => !busy && setOpen(false)} title="Delete your account?">
        <div className="flex flex-col gap-4 pb-2">
          <p className="text-base">
            This permanently deletes your profile, every meal, every meal photo and your sign-in. It can&apos;t be undone.
          </p>
          <label className="flex min-h-11 items-start gap-3 text-sm">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[var(--danger)]" />
            I understand that everything will be deleted for good.
          </label>
          {error && <p role="alert" className="text-sm text-danger">{error}</p>}
          <Button variant="danger" size="lg" disabled={!understood || busy} loading={busy} onClick={deleteAccount}>
            Delete everything
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Keep my account</Button>
        </div>
      </BottomSheet>
    </section>
  );
}
