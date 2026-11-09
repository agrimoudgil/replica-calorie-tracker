import { NextResponse } from "next/server";
import { fail, fromError, unauthenticated } from "@/lib/api/http";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { hashCode, newLinkCode, showCode } from "@/lib/integrations/whatsapp/codes";
import { CODE_MINUTES, WHATSAPP_LINK, syncSecret } from "@/lib/integrations/whatsapp/config";
import { storeLinkCode } from "@/lib/integrations/whatsapp/store";

/** A one-time code (10 minutes) the signed-in person sends to Oswald on WhatsApp as LINK <code>. */
export async function POST() {
  if (!WHATSAPP_LINK) return fail(404, "not_found", "Not found.");
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  try {
    if (!(await db.getProfile(userId))) return fail(409, "no_profile", "Set up your profile first.");
    const code = newLinkCode();
    const expiresAt = new Date(Date.now() + CODE_MINUTES * 60_000);
    await storeLinkCode(userId, hashCode(syncSecret(process.env)!, code), expiresAt);
    return NextResponse.json({ code: showCode(code), expiresAt: expiresAt.toISOString() });
  } catch (err) {
    return fromError(err);
  }
}
