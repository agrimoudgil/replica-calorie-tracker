"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/ui/fields";
import { themeAttribute, themeCookie, type Theme } from "@/lib/theme";

const OPTIONS: Array<{ value: Theme; label: string }> = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" },
];

/** Fix #5: Light / Dark / Auto. Applies at once; remembered on this device. */
export function Appearance({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState(initial);

  const choose = (next: Theme) => {
    setTheme(next);
    const attr = themeAttribute(next);
    if (attr) document.documentElement.dataset.theme = attr;
    else delete document.documentElement.dataset.theme;
    document.cookie = themeCookie(next, location.protocol === "https:");
  };

  return (
    <section aria-label="Appearance" className="flex flex-col gap-1.5">
      <SegmentedControl legend="Appearance" value={theme} onChange={choose} options={OPTIONS} />
      <p className="text-xs text-muted">Auto matches your phone&apos;s setting. Saved on this device.</p>
    </section>
  );
}
