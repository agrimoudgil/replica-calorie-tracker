import fs from "node:fs";
import { defineConfig } from "@playwright/test";

/*
 * End-to-end tests against the production build and the LIVE Supabase project in
 * .env.local: npm run test:e2e (it builds first). Each test makes its own throwaway
 * example.com user and deletes it afterwards. Runs in the installed Microsoft Edge,
 * so no browser download is needed. Plan and results: replica/test-plan.md.
 */
if (fs.existsSync(".env.local")) process.loadEnvFile(".env.local");

const PORT = 3211;

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  workers: 3, // a few users at once is plenty for a shared free-plan database
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "msedge",
    viewport: { width: 390, height: 844 },
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/sign-in`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
