import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { MyFoods } from "./my-foods";

export const metadata = { title: "My foods and recipes" };

/** S13: the person's own foods and recipes: see, create, log and delete. */
export default async function MyFoodsPage() {
  const userId = await requireUserId();
  if (!(await db.getProfile(userId))) redirect("/onboarding");
  const foods = await db.listCustomFoods(userId);
  return (
    <Screen>
      <ScreenHeader title="My foods" subtitle="Your recipes and foods. Only you can see them." back="/profile" />
      <MyFoods initial={foods} />
    </Screen>
  );
}
