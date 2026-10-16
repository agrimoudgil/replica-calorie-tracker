import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fail, fromError, unauthenticated } from "@/lib/api/http";

/** Deletes one of the person's own foods. Logged meals keep their numbers. */
export async function DELETE(_req: Request, ctx: RouteContext<"/api/foods/[id]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const { id } = await ctx.params;
  if (id.length > 100) return fail(404, "not_found", "That food isn't one of yours.");
  try {
    await db.deleteCustomFood(userId, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return fromError(err);
  }
}
