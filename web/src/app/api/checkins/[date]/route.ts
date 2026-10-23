import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { isIsoDate, localDate } from "@/lib/dates";
import { fail, fromError, invalid, unauthenticated } from "@/lib/api/http";
import { checkInSchema } from "@/lib/api/schemas";

/** The signed-in person and a check-in day that isn't in the future (their time zone), or a response to send. */
async function dayFor(ctx: RouteContext<"/api/checkins/[date]">) {
  const userId = await currentUserId();
  if (!userId) return { error: unauthenticated() };
  const profile = await db.getProfile(userId);
  if (!profile) return { error: unauthenticated() };
  const { date } = await ctx.params;
  if (!isIsoDate(date)) return { error: fail(400, "invalid", "Use a date like 2026-10-23.") };
  if (date > localDate(new Date(), profile.timezone)) return { error: fail(400, "invalid", "You can't check in for a day that hasn't started.") };
  return { userId, date };
}

/** Saves the day's check-in: last night's sleep, energy and soreness. Replaces any earlier one. */
export async function PUT(req: Request, ctx: RouteContext<"/api/checkins/[date]">) {
  const day = await dayFor(ctx);
  if ("error" in day) return day.error;
  const parsed = checkInSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  try {
    return NextResponse.json(await db.saveCheckIn(day.userId, day.date, parsed.data));
  } catch (err) {
    return fromError(err);
  }
}

export async function DELETE(_req: Request, ctx: RouteContext<"/api/checkins/[date]">) {
  const day = await dayFor(ctx);
  if ("error" in day) return day.error;
  try {
    await db.deleteCheckIn(day.userId, day.date);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return fromError(err);
  }
}
