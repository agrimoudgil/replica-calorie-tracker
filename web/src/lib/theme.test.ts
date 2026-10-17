import { describe, expect, it } from "vitest";
import { parseTheme, themeAttribute, themeCookie } from "./theme";

describe("theme choice", () => {
  it("reads only light or dark from the cookie; anything else is Auto", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    for (const v of [undefined, "", "auto", "DARK", "blue", 1]) expect(parseTheme(v)).toBe("auto");
  });

  it("sets an attribute only for a fixed choice", () => {
    expect(themeAttribute("dark")).toBe("dark");
    expect(themeAttribute("light")).toBe("light");
    expect(themeAttribute("auto")).toBeUndefined();
  });

  it("remembers a choice for a year and forgets it for Auto", () => {
    expect(themeCookie("dark", false)).toBe("theme=dark; Path=/; SameSite=Lax; Max-Age=31536000");
    expect(themeCookie("light", true)).toBe("theme=light; Path=/; SameSite=Lax; Max-Age=31536000; Secure");
    expect(themeCookie("auto", false)).toBe("theme=; Path=/; SameSite=Lax; Max-Age=0");
  });
});
