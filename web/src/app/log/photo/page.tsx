import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { localHour } from "@/lib/dates";
import { parseMealType, suggestMealType } from "@/lib/meal-type";
import { PhotoLogger } from "./photo-logger";

export const metadata = { title: "Snap a meal · Replica calorie tracker" };

/** S04: take or pick a photo of the meal. */
export default async function PhotoPage({ searchParams }: PageProps<"/log/photo">) {
  const userId = await currentUserId();
  const profile = userId ? await db.getProfile(userId) : null;
  if (!profile) redirect("/onboarding");
  const { meal } = await searchParams;
  const initial = parseMealType(meal) ?? suggestMealType(localHour(new Date(), profile.timezone));
  return (
    <Screen>
      <ScreenHeader title="Snap your meal" subtitle="Fit the whole plate in the frame." back="/" />
      <PhotoLogger initialMealType={initial} />
    </Screen>
  );
}
