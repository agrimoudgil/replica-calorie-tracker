import "server-only";
import path from "node:path";
import { createFileStore } from "./file-store";
import type { DataLayer } from "./types";

// One store per server process (survives dev hot reloads). Swapped for the
// Supabase implementation by /replica-backend; screens only see DataLayer.
const g = globalThis as typeof globalThis & { __rctDataLayer?: DataLayer };

export const db: DataLayer = (g.__rctDataLayer ??= createFileStore(path.join(process.cwd(), ".data")));

export * from "./types";
