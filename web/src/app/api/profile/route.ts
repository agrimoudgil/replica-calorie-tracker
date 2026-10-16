import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { currentUserId, ensureUserId } from "@/lib/data/session";
import { fail, fromError, invalid, unauthenticated } from "@/lib/api/http";
import { profileSchema } from "@/lib/api/schemas";

export async function GET() {
  const userId = await currentUserId();
  const profile = userId ? await db.getProfile(userId) : null;
  if (!profile) return fail(404, "not_found", "No profile yet.");
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = profileSchema().safeParse(body);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const userId = await ensureUserId();
    if (!userId) return unauthenticated();
    const { displayName, sex, birthYear, heightCm, weightKg, activityLevel, goal, dietType } = parsed.data;
    const profile = await db.upsertProfile(userId, { displayName, sex, birthYear, heightCm, weightKg, activityLevel, goal, dietType });
    return NextResponse.json(profile);
  } catch (err) {
    return fromError(err);
  }
}
