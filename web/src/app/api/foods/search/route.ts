import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fromError, unauthenticated } from "@/lib/api/http";

/** Catalogue and the user's own foods matching ?q= (name, Hindi name or alias). */
export async function GET(request: NextRequest) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const q = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 60);
  try {
    return NextResponse.json({ foods: await db.searchFoods(userId, q, 12) });
  } catch (err) {
    return fromError(err);
  }
}
