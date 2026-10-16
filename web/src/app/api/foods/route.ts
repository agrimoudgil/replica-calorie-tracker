import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { customFoodSchema } from "@/lib/api/schemas";

/** The signed-in person's own foods. */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  try {
    return NextResponse.json({ foods: await db.listCustomFoods(userId) });
  } catch (err) {
    return fromError(err);
  }
}

/** Creates a food from one serving's nutrition; it then shows up in search like any other. */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = customFoodSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    return NextResponse.json(await db.createCustomFood(userId, parsed.data), { status: 201 });
  } catch (err) {
    return fromError(err);
  }
}
