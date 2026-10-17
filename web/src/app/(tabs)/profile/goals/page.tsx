import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { suggestedTargets } from "@/lib/nutrition/targets";
import { GoalsForm } from "./goals-form";

export const metadata = { title: "Goals and budgets · Replica calorie tracker" };

/** S13: set your own daily targets, see the meal budgets they give, or go back to the suggested ones. */
export default async function GoalsPage() {
  const userId = await requireUserId();
  const profile = await db.getProfile(userId);
  if (!profile) redirect("/onboarding");
  return (
    <Screen>
      <ScreenHeader title="Goals and budgets" subtitle="Your daily targets. Today, Insights and the meal budgets use them." back="/profile" />
      <GoalsForm current={profile.targets} suggested={suggestedTargets(profile, new Date())} custom={profile.targetsCustom} />
    </Screen>
  );
}
