import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { catalogueItems } from "@/lib/data/catalogue-items";
import { currentUserId } from "@/lib/data/session";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { catalogueMealSchema } from "@/lib/api/schemas";

/**
 * F02/F03: saves a meal built from catalogue foods in one step (the add-food screen
 * is its own review). Safe to retry with the same id: the draft is reused and the
 * same items are saved again.
 */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = catalogueMealSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  const input = parsed.data;
  try {
    const items = catalogueItems(input.items, await db.listFoods(userId));
    const draft = await db.createDraftMeal(userId, {
      id: input.id,
      mealType: input.mealType,
      inputMethod: input.inputMethod,
      eatenAt: input.eatenAt,
      photoPath: null,
      rawText: input.rawText ?? null,
      aiModel: null,
      items,
    });
    const saved = await db.saveMeal(userId, draft.id, {
      mealType: input.mealType,
      items: draft.items.map(({ id, quantity, unit }) => ({ id, quantity, unit })),
    });
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return fromError(err);
  }
}
