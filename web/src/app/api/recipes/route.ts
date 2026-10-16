import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { recipeSchema } from "@/lib/api/schemas";

/** Saves several foods as one dish. It then logs, searches and favourites like any food. */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = recipeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    return NextResponse.json(await db.createRecipe(userId, parsed.data), { status: 201 });
  } catch (err) {
    return fromError(err);
  }
}
