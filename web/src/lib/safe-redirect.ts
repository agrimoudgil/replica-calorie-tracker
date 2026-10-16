/** Only same-site paths: "/x" is fine, "//evil.com" and "https://evil.com" are not. */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
