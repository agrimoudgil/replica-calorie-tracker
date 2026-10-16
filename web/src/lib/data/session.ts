import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { isId } from "./file-store";

/*
 * Development stand-in for Supabase Auth: a random user id in an http-only cookie.
 * It keeps the per-user code paths real (every data call takes a user id) without
 * accounts. /replica-backend replaces this with the signed-in Supabase user.
 */
const COOKIE = "rct_uid";

export async function currentUserId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  return value && isId(value) ? value : null;
}

/** Returns the current user id, creating a development user on first use. */
export async function ensureUserId(): Promise<string> {
  const existing = await currentUserId();
  if (existing) return existing;
  const id = randomUUID();
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}
