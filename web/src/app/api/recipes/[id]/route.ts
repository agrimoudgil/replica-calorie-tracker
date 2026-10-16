import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { recipeSchema } from "@/lib/api/schemas";

/** Changes a recipe from now on. Meals already logged keep their numbers. Delete it via DELETE /api/foods/[id]. */
export async function PUT(req: Request, ctx: RouteContext<"/api/recipes/[id]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = recipeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    return NextResponse.json(await db.updateRecipe(userId, (await ctx.params).id, parsed.data));
  } catch (err) {
    return fromError(err);
  }
}
