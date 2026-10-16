import Link from "next/link";
import { Camera, Mic, Search, Type } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/screen";

export const metadata = { title: "Log a meal · Replica calorie tracker" };

const METHODS = [
  { href: "/log/photo", label: "Snap a photo", detail: "Fastest. We work out the items and portions.", icon: Camera },
  { href: "/log/voice", label: "Say it", detail: "“2 roti, dal and a bowl of curd”", icon: Mic },
  { href: "/log/search", label: "Type it", detail: "Write what you ate in your own words.", icon: Type },
  { href: "/log/search", label: "Search foods", detail: "Pick from Indian dishes and staples.", icon: Search },
];

/** S03: choose how to log. The add button on Today opens the same choices as a menu. */
export default function LogPage() {
  return (
    <Screen>
      <ScreenHeader title="Log a meal" back="/" />
      <ul className="flex flex-col gap-2">
        {METHODS.map(({ href, label, detail, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className="flex min-h-16 items-center gap-4 rounded-lg border border-border p-4 hover:bg-surface">
              <Icon aria-hidden className="size-6 shrink-0 text-accent" />
              <span className="flex flex-col">
                <span className="text-base font-semibold">{label}</span>
                <span className="text-sm text-muted">{detail}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Screen>
  );
}
