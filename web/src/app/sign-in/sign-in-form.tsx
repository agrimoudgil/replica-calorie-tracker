"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { signInFailureMessage } from "@/lib/sign-in-failure";
import { createClient } from "@/lib/supabase/browser";

const RESEND_SECONDS = 60;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Start with just an email (the main way in for now): a Supabase anonymous account for
 * this browser, with the email kept unverified in its metadata to count interest. The
 * email is never used to sign in, so typing someone else's can't open their meals.
 * Google and email links stay for people with a full account.
 * `failure`: why the last sign-in didn't finish (a code from the auth routes), or null.
 */
export function SignInForm({ failure, googleEnabled }: { failure: string | null; googleEnabled: boolean }) {
  const router = useRouter();
  const [startEmail, setStartEmail] = useState("");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState<"start" | "email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(failure ? signInFailureMessage(failure) : null);
  const [wait, setWait] = useState(0);

  const start = async (e: FormEvent) => {
    e.preventDefault();
    const address = startEmail.trim().toLowerCase();
    if (!EMAIL.test(address) || address.length > 254) return setError("Enter a valid email address.");
    setError(null);
    setBusy("start");
    const { error: err } = await createClient().auth.signInAnonymously({ options: { data: { signup_email: address } } });
    if (err) {
      setBusy(null);
      return setError(err.status === 429 ? "Lots of people started from this network just now. Try again in a little while." : "Couldn't start right now. Try again in a moment.");
    }
    router.replace("/");
    router.refresh();
  };

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const sendLink = async (e?: FormEvent) => {
    e?.preventDefault();
    const address = email.trim();
    if (!EMAIL.test(address)) return setError("Enter a valid email address.");
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
      <form onSubmit={start} noValidate className="flex flex-col gap-4">
        <TextField
          label="Your email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={startEmail}
          onChange={(e) => setStartEmail(e.target.value)}
          placeholder="you@example.com"
          help="No password and no email to confirm. Your meals are saved in this browser."
        />
        <Button type="submit" size="lg" loading={busy === "start"} disabled={busy !== null}>
          Start using Oswald
        </Button>
      </form>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      {googleEnabled && (
        <>
          <p className="flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</p>
          <Button variant="secondary" size="lg" onClick={google} loading={busy === "google"} disabled={busy !== null}>
            Continue with Google
          </Button>
        </>
      )}

      <details className="group rounded-lg border border-border">
        <summary className="flex min-h-12 cursor-pointer list-none items-center px-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          Have an account with an email link? Sign in
        </summary>
        <form onSubmit={sendLink} noValidate className="flex flex-col gap-4 px-4 pb-4">
          <TextField
            label="Email for a sign-in link"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            help="We'll email you a link. No password needed."
          />
          <Button type="submit" variant="secondary" loading={busy === "email"} disabled={busy !== null}>
            Email me a sign-in link
          </Button>
        </form>
      </details>
    </div>
  );
}
