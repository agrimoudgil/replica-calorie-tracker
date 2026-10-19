import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isId } from "@/lib/ids";
import { SIGN_IN_PATH, supabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/*
 * Who is making this request.
 * With Supabase: the signed-in user from the verified session token (getClaims).
 * Without it (local development): a random id in an http-only cookie, created on
 * first use, so the per-user code paths still run.
 */
const DEV_COOKIE = "rct_uid";

export async function currentUserId(): Promise<string | null> {
  if (supabaseEnabled) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const sub = data?.claims?.sub;
    return typeof sub === "string" && isId(sub) ? sub : null;
  }
  const value = (await cookies()).get(DEV_COOKIE)?.value;
  return value && isId(value) ? value : null;
}

/**
 * True for someone who started with just an email (a Supabase anonymous account): no
 * password and no verified email, so this browser's session is their only way in.
 */
export async function isGuest(): Promise<boolean> {
  if (!supabaseEnabled) return false;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.is_anonymous === true;
}

/** For pages: the user id, or a redirect to sign in. */
export async function requireUserId(): Promise<string> {
  const id = await currentUserId();
  if (!id) redirect(SIGN_IN_PATH);
  return id;
}

/**
 * For saving the profile. With Supabase the user must already be signed in (null if
 * not); in local development a cookie user is created on first use.
 */
export async function ensureUserId(): Promise<string | null> {
  const existing = await currentUserId();
  if (existing || supabaseEnabled) return existing;
  const id = randomUUID();
  (await cookies()).set(DEV_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

/** Forgets the development cookie user (sign-out without Supabase). */
export async function clearDevUser() {
  (await cookies()).delete(DEV_COOKIE);
}
