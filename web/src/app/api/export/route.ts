import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId } from "@/lib/data/session";
import { DEFAULT_TIMEZONE, localDate } from "@/lib/dates";
import { checkInsCsv } from "@/lib/export/checkins-csv";
import { dailyTotalsCsv, mealItemsCsv } from "@/lib/export/meals-csv";
import { fail, fromError, unauthenticated } from "@/lib/api/http";

/** Fix #3: GET /api/export?file=meals (one row per food), ?file=days (one row per day) or ?file=checkins, as CSV. */
export async function GET(req: Request) {
  const userId = await currentUserId();
  if (!userId) return unauthenticated();
  const file = new URL(req.url).searchParams.get("file");
  if (file !== "meals" && file !== "days" && file !== "checkins") return fail(400, "invalid", "Ask for file=meals, file=days or file=checkins.");
  try {
    const timeZone = (await db.getProfile(userId))?.timezone ?? DEFAULT_TIMEZONE;
    const body =
      file === "checkins"
        ? checkInsCsv(await db.getCheckInsBetween(userId, "1900-01-01", "9999-12-31"))
        : file === "meals"
          ? mealItemsCsv(await db.getMealsBetween(userId, "1900-01-01", "9999-12-31"), timeZone)
          : dailyTotalsCsv(await db.getMealsBetween(userId, "1900-01-01", "9999-12-31"));
    const name = `${{ meals: "meals", days: "daily-totals", checkins: "check-ins" }[file]}-${localDate(new Date(), timeZone)}.csv`;
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return fromError(err);
  }
}
