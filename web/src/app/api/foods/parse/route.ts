import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { parseMealSchema } from "@/lib/api/schemas";
import { parseMeal } from "@/lib/nutrition/parse-meal";

/** "2 roti and dal" → catalogue foods with amounts, plus the parts it couldn't match. No AI. */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = parseMealSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    const result = parseMeal(parsed.data.text, await db.listFoods(userId));
    return NextResponse.json({
      items: result.items.map(({ food, quantity, unit }) => ({ food, quantity, unit })),
      unmatched: result.unmatched,
    });
  } catch (err) {
    return fromError(err);
  }
}
