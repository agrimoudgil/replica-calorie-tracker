import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { currentUserId } from "@/lib/data/session";
import { supabaseEnabled } from "@/lib/supabase/config";
import { SignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in · Replica calorie tracker" };

/** Email link or Google. No passwords to remember or leak. */
export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  if (!supabaseEnabled) redirect("/onboarding");
  if (await currentUserId()) redirect("/");
  const { error } = await searchParams;
  return (
    <Screen className="justify-center">
      <ScreenHeader title="Track meals in seconds" subtitle="Snap your plate, see calories and macros. Free, no paywall." />
      <SignInForm
        linkError={error === "link"}
        googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN === "on"}
      />
      <p className="text-xs text-muted">
        By continuing you agree that your meals are stored to give you estimates. Estimates are for general wellness, not
        medical advice.
      </p>
    </Screen>
  );
}
