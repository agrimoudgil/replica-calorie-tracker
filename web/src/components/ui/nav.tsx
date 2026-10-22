"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Camera, ChartColumn, CircleUser, House, Mic, Plus, Search, Type, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

const tabs = [
  { href: "/", label: "Today", icon: House },
  { href: "/insights", label: "Insights", icon: ChartColumn },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: CircleUser },
] as const;

export function TabBar({ current }: { current: string }) {
  return (
    <nav aria-label="Main" className="border-t border-border bg-bg pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex h-16 max-w-[var(--content-max)]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const selected = current === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={selected ? "page" : undefined}
                className={cn("flex h-full flex-col items-center justify-center gap-1 text-xs font-medium", selected ? "text-accent" : "text-muted")}
              >
                <Icon aria-hidden className="size-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const logMethods = [
  { key: "photo", label: "Take a photo", icon: Camera },
  { key: "voice", label: "Say it", icon: Mic },
  { key: "text", label: "Type it", icon: Type },
  { key: "search", label: "Search foods", icon: Search },
] as const;
export type LogMethod = (typeof logMethods)[number]["key"];

/** Floating add button with a menu of log methods (less any in `hide`). Esc closes and returns focus. */
export function AddButton({ onPick, hide = [], className }: { onPick: (method: LogMethod) => void; hide?: readonly LogMethod[]; className?: string }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector("button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={cn("relative flex flex-col items-end gap-3", className)}>
      {open && (
        <ul id={menuId} ref={menuRef} role="menu" aria-label="Log a meal" className="flex flex-col gap-1 rounded-lg border border-border bg-bg p-2 shadow-pop">
          {logMethods.filter(({ key }) => !hide.includes(key)).map(({ key, label, icon: Icon }) => (
            <li key={key} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onPick(key);
                }}
                className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-base hover:bg-surface"
              >
                <Icon aria-hidden className="size-5 text-accent" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        ref={buttonRef}
        type="button"
        aria-label={open ? "Close log menu" : "Log a meal"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="grid size-14 place-items-center rounded-pill bg-accent text-on-accent shadow-pop transition-transform active:scale-95"
      >
        <Plus aria-hidden className={cn("size-6 transition-transform duration-[var(--motion-base)]", open && "rotate-45")} />
      </button>
    </div>
  );
}
