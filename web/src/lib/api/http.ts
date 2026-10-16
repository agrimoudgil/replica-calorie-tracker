import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { DataError } from "@/lib/data/types";

export type ApiError = { error: string; message: string; fields?: Record<string, string> };

export function fail(status: number, error: string, message: string, fields?: Record<string, string>) {
  return NextResponse.json<ApiError>({ error, message, ...(fields ? { fields } : {}) }, { status });
}

export function invalid(err: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fail(400, "invalid", "Some fields need fixing.", fields);
}

export const unauthenticated = () => fail(401, "unauthenticated", "Set up your profile first.");

/** Maps data-layer errors to HTTP; anything else is a 500 without internal detail. */
export function fromError(err: unknown) {
  if (DataError.is(err)) {
    const status = { not_found: 404, conflict: 409, invalid: 400, forbidden: 403 }[err.code];
    return fail(status, err.code, err.message);
  }
  console.error("Unexpected API error:", err instanceof Error ? err.name : "unknown");
  return fail(500, "server", "Something went wrong on our side. Try again.");
}
