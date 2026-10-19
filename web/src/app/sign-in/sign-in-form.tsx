"use client";

import { useEffect, useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { signInFailureMessage } from "@/lib/sign-in-failure";
import { createClient } from "@/lib/supabase/browser";

const RESEND_SECONDS = 60;

/** `failure`: why the last sign-in didn't finish (a code from the auth routes), or null. */
export function SignInForm({ failure, googleEnabled }: { failure: string | null; googleEnabled: boolean }) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(failure ? signInFailureMessage(failure) : null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendLink = async (e?: FormEvent) => {
    e?.preventDefault();
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return setError("Enter a valid email address.");
    setError(null);
    setBusy("email");
    const { error: err } = await createClient().auth.signInWithOtp({
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(null);
    if (err) {
      return setError(err.status === 429 ? "Too many sign-in emails. Wait a minute and try again." : "Couldn't send the email. Check the address and try again.");
    }
    setSentTo(address);
    setWait(RESEND_SECONDS);
  };

  const google = async () => {
    setError(null);
    setBusy("google");
    const { error: err } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (err) {
      setBusy(null);
      setError("Google sign-in isn't available right now. Use your email instead.");
    }
  };

  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-lg bg-surface p-5">
        <MailCheck aria-hidden className="size-8 text-accent" />
        <h2 className="text-lg font-semibold">Check your email</h2>
        <p className="text-base">
          We sent a sign-in link to <strong className="break-all">{sentTo}</strong>. Open it on this phone or computer.
        </p>
        <p className="text-sm text-muted">Nothing there? Check spam, or send it again.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => sendLink()} disabled={wait > 0} loading={busy === "email"}>
            {wait > 0 ? `Send again in ${wait}s` : "Send again"}
          </Button>
          <Button variant="ghost" onClick={() => setSentTo(null)}>Use another email</Button>
        </div>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {googleEnabled && (
        <>
          <Button variant="secondary" size="lg" onClick={google} loading={busy === "google"} disabled={busy !== null}>
            Continue with Google
          </Button>
          <p className="flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</p>
        </>
      )}
      <form onSubmit={sendLink} noValidate className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          help="We'll email you a link. No password needed."
        />
        <Button type="submit" size="lg" loading={busy === "email"} disabled={busy !== null}>
          Email me a sign-in link
        </Button>
      </form>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}
