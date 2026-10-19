import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNextPath } from "@/lib/safe-redirect";
import { signInFailureCode } from "@/lib/sign-in-failure";
import { createClient } from "@/lib/supabase/server";

const TYPES: EmailOtpType[] = ["magiclink", "signup", "email", "invite", "recovery", "email_change"];

/**
 * Finishes an email link that carries a token hash (see backend.md: the email
 * template change). Unlike the code flow, it works even when the link is opened
 * in a different browser from the one that asked for it.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(url.searchParams.get("next"));
  let failed: { code?: string } | null = null;
  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    failed = { code: error.code };
  }
  const reason = signInFailureCode(url.searchParams, failed);
  console.warn(`sign-in link failed: ${reason}`);
  return NextResponse.redirect(new URL(`/sign-in?error=link&reason=${reason}`, url.origin));
}
