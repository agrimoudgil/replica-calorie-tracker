import { notFound } from "next/navigation";
import { Screen, ScreenHeader } from "@/components/screen";
import { db } from "@/lib/data";
import { requireUserId } from "@/lib/data/session";
import { RecipeEditor } from "../recipe-editor";

export const metadata = { title: "Edit recipe · Replica calorie tracker" };

/** S13b: change, log or delete one of the person's recipes. */
export default async function EditRecipePage({ params }: PageProps<"/recipes/[id]">) {
  const userId = await requireUserId();
  const recipe = await db.getRecipe(userId, (await params).id);
  if (!recipe) notFound();
  return (
    <Screen>
      <ScreenHeader title="Edit recipe" subtitle={recipe.food.name} back="/profile/foods" />
      <RecipeEditor recipe={recipe} back="/profile/foods" />
    </Screen>
  );
}
