import { redirect } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { MyFoods } from "./my-foods";

export const metadata = { title: "My foods · Replica calorie tracker" };

/** The person's own foods: see, create and delete. */
export default async function MyFoodsPage() {
  const userId = await requireUserId();
  if (!(await db.getProfile(userId))) redirect("/onboarding");
  const foods = await db.listCustomFoods(userId);
  return (
    <Screen>
      <ScreenHeader title="My foods" subtitle="Foods you created. Only you can see them." back="/profile" />
      <MyFoods initial={foods} />
    </Screen>
  );
}
