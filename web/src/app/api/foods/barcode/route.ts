import { NextResponse } from "next/server";
import { fail, unauthenticated } from "@/lib/api/http";
import { currentUserId } from "@/lib/data/session";
import { cleanBarcode, lookupBarcode, OffUnavailable } from "@/lib/off";

/** GET /api/foods/barcode?code=… : a packaged food's numbers from Open Food Facts (signed in only). */
export async function GET(req: Request) {
  if (!(await currentUserId())) return unauthenticated();
  const code = cleanBarcode(new URL(req.url).searchParams.get("code") ?? "");
  if (!code) return fail(400, "invalid", "A barcode is 8 to 14 digits, usually under the stripes.");
  try {
    const product = await lookupBarcode(code);
    if (!product) return fail(404, "not_found", "No food with that barcode in Open Food Facts yet. You can create it as your own food.");
    return NextResponse.json({ product }, { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (err) {
    if (err instanceof OffUnavailable) {
      console.warn(`barcode lookup failed: ${err.message}`);
      return fail(503, "unavailable", "Barcode lookups are busy right now. Try again in a minute, or create it as your own food.");
    }
    throw err;
  }
}
