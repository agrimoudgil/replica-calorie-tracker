import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fail, fromError, invalid, unauthenticated } from "@/lib/api/http";
import { favouriteSchema } from "@/lib/api/schemas";

/** Star (favourite: true) or un-star a food. Safe to repeat. */
export async function PUT(req: Request, ctx: RouteContext<"/api/favourites/[foodId]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = favouriteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  const { foodId } = await ctx.params;
  if (foodId.length > 100) return fail(400, "invalid", "Unknown food.");
  try {
    await db.setFavourite(userId, foodId, parsed.data.favourite);
    return NextResponse.json({ foodId, favourite: parsed.data.favourite });
  } catch (err) {
    return fromError(err);
  }
}
