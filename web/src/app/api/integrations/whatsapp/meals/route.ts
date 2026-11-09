import { NextResponse } from "next/server";
import { fail, fromError, invalid } from "@/lib/api/http";
import { buildItems, mealsBodySchema } from "@/lib/integrations/whatsapp/meals";
import { PATHS, readSigned } from "@/lib/integrations/whatsapp/request";
import { deleteWhatsAppMeals, removeLinkByRef, upsertWhatsAppMeal, userForLink } from "@/lib/integrations/whatsapp/store";
import { SEED_FOODS } from "@/lib/nutrition/foods";

const CATALOGUE = new Map(SEED_FOODS.map((food) => [food.id, food]));

/**
 * From the WhatsApp tracker, signed: saved-meal changes for one linked person, applied in order.
 * 410 when the link no longer exists (the tracker then drops it). A newer version always wins;
 * replays of an older one come back "stale" and change nothing.
 */
export async function POST(req: Request) {
  const signed = await readSigned(req, PATHS.meals);
  if (!signed.ok) return signed.response;
  const parsed = mealsBodySchema.safeParse(signed.body);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const userId = await userForLink(parsed.data.linkRef);
    if (!userId) return fail(410, "not_linked", "No longer linked.");
    const results: Array<{ op: string; externalId?: string; status: string }> = [];
    for (const op of parsed.data.ops) {
      if (op.op === "upsert") {
        const items = buildItems(op.meal.items, CATALOGUE);
        results.push({ op: op.op, externalId: op.externalId, status: await upsertWhatsAppMeal(userId, op.externalId, op.version, op.meal, items) });
      } else if (op.op === "delete") {
        const removed = await deleteWhatsAppMeals(userId, op.externalId);
        results.push({ op: op.op, externalId: op.externalId, status: removed ? "deleted" : "not_found" });
      } else {
        // DELETE MY DATA on WhatsApp: remove every copy, and the link with it.
        const removed = await deleteWhatsAppMeals(userId, null);
        await removeLinkByRef(parsed.data.linkRef);
        results.push({ op: op.op, status: `deleted ${removed}` });
        break;
      }
    }
    return NextResponse.json({ results });
  } catch (err) {
    return fromError(err);
  }
}
