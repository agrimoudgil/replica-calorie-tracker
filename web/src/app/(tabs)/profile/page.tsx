import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";

export const metadata = { title: "Profile · Replica calorie tracker" };

const fmt = new Intl.NumberFormat("en-IN");

/** S13 (partial): targets and a link to edit details. Settings come later. */
export default async function ProfilePage() {
  const userId = await currentUserId();
  const profile = userId ? await db.getProfile(userId) : null;
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
    </Screen>
  );
}
