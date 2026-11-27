import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { feedbackSchema } from "@/lib/api/schemas";

/**
 * Feedback from the signed-in person: the one-time question after their third saved meal, or
 * the Profile form. Stored only for them (and the owner's anonymous totals); 10 a day at most.
 */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = feedbackSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    await db.saveFeedback(userId, parsed.data);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return fromError(err);
  }
}
