import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { isIsoDate } from "@/lib/dates";
import { fail, unauthenticated } from "@/lib/api/http";

/** Totals, targets and saved meals for one of the user's local days. */
export async function GET(_req: Request, ctx: RouteContext<"/api/days/[date]">) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const { date } = await ctx.params;
  if (!isIsoDate(date)) return fail(400, "invalid", "Use a date like 2026-10-16.");
  const profile = await db.getProfile(userId);
  if (!profile) return unauthenticated();
  const day = await db.getDay(userId, date);
  return NextResponse.json({ ...day, targets: profile.targets });
}
