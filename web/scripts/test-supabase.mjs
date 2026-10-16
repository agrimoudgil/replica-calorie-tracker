// Runs the live Supabase tests with web/.env.local loaded. Usage: npm run test:supabase
import { spawnSync } from "node:child_process";
import fs from "node:fs";

if (!fs.existsSync(".env.local")) {
  console.error("No web/.env.local yet. Follow replica/backend.md, 'Your steps', first.");
  process.exit(1);
}
process.loadEnvFile(".env.local");
const result = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run"], {
  stdio: "inherit",
  env: { ...process.env, SUPABASE_LIVE_TESTS: "1" },
});
process.exit(result.status ?? 1);
