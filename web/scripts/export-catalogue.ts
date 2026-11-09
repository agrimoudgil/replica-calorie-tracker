/*
 * Writes Oswald's food catalogue (the shared list behind typed logging) as JSON, for the
 * WhatsApp tracker to bundle, so both apps count the same dish the same way.
 *   npm run export:catalogue -- <output.json>
 * Catalogue only: world (USDA) foods are for search, which the typing box doesn't use either.
 * No database, no network, no keys.
 */
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { DISH_RECIPES, INGREDIENT_ONLY_IDS, SEED_FOODS } from "@/lib/nutrition/foods";

const out = process.argv[2];
if (!out) {
  console.error("Usage: npm run export:catalogue -- <output.json>");
  process.exit(1);
}

const round = (n: number | undefined) => (n === undefined ? undefined : Math.round(n * 100) / 100);

const foods = SEED_FOODS.map((f) => ({
  id: f.id,
  name: f.name,
  nameHi: f.nameHi,
  aliases: f.aliases,
  dietTags: f.dietTags,
  unitGrams: f.unitGrams,
  defaultUnit: f.defaultUnit,
  per100g: {
    kcal: round(f.per100g.kcal),
    proteinG: round(f.per100g.proteinG),
    carbG: round(f.per100g.carbG),
    fatG: round(f.per100g.fatG),
    fiberG: round(f.per100g.fiberG),
  },
  recipe: DISH_RECIPES.has(f.id),
  ingredientOnly: INGREDIENT_ONLY_IDS.has(f.id),
}));

let commit = "unknown";
try {
  commit = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
} catch {
  // Not a git checkout; the hash below still identifies the content.
}
const body = JSON.stringify(foods);
const doc = {
  source: "oswald-web-catalogue",
  commit,
  sha256: createHash("sha256").update(body).digest("hex"),
  count: foods.length,
  foods,
};
fs.writeFileSync(out, JSON.stringify(doc, null, 0) + "\n");
console.log(`Wrote ${foods.length} foods (commit ${commit}, sha256 ${doc.sha256.slice(0, 12)}) to ${out}`);
