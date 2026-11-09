import { NextResponse } from "next/server";
import { fail, fromError, invalid } from "@/lib/api/http";
import { hashCode, normalizeCode } from "@/lib/integrations/whatsapp/codes";
import { syncSecret } from "@/lib/integrations/whatsapp/config";
import { linkBodySchema } from "@/lib/integrations/whatsapp/meals";
import { PATHS, readSigned } from "@/lib/integrations/whatsapp/request";
import { saveLink, takeLinkCode } from "@/lib/integrations/whatsapp/store";

/** From the WhatsApp tracker, signed: "LINK <code>". 200 linked; 404 the code is wrong, used or expired. */
export async function POST(req: Request) {
  const signed = await readSigned(req, PATHS.link);
  if (!signed.ok) return signed.response;
  const parsed = linkBodySchema.safeParse(signed.body);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const code = normalizeCode(parsed.data.code);
    const userId = code ? await takeLinkCode(hashCode(syncSecret(process.env)!, code)) : null;
    if (!userId) return fail(404, "invalid_code", "That code isn't valid.");
    await saveLink(userId, parsed.data.linkRef);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fromError(err);
  }
}
