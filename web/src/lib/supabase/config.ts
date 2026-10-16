/**
 * Supabase is used when its URL and publishable key are set (web/.env.local).
 * Without them the app runs on the local development store and a cookie user,
 * so it still works with no accounts at all.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/** Where a signed-out visitor is sent. */
export const SIGN_IN_PATH = supabaseEnabled ? "/sign-in" : "/onboarding";

export const PHOTO_BUCKET = "meal-photos";
