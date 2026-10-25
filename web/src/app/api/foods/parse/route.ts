import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { AI_TEXT_LOGGING, DAILY_ESTIMATE_LIMIT, EstimateError, GLOBAL_DAILY_AI_LIMIT, reader } from "@/lib/ai";
import { matchReadItems, type MatchedItem } from "@/lib/ai/read";
import { fromError, invalid, unauthenticated } from "@/lib/api/http";
import { parseMealSchema } from "@/lib/api/schemas";
import { parseMeal, MAX_PARSED_ITEMS } from "@/lib/nutrition/parse-meal";
import type { Food, Unit } from "@/lib/nutrition/types";

type Item = { food: Food; quantity: number; unit: Unit; ai?: Pick<MatchedItem, "confidence" | "portionEstimated" | "heard"> };
/** null when AI reading is off; otherwise whether it ran, and anything to tell the person. */
type AiInfo = { used: boolean; demo: boolean; question: string | null; note: string | null } | null;

const aiInfo = (over: Partial<NonNullable<AiInfo>> = {}): NonNullable<AiInfo> => ({ used: false, demo: false, question: null, note: null, ...over });

/**
 * "2 roti and dal" → foods with amounts, plus the parts it couldn't match. The free word
 * matcher always runs first. With AI_TEXT_LOGGING=on, the AI reads only what the matcher
 * couldn't find, and each food it names is looked up in the food list: calories and
 * macros always come from the list, never from the AI.
 */
export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const parsed = parseMealSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    const foods = await db.listFoods(userId);
    const free = parseMeal(parsed.data.text, foods);
    const items: Item[] = free.items.map(({ food, quantity, unit }) => ({ food, quantity, unit }));
    const reply = (unmatched: string[], ai: AiInfo) => NextResponse.json({ items: items.slice(0, MAX_PARSED_ITEMS), unmatched, ai });

    if (!AI_TEXT_LOGGING) return reply(free.unmatched, null);
    if (!free.unmatched.length) return reply([], aiInfo());

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await db.countAiUsageSince(userId, since)) >= DAILY_ESTIMATE_LIMIT) {
      return reply(free.unmatched, aiInfo({ note: `You've used today's ${DAILY_ESTIMATE_LIMIT} AI reads. Search for the rest below; it's free.` }));
    }
    if ((await db.countAllAiUsageSince(since)) >= GLOBAL_DAILY_AI_LIMIT) {
      return reply(free.unmatched, aiInfo({ note: "AI reading is resting for today. Search for the rest below; it's free." }));
    }

    const profile = await db.getProfile(userId);
    let read;
    try {
      read = await reader.fromText(free.unmatched.join(", "), { mealType: parsed.data.mealType ?? "snack", dietType: profile?.dietType ?? null });
    } catch (err) {
      if (EstimateError.is(err)) return reply(free.unmatched, aiInfo({ note: err.message }));
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
    items.push(...found.items.map(({ food, quantity, unit, confidence, portionEstimated, heard }) => ({ food, quantity, unit, ai: { confidence, portionEstimated, heard } })));
    return reply(found.unmatched, aiInfo({ used: true, demo: read.demo, question: read.question }));
  } catch (err) {
    return fromError(err);
  }
}
