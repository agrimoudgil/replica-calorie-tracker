import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { clearDevUser, currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { deleteAccountSchema } from "@/lib/api/schemas";
import { SIGN_IN_PATH, supabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** Deletes the signed-in user's account, meals and photos for good. */
export async function DELETE(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = deleteAccountSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    await db.deleteAccount(userId);
  } catch (err) {
    return fromError(err);
  }
  if (supabaseEnabled) {
    // The user no longer exists; this just clears the session cookies.
    await (await createClient()).auth.signOut({ scope: "local" }).catch(() => undefined);
  } else {
    await clearDevUser();
  }
  return NextResponse.json({ redirect: SIGN_IN_PATH });
}
