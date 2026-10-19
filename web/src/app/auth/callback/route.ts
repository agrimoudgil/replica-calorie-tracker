import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { signInFailureCode } from "@/lib/sign-in-failure";
import { createClient } from "@/lib/supabase/server";

/** Finishes Google sign-in and the default email link: swaps the one-time code for a session. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  let exchangeError: { code?: string } | null = null;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    exchangeError = { code: error.code };
  }
  // Only the short code, never the address or any user detail.
  const reason = signInFailureCode(url.searchParams, exchangeError);
  console.warn(`sign-in callback failed: ${reason}`);
  return NextResponse.redirect(new URL(`/sign-in?error=link&reason=${reason}`, url.origin));
}
