import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fail, unauthenticated } from "@/lib/api/http";
import { sniffImage } from "@/lib/images";

/** The photo of one of the user's own meals. Other users' ids look like missing ones. */
export async function GET(_req: Request, ctx: RouteContext<"/api/photos/[id]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const bytes = await db.readPhoto(userId, (await ctx.params).id).catch(() => null);
  if (!bytes) return fail(404, "not_found", "Photo not found.");
  return new NextResponse(Buffer.from(bytes), {
    headers: { "Content-Type": sniffImage(bytes) ?? "application/octet-stream", "Cache-Control": "private, max-age=600" },
  });
}
