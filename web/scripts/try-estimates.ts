/*
 * Runs the app's real Claude meal estimator on your own photos and prints what it found.
 *   npm run try:estimates                (photos in ../test-photos)
 *   npm run try:estimates -- C:\path\to\folder
 * Needs ANTHROPIC_API_KEY in web/.env.local. Each photo is one paid API call
 * (roughly US$0.02 on Claude Opus 5.5), so at most MAX_PHOTOS are sent per run.
 * Photos stay on your computer except for that one call; nothing is saved.
 */
import fs from "node:fs";
import path from "node:path";
import { createClaudeEstimator } from "@/lib/ai/claude";
import { EstimateError } from "@/lib/ai/types";
import { sniffImage } from "@/lib/images";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { sumNutrients } from "@/lib/nutrition/portions";
import { healthScore } from "@/lib/nutrition/score";

const MAX_PHOTOS = 6;
const MAX_BYTES = 5 * 1024 * 1024; // Claude's per-image limit
const PRICE = { input: 4, output: 20 }; // US$ per million tokens, Claude Opus 5.5

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Add ANTHROPIC_API_KEY to web/.env.local first.");
    process.exit(1);
  }
  const dir = process.argv[2] ?? path.join(process.cwd(), "..", "test-photos");
  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|heic)$/i.test(f))
    .sort()
    .slice(0, MAX_PHOTOS);
  if (!files.length) {
    console.error(`No photos in ${dir}. Add JPEG, PNG or WebP files.`);
    process.exit(1);
  }

  const model = process.env.MEAL_MODEL ?? "claude-opus-5-5";
  const estimator = createClaudeEstimator({ model, foods: async () => [...SEED_FOODS] });
  let totalCost = 0;

  for (const file of files) {
    const bytes = new Uint8Array(fs.readFileSync(path.join(dir, file)));
    const mediaType = sniffImage(bytes);
    console.log(`\n=== ${file} (${Math.round(bytes.length / 1024)} KB)`);
    if (!mediaType) {
      console.log("  skipped: not JPEG/PNG/WebP (iPhone HEIC photos need converting; sharing via WhatsApp does it).");
      continue;
    }
    if (bytes.length > MAX_BYTES) {
      console.log("  skipped: over 5 MB. The app shrinks photos itself; for this test, share it via WhatsApp or email to get a smaller copy.");
      continue;
    }
    const started = Date.now();
    try {
      const r = await estimator.fromPhoto({ bytes, mediaType }, { mealType: "lunch", dietType: null });
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      const cost = (r.usage.inputTokens * PRICE.input + r.usage.outputTokens * PRICE.output) / 1e6;
      totalCost += cost;
      if (!r.isFood) {
        console.log(`  no food found (${seconds}s, ~US$${cost.toFixed(4)})`);
        continue;
      }
      for (const i of r.items) {
        const where = i.foodId ? "catalogue" : "AI numbers";
        console.log(
          `  - ${i.name}${i.nameHi ? ` (${i.nameHi})` : ""}: ${i.quantity} ${i.unit} ≈ ${i.grams} g → ${Math.round(i.nutrients.kcal)} kcal, P ${i.nutrients.proteinG} g, C ${i.nutrients.carbG} g, F ${i.nutrients.fatG} g [${i.confidence}, ${where}]`,
        );
      }
      const t = sumNutrients(r.items.map((i) => i.nutrients));
      console.log(`  TOTAL ${Math.round(t.kcal)} kcal · P ${Math.round(t.proteinG)} g · C ${Math.round(t.carbG)} g · F ${Math.round(t.fatG)} g · fibre ${Math.round(t.fiberG)} g · score ${healthScore(t) ?? "-"}/10`);
      console.log(`  ${r.model} · ${seconds}s · ${r.usage.inputTokens} in / ${r.usage.outputTokens} out tokens · ~US$${cost.toFixed(4)}`);
    } catch (err) {
      const msg = EstimateError.is(err) ? `${err.code}: ${err.message}` : err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      console.log(`  ERROR ${msg}`);
    }
  }
  console.log(`\nTotal approximate cost this run: US$${totalCost.toFixed(3)}`);
}

main();
