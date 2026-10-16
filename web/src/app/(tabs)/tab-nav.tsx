"use client";

import { usePathname } from "next/navigation";
import { TabBar } from "@/components/ui/nav";

const TAB_FOR_PREFIX: Array<[string, string]> = [
  ["/insights", "/insights"],
  ["/coach", "/insights"],
  ["/progress", "/progress"],
  ["/profile", "/profile"],
];

export function TabNav() {
  const pathname = usePathname();
  const current = TAB_FOR_PREFIX.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "/";
  return <TabBar current={current} />;
}
