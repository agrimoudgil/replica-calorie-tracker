import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { currentUserId, requireUserId } from "@/lib/data/session";
import { supabaseEnabled } from "@/lib/supabase/config";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Set up · Replica calorie tracker" };

/** S01: body details, goal and diet → daily calorie and macro targets. */
export default async function OnboardingPage() {
  // With real accounts you sign in first; locally the profile save creates the user.
  const userId = supabaseEnabled ? await requireUserId() : await currentUserId();
  const profile = userId ? await db.getProfile(userId) : null;
  return (
    <Screen>
      <ScreenHeader
        title={profile ? "Your details" : "Let's set your daily target"}
        subtitle="Takes a minute. You can change it any time."
        back={profile ? "/profile" : undefined}
      />
      <OnboardingForm initial={profile} />
    </Screen>
  );
}
