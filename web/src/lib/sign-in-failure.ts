/*
 * Why a sign-in didn't finish. The auth routes turn the error Supabase (or Google, through
 * Supabase) sent back into a short code for the sign-in page's address, and the page says
 * what it means. Codes keep only a-z, 0-9 and _, so nothing else from the address is shown.
 */

const clean = (raw: string) => raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 40) || "unknown";

/** From the callback's query and the code-exchange error, if any. */
export function signInFailureCode(params: URLSearchParams, exchangeError?: { code?: string } | null): string {
  // Supabase couldn't swap Google's answer for a session: usually a wrong client secret.
  if (/exchange external code/i.test(params.get("error_description") ?? "")) return "google_exchange_failed";
  if (exchangeError) return clean(exchangeError.code ?? "exchange_failed");
  const raw = params.get("error_code") ?? params.get("error");
  return raw ? clean(raw) : params.get("code") ? "exchange_failed" : "no_code";
}

/** What the sign-in page says. `link`: an older address without a reason. */
export function signInFailureMessage(code: string): string {
  switch (code) {
    case "link":
    case "otp_expired":
    case "no_code":
      return "That sign-in link has expired or was already used. Send a new one.";
    case "access_denied":
      return "Sign-in was cancelled. Try again, or use your email.";
    case "bad_code_verifier":
    case "flow_state_not_found":
    case "flow_state_expired":
      return "Sign-in didn't finish: it has to start and end in the same browser window, within a few minutes. Try again here.";
    case "google_exchange_failed":
      return "Google sign-in didn't finish: our sign-in service couldn't confirm it with Google. Try again, or use your email.";
    default:
      return `Sign-in didn't finish (${clean(code)}). Try again, or use your email.`;
  }
}
