import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { targetsSchema } from "@/lib/api/schemas";

/** Goals & budgets: save your own daily targets. Body details stop changing them. */
export async function PUT(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = targetsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    return NextResponse.json(await db.setTargets(userId, parsed.data));
  } catch (err) {
    return fromError(err);
  }
}

/** Back to the targets worked out from your body details and goal. */
export async function DELETE() {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  try {
    return NextResponse.json(await db.setTargets(userId, null));
  } catch (err) {
    return fromError(err);
  }
}
