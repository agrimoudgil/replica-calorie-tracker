import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Requests from the Oswald WhatsApp tracker are signed with OSWALD_SYNC_SECRET, shared by both apps:
 * "v1=" + HMAC-SHA256 over "POST\n<path>\n<unix seconds>\n<nonce>\n<sha256 hex of the exact body>".
 * The same scheme and test vector live in the WhatsApp repo (server/journal-client.ts).
 */
export function signWhatsAppRequest(secret: string, path: string, timestamp: string, nonce: string, body: string): string {
  const digest = createHash("sha256").update(body).digest("hex");
  return "v1=" + createHmac("sha256", secret).update(`POST\n${path}\n${timestamp}\n${nonce}\n${digest}`).digest("hex");
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const MAX_SKEW_SECONDS = 300;

export type SignedCheck = { ok: true; nonce: string } | { ok: false; reason: "missing" | "stale" | "bad_signature" };

/** Checks the signature and the 5-minute window. The caller still records the nonce to stop replays. */
export function checkWhatsAppSignature(secret: string, path: string, body: string,
  headers: { timestamp: string | null; nonce: string | null; signature: string | null }, nowMs = Date.now()): SignedCheck {
  const { timestamp, nonce, signature } = headers;
  if (!timestamp || !nonce || !signature || !/^\d{9,12}$/.test(timestamp) || !UUID.test(nonce)) return { ok: false, reason: "missing" };
  if (Math.abs(nowMs / 1000 - Number(timestamp)) > MAX_SKEW_SECONDS) return { ok: false, reason: "stale" };
  const expected = Buffer.from(signWhatsAppRequest(secret, path, timestamp, nonce, body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return { ok: false, reason: "bad_signature" };
  return { ok: true, nonce: nonce.toLowerCase() };
}
