import "server-only";
import path from "node:path";
import { supabaseEnabled } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createFileStore } from "./file-store";
import { createSupabaseStore } from "./supabase-store";
import type { DataLayer } from "./types";

// Supabase when it is configured in .env.local; otherwise the local development
// store in web/.data. Screens only ever see the DataLayer contract.
const g = globalThis as typeof globalThis & { __rctDataLayer?: DataLayer };

export const db: DataLayer = (g.__rctDataLayer ??= supabaseEnabled
  ? createSupabaseStore({ user: createClient, admin: createAdminClient })
  : createFileStore(path.join(process.cwd(), ".data")));

export * from "./types";
