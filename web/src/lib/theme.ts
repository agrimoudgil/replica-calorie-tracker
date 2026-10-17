/*
 * Fix #5: Light, Dark or Auto. The choice lives in a cookie on this device, so the server
 * renders <html data-theme> straight away: the right colours on the first paint, no flash.
 * Auto sets no attribute, and tokens.css follows the phone's setting.
 */

export const THEMES = ["light", "dark", "auto"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_COOKIE = "theme";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function parseTheme(value: unknown): Theme {
  return value === "light" || value === "dark" ? value : "auto";
}

/** The `data-theme` value for <html>: none for Auto. */
export function themeAttribute(theme: Theme): "light" | "dark" | undefined {
  return theme === "auto" ? undefined : theme;
}

/** A `document.cookie` string that stores the choice for a year; Auto removes it. */
export function themeCookie(theme: Theme, secure: boolean): string {
  const base = `${THEME_COOKIE}=${theme === "auto" ? "" : theme}; Path=/; SameSite=Lax; Max-Age=${theme === "auto" ? 0 : ONE_YEAR}`;
  return secure ? `${base}; Secure` : base;
}
