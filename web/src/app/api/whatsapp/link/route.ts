import { NextResponse } from "next/server";
import { fail, fromError, unauthenticated } from "@/lib/api/http";
import { currentUserId } from "@/lib/data/session";
import { WHATSAPP_LINK } from "@/lib/integrations/whatsapp/config";
import { removeLinkForUser } from "@/lib/integrations/whatsapp/store";

/**
 * Unlink from the web side. WhatsApp learns on its next delivery (410) and stops sending.
 * Meals already copied stay in the journal.
 */
export async function DELETE() {
  if (!WHATSAPP_LINK) return fail(404, "not_found", "Not found.");
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  try {
    await removeLinkForUser(userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fromError(err);
  }
}
