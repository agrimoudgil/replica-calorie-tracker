import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { AI_TEXT_LOGGING, DAILY_ESTIMATE_LIMIT, EstimateError, GLOBAL_DAILY_AI_LIMIT, reader } from "@/lib/ai";
import { matchReadItems, type MatchedItem, type TextEstimate } from "@/lib/ai/read";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { parseMealSchema } from "@/lib/api/schemas";
import { parseMeal, MAX_PARSED_ITEMS } from "@/lib/nutrition/parse-meal";
import type { Food, Unit } from "@/lib/nutrition/types";

type Item = { food: Food; quantity: number; unit: Unit; ai?: Pick<MatchedItem, "confidence" | "portionEstimated" | "heard" | "aiKcal"> };
/** null when AI reading is off; otherwise whether it ran, and anything to tell the person. */
type AiInfo = { used: boolean; demo: boolean; question: string | null; note: string | null } | null;

const aiInfo = (over: Partial<NonNullable<AiInfo>> = {}): NonNullable<AiInfo> => ({ used: false, demo: false, question: null, note: null, ...over });

/**
 * "2 roti and dal" → foods with amounts. With AI_TEXT_LOGGING=on, the AI reads the whole
 * message and names each food and portion; each is looked up in the food list, whose
 * numbers are used whenever it has the food. A food the list doesn't have comes back as
 * an estimate: the AI's own calories and macros for the portion, checked and labelled.
 * The free word matcher reads the message when AI is off, over the daily limits, or fails.
 */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = parseMealSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    const foods = await db.listFoods(userId);
    const reply = (items: Item[], estimates: TextEstimate[], unmatched: string[], ai: AiInfo) =>
      NextResponse.json({ items: items.slice(0, MAX_PARSED_ITEMS), estimates: estimates.slice(0, MAX_PARSED_ITEMS), unmatched, ai });
    const free = (ai: AiInfo) => {
      const r = parseMeal(parsed.data.text, foods);
      return reply(r.items.map(({ food, quantity, unit }) => ({ food, quantity, unit })), [], r.unmatched, ai);
    };

    if (!AI_TEXT_LOGGING) return free(null);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await db.countAiUsageSince(userId, since)) >= DAILY_ESTIMATE_LIMIT) {
      return free(aiInfo({ note: `You've used today's ${DAILY_ESTIMATE_LIMIT} AI reads, so this used the free food matcher. Search for anything missing; it's free.` }));
    }
    if ((await db.countAllAiUsageSince(since)) >= GLOBAL_DAILY_AI_LIMIT) {
      return free(aiInfo({ note: "AI reading is resting for today, so this used the free food matcher. Search for anything missing; it's free." }));
    }

    const profile = await db.getProfile(userId);
    let read;
    try {
      read = await reader.fromText(parsed.data.text, { mealType: parsed.data.mealType ?? "snack", dietType: profile?.dietType ?? null });
    } catch (err) {
      if (EstimateError.is(err)) return free(aiInfo({ note: `${err.message} This used the free food matcher.` }));
      throw err;
    }
    if (!read.demo) {
      await db.recordAiUsage({
        userId,
        kind: "text",
        model: read.model,
        inputTokens: read.usage.inputTokens,
        outputTokens: read.usage.outputTokens,
        createdAt: new Date().toISOString(),
      });
    }

    const found = await matchReadItems(read.items, foods, (q) => db.searchFoods(userId, q, 5));
    const items: Item[] = found.items.map(({ food, quantity, unit, confidence, portionEstimated, heard, aiKcal }) => ({
      food,
      quantity,
      unit,
      ai: { confidence, portionEstimated, heard, aiKcal },
    }));
    return reply(items, found.estimated, found.unmatched, aiInfo({ used: true, demo: read.demo, question: read.question }));
  } catch (err) {
    return fromError(err);
  }
}
