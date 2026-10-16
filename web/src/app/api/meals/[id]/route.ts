import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fail, fromError, invalid, unauthenticated } from "@/lib/api/http";
import { saveMealSchema } from "@/lib/api/schemas";

export async function GET(_req: Request, ctx: RouteContext<"/api/meals/[id]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const meal = await db.getMeal(userId, (await ctx.params).id);
  return meal ? NextResponse.json(meal) : fail(404, "not_found", "Meal not found.");
}

/** Saves a draft (or edits a saved meal): new portions, removed items, meal type. */
export async function PUT(req: Request, ctx: RouteContext<"/api/meals/[id]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = saveMealSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    return NextResponse.json(await db.saveMeal(userId, (await ctx.params).id, parsed.data));
  } catch (err) {
    return fromError(err);
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/meals/[id]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  try {
    await db.deleteMeal(userId, (await ctx.params).id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return fromError(err);
  }
}
