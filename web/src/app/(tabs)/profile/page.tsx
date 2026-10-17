import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Download } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { supabaseEnabled } from "@/lib/supabase/config";
import { THEME_COOKIE, parseTheme } from "@/lib/theme";
import { AccountActions } from "./account-actions";
import { Appearance } from "./appearance";

export const metadata = { title: "Profile · Replica calorie tracker" };

const fmt = new Intl.NumberFormat("en-IN");

/** S13 (partial): targets, edit details, appearance, export your data, sign out, delete account. */
export default async function ProfilePage() {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");
  const t = profile.targets;
  return (
    <Screen>
      <ScreenHeader title="Profile" subtitle={profile.displayName ?? undefined} />
      <section aria-labelledby="targets-heading" className="flex flex-col gap-2 rounded-lg bg-surface p-4">
        <h2 id="targets-heading" className="text-lg font-semibold">Daily targets</h2>
        <p className="text-display font-bold tabular-nums">{fmt.format(t.kcal)}<span className="text-base font-medium text-muted"> kcal</span></p>
        <p className="text-sm text-muted tabular-nums">
          Protein {t.proteinG} g · Carbs {t.carbG} g · Fat {t.fatG} g · Fibre {t.fiberG} g
        </p>
      </section>
      <ul className="flex flex-col rounded-lg border border-border">
        {[
          { href: "/onboarding", label: "Edit body details and goal" },
          { href: "/profile/foods", label: "My foods and recipes" },
          { href: "/profile/auto-snap", label: "Auto-log from gallery" },
        ].map((l) => (
          <li key={l.href} className="border-b border-border last:border-b-0">
            <Link href={l.href} className="flex min-h-14 items-center justify-between px-4 text-base hover:bg-surface">
              {l.label}
              <ChevronRight aria-hidden className="size-5 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
      <Appearance initial={parseTheme((await cookies()).get(THEME_COOKIE)?.value)} />
      <section aria-labelledby="data-heading" className="flex flex-col gap-3">
        <h2 id="data-heading" className="text-lg font-semibold">Your data</h2>
        <p className="text-sm text-muted">
          Download everything you&apos;ve logged as a spreadsheet file (CSV). It opens in Excel or Google Sheets, with dates and times in your time zone.
        </p>
        <ul className="flex flex-col rounded-lg border border-border">
          {[
            { file: "meals", label: "Every food you logged", detail: "One row per food, with all its nutrients" },
            { file: "days", label: "Daily totals", detail: "One row per day. A mineral is blank on days when a food had no value for it." },
          ].map((d) => (
            <li key={d.file} className="border-b border-border last:border-b-0">
              {/* A plain link: the route sends the file as a download. */}
              <a href={`/api/export?file=${d.file}`} download className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 hover:bg-surface">
                <span className="flex flex-col">
                  <span className="text-base">{d.label}</span>
                  <span className="text-sm text-muted">{d.detail}</span>
                </span>
                <Download aria-hidden className="size-5 shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </section>
      <AccountActions realAccounts={supabaseEnabled} />
    </Screen>
  );
}
