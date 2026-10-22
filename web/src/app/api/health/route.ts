import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseEnabled } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

/**
 * For an uptime monitor: 200 when the app can read its database (one row of the shared
 * food list), 503 when it can't. Says nothing else, so it is safe to leave public.
 */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  if (!supabaseEnabled) return NextResponse.json({ ok: true, database: "not used" }, { headers });
  const { error } = await createAdminClient().from("foods").select("id").is("owner_id", null).limit(1);
  if (error) {
    console.warn(`health check: database error ${error.code ?? "unknown"}`);
    return NextResponse.json({ ok: false, database: "unreachable" }, { status: 503, headers });
  }
  return NextResponse.json({ ok: true, database: "ok" }, { headers });
}
