import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { isIsoDate } from "@/lib/dates";
import { parseMealType } from "@/lib/meal-type";
import { logHref, type LogTarget } from "@/lib/log-link";
import { RecipeEditor } from "../recipe-editor";

export const metadata = { title: "New recipe" };

/** S13b: a new recipe. Opened from Add food (?from=log), saving goes back there with one serving in the meal. */
export default async function NewRecipePage({ searchParams }: PageProps<"/recipes/new">) {
  const userId = await requireUserId();
  if (!(await db.getProfile(userId))) redirect("/onboarding");
  const { from, meal, date, items } = await searchParams;
  const logTo: LogTarget | undefined =
    from === "log"
      ? {
          meal: parseMealType(meal) ?? undefined,
          date: typeof date === "string" && isIsoDate(date) ? date : undefined,
          // Passed straight back to Add food, which checks each part again.
          items: typeof items === "string" && items.length <= 1500 && /^[\w.:,-]+$/.test(items) ? items : undefined,
        }
      : undefined;
  const back = logTo ? logHref(logTo) : "/profile/foods";
  return (
    <Screen>
      <ScreenHeader title="New recipe" subtitle="Add what goes in the pot. We work out one serving." back={back} />
      <RecipeEditor logTo={logTo} back={back} />
    </Screen>
  );
}
