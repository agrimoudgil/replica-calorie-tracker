import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests by default. SUPABASE_LIVE_TESTS=1 (npm run test:supabase) runs only the
// *.int.test.ts files, which talk to the real Supabase project in .env.local.
const live = process.env.SUPABASE_LIVE_TESTS === "1";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      // Server-only modules are plain functions under test.
      "server-only": path.resolve(import.meta.dirname, "node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    include: live ? ["src/**/*.int.test.ts"] : ["src/**/*.test.ts"],
    exclude: live ? ["node_modules/**"] : ["src/**/*.int.test.ts", "node_modules/**"],
  },
});
