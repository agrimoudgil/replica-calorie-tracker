import { NextResponse } from "next/server";
import { fromError, invalid } from "@/lib/api/http";
import { unlinkBodySchema } from "@/lib/integrations/whatsapp/meals";
import { PATHS, readSigned } from "@/lib/integrations/whatsapp/request";
import { removeLinkByRef } from "@/lib/integrations/whatsapp/store";

/** From the WhatsApp tracker, signed: UNLINK there. Always 200; copies already made stay. */
export async function POST(req: Request) {
  const signed = await readSigned(req, PATHS.unlink);
  if (!signed.ok) return signed.response;
  const parsed = unlinkBodySchema.safeParse(signed.body);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await removeLinkByRef(parsed.data.linkRef);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return fromError(err);
  }
}
