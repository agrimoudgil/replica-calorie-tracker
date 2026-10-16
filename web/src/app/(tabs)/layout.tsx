import type { ReactNode } from "react";
import { TabNav } from "./tab-nav";

/** Main screens: content above a fixed bottom tab bar. */
export default function TabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <div className="flex-1 pb-[calc(var(--tab-bar-h)+env(safe-area-inset-bottom))]">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-20">
        <TabNav />
      </div>
    </div>
  );
}
