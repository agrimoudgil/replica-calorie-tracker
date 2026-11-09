import "server-only";
import { fail } from "@/lib/api/http";
import { WHATSAPP_LINK, syncSecret } from "./config";
import { checkWhatsAppSignature } from "./signature";
import { recordNonce } from "./store";

export const PATHS = {
  link: "/api/integrations/whatsapp/link",
  unlink: "/api/integrations/whatsapp/unlink",
  meals: "/api/integrations/whatsapp/meals",
} as const;

/**
 * Reads a request from the WhatsApp tracker: 404 while the link is off, 401 for a bad or old
 * signature, 409 for a replayed nonce. Nothing from the request is logged.
 */
export async function readSigned(req: Request, path: string): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const secret = syncSecret(process.env);
  if (!WHATSAPP_LINK || !secret) return { ok: false, response: fail(404, "not_found", "Not found.") };
  const text = await req.text();
  if (text.length > 64_000) return { ok: false, response: fail(413, "too_large", "Request too large.") };
  const check = checkWhatsAppSignature(secret, path, text, {
    timestamp: req.headers.get("x-oswald-timestamp"),
    nonce: req.headers.get("x-oswald-nonce"),
    signature: req.headers.get("x-oswald-signature"),
  });
  if (!check.ok) return { ok: false, response: fail(401, "unauthorized", "Not signed.") };
  if (!(await recordNonce(check.nonce))) return { ok: false, response: fail(409, "replay", "Already received.") };
  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: fail(400, "invalid", "Not JSON.") };
  }
}
