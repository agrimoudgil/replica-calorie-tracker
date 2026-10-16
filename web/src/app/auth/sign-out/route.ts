import { NextResponse, type NextRequest } from "next/server";
import { clearDevUser } from "@/lib/data/session";
import { SIGN_IN_PATH, supabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/** POST only (a form button), so a link or image can't sign someone out. scope=global ends every device's session. */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  const scope = form?.get("scope") === "global" ? "global" : "local";
  if (supabaseEnabled) {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope });
  } else {
    await clearDevUser();
  }
  return NextResponse.redirect(new URL(SIGN_IN_PATH, request.nextUrl.origin), { status: 303 });
}
