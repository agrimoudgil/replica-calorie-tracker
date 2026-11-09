/*
 * The WhatsApp link is off unless WHATSAPP_LINK=on AND OSWALD_SYNC_SECRET (32+ characters, the
 * same value as in the WhatsApp tracker) is set. Off, the Profile section, the privacy text and
 * the integration routes don't exist (routes answer 404).
 */
type Env = Record<string, string | undefined>;

export function syncSecret(env: Env): string | null {
  const secret = env.OSWALD_SYNC_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

export function whatsappLinkOn(env: Env): boolean {
  return env.WHATSAPP_LINK?.trim().toLowerCase() === "on" && syncSecret(env) !== null;
}

export const WHATSAPP_LINK = whatsappLinkOn(process.env);

/** How long a link code works, and the letters it uses (no I, L, O, 0 or 1 to misread). */
export const CODE_MINUTES = 10;
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
