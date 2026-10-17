import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { DAILY_ESTIMATE_LIMIT, EstimateError, estimator } from "@/lib/ai";
import { fail, fromError, invalid, unauthenticated } from "@/lib/api/http";
import { photoFieldsSchema } from "@/lib/api/schemas";
import { sniffImage } from "@/lib/images";

const MAX_BYTES = 2 * 1024 * 1024;

/** F01: photo → AI estimate → draft meal for review. Safe to retry with the same mealId. */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const profile = await db.getProfile(userId);
  if (!profile) return unauthenticated();

  const form = await req.formData().catch(() => null);
  if (!form) return fail(400, "invalid", "Send the photo as a form upload.");
  const fields = photoFieldsSchema.safeParse({
    mealId: form.get("mealId"),
    mealType: form.get("mealType"),
    eatenAt: form.get("eatenAt"),
  });
  if (!fields.success) return invalid(fields.error);
  const { mealId, mealType, eatenAt } = fields.data;

  try {
    const existing = await db.getMeal(userId, mealId);
    if (existing) return NextResponse.json(existing);

    const image = form.get("image");
    if (!(image instanceof File)) return fail(400, "invalid", "Add a photo of your meal.");
    if (image.size > MAX_BYTES) return fail(413, "too_large", "That photo is too large. Try again; we shrink it before upload.");
    const bytes = new Uint8Array(await image.arrayBuffer());
    const mediaType = sniffImage(bytes);
    if (!mediaType) return fail(415, "unsupported", "Use a JPEG, PNG or WebP photo.");

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await db.countAiUsageSince(userId, since)) >= DAILY_ESTIMATE_LIMIT) {
      return fail(429, "quota", `You've used today's ${DAILY_ESTIMATE_LIMIT} free photo estimates. You can still search and add foods.`);
    }

    const result = await estimator.fromPhoto({ bytes, mediaType }, { mealType, dietType: profile.dietType });
    if (!result.demo) {
      await db.recordAiUsage({
        userId,
        kind: "photo",
        model: result.model,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        createdAt: new Date().toISOString(),
      });
    }
    if (!result.isFood) return fail(422, "not_food", "We couldn't find food in that photo.");

    const photoPath = await db.savePhoto(userId, mealId, bytes);
    const meal = await db.createDraftMeal(userId, {
      id: mealId,
      mealType,
      inputMethod: "photo",
      eatenAt,
      photoPath,
      rawText: null,
      aiModel: result.model,
      items: result.items.map((i) => ({
        foodId: i.foodId,
        name: i.name,
        nameHi: i.nameHi,
        quantity: i.quantity,
        unit: i.unit,
        grams: i.grams,
        nutrients: i.nutrients,
        source: "ai",
        aiConfidence: i.confidence,
      })),
    });
    // Where each item is in the photo, by item id: the browser keeps these for the review screen.
    const boxes = Object.fromEntries(meal.items.flatMap((item) => (result.items[item.position]?.box ? [[item.id, result.items[item.position].box]] : [])));
    return NextResponse.json({ ...meal, boxes }, { status: 201 });
  } catch (err) {
    if (EstimateError.is(err)) {
      return fail(err.code === "unavailable" ? 503 : 422, err.code, err.message);
    }
    return fromError(err);
  }
}
