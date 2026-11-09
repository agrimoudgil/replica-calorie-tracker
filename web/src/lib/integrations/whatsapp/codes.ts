import { createHmac, randomInt } from "node:crypto";
import { CODE_ALPHABET } from "./config";

/** A fresh 8-character code, shown as ABCD-2345. */
export function newLinkCode(): string {
  let code = "";
  for (let i = 0; i < 8; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export const showCode = (code: string) => `${code.slice(0, 4)}-${code.slice(4)}`;

/** "abcd 2345", "ABCD-2345" → "ABCD2345"; null when it can't be a code. */
export function normalizeCode(text: string): string | null {
  const code = text.toUpperCase().replace(/[\s-]+/g, "");
  return code.length === 8 && [...code].every((c) => CODE_ALPHABET.includes(c)) ? code : null;
}

/** Codes are stored only as a keyed hash, so a database copy can't be used to link. */
export const hashCode = (secret: string, code: string) => createHmac("sha256", secret).update(`link-code:${code}`).digest("hex");
