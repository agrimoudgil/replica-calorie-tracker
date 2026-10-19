import Link from "next/link";
import { redirect } from "next/navigation";
import { CameraOff } from "lucide-react";
import { Screen, ScreenHeader } from "@/components/screen";
import { EmptyState } from "@/components/ui/feedback";
import { PHOTO_LOGGING } from "@/lib/ai";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { localHour } from "@/lib/dates";
import { parseMealType, suggestMealType } from "@/lib/meal-type";
import { PhotoLogger } from "./photo-logger";

export const metadata = { title: "Snap a meal" };

/** S04: take or pick a photo of the meal. */
export default async function PhotoPage({ searchParams }: PageProps<"/log/photo">) {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");
  const { meal } = await searchParams;
  const initial = parseMealType(meal) ?? suggestMealType(localHour(new Date(), profile.timezone));
  if (!PHOTO_LOGGING) {
    // Switched off (an old link or bookmark): say so, and offer the free way to log.
    return (
      <Screen>
        <ScreenHeader title="Snap your meal" back="/" />
        <EmptyState
          icon={<CameraOff />}
          title="Photo logging is off for now"
          body="Type or search what you ate instead. It's just as quick, and free."
          action={
            <Link href={`/log/search?mode=type&meal=${initial}`} className="inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-semibold text-on-accent hover:brightness-110">
              Type what you ate
            </Link>
          }
        />
      </Screen>
    );
  }
  return (
    <Screen>
      <ScreenHeader title="Snap your meal" subtitle="Fit the whole plate in the frame." back="/" />
      <PhotoLogger initialMealType={initial} />
    </Screen>
  );
}
