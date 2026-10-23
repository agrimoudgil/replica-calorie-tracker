/*
 * Builds Oswald's world food list from USDA FoodData Central (public domain, CC0):
 *   node --import tsx scripts/build-world-foods.ts <SR Legacy CSV folder> <Foundation Foods CSV folder>
 * Download the two CSV zips from https://fdc.nal.usda.gov/download-datasets/ (SR Legacy
 * 2018-04 and Foundation Foods), unzip them, and pass the folders that hold food.csv.
 * Writes src/lib/nutrition/world/usda-foods.json: nutrients per 100 g plus the grams in a
 * katori, piece, glass or tbsp where USDA gives a matching portion. Run again to refresh.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

type Row = Record<string, string>;
type Portion = { unit: string; amount: number; grams: number };

/** Splits one CSV line, honouring "quoted, fields" and "" escapes. */
function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

async function eachRow(file: string, onRow: (row: Row) => void) {
  const lines = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
  let header: string[] | null = null;
  for await (const line of lines) {
    if (!line) continue;
    const cells = splitCsv(line);
    if (!header) header = cells;
    else onRow(Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ""])));
  }
}

// Nutrient ids in FoodData Central.
const N = { kcal: "1008", kcalGeneral: "2047", kcalSpecific: "2048", protein: "1003", fat: "1004", carb: "1005", fiber: "1079", sugar: "2000", sugarNlea: "1063", satFat: "1258", sodium: "1093", calcium: "1087", iron: "1089" };
const WANTED = new Set(Object.values(N));
const SKIP_CATEGORIES = new Set(["Baby Foods", "Quality Control Materials"]);

const COUNT_WORDS = /^(piece|pieces|slice|slices|medium|large|small|extra large|jumbo|unit|serving|bar|waffle|fillet|chop|link|links|cookie|muffin|biscuit|cracker|patty|sandwich|burger|item|roll|bun|cake|egg|fruit|leaf|stalk|spear|wing|drumstick|thigh|breast|leg|pie|pancake|taco|burrito|tortilla|bagel|doughnut|donut|pita|sausage|strip|nugget|frankfurter|wedge|segment|clove|pod|head|ear|bird|steak|roast|tablet|cutlet)\b/;
const NOT_COUNT = /^(oz|lb|cup|cups|tbsp|tablespoon|tsp|teaspoon|fl oz|package|can|jar|container|box|bottle|pint|quart|gallon|liter|ml|milliliter|g|gram|dash|pinch|cubic)\b/;
const DRINK_NAME = /\b(juice|milk|beverage|drink|tea|coffee|soda|smoothie|shake|beer|wine|nectar|lemonade|cola|liqueur|whiskey|vodka|rum|gin|brandy|kefir|buttermilk|lassi)\b/i;
const NOT_DRINK = /\b(powder|dry|dried|granules|mix|concentrate|frozen|condensed|evaporated|cheese|chocolate, |candies|bread|cake)\b/i;

const round1 = (n: number) => Math.round(n * 10) / 10;
const clampUnit = (g: number) => (Number.isFinite(g) && g > 0 ? round1(Math.min(Math.max(g, 1), 2000)) : undefined);

async function readDataset(dir: string, keepTypes: Set<string>) {
  const categories = new Map<string, string>();
  await eachRow(path.join(dir, "food_category.csv"), (r) => categories.set(r.id, r.description));
  const units = new Map<string, string>();
  await eachRow(path.join(dir, "measure_unit.csv"), (r) => units.set(r.id, r.name.toLowerCase()));

  const foods = new Map<string, { name: string; category: string }>();
  await eachRow(path.join(dir, "food.csv"), (r) => {
    if (!keepTypes.has(r.data_type)) return;
    const category = categories.get(r.food_category_id) ?? "";
    if (SKIP_CATEGORIES.has(category)) return;
    foods.set(r.fdc_id, { name: r.description.trim(), category });
  });

  const nutrients = new Map<string, Map<string, number>>();
  await eachRow(path.join(dir, "food_nutrient.csv"), (r) => {
    if (!foods.has(r.fdc_id) || !WANTED.has(r.nutrient_id)) return;
    const amount = Number(r.amount);
    if (!Number.isFinite(amount)) return;
    let m = nutrients.get(r.fdc_id);
    if (!m) nutrients.set(r.fdc_id, (m = new Map()));
    m.set(r.nutrient_id, amount);
  });

  const portions = new Map<string, Portion[]>();
  await eachRow(path.join(dir, "food_portion.csv"), (r) => {
    if (!foods.has(r.fdc_id)) return;
    const amount = Number(r.amount) || 1;
    const grams = Number(r.gram_weight);
    if (!(grams > 0)) return;
    // SR Legacy writes the unit in words ("cup, chopped"); Foundation uses a unit id.
    const unitName = r.measure_unit_id && r.measure_unit_id !== "9999" ? (units.get(r.measure_unit_id) ?? "") : "";
    const words = (r.portion_description || r.modifier || "").toLowerCase().trim();
    const unit = unitName && unitName !== "undetermined" ? unitName : words;
    const list = portions.get(r.fdc_id) ?? [];
    list.push({ unit, amount, grams });
    portions.set(r.fdc_id, list);
  });
  return { foods, nutrients, portions };
}

function unitGramsFor(name: string, category: string, list: Portion[]) {
  const per = (p: Portion) => p.grams / p.amount;
  const first = (test: (u: string) => boolean) => list.find((p) => test(p.unit));
  const cup = first((u) => /^cups?\b/.test(u));
  const tbsp = first((u) => /^(tbsp|tablespoons?)\b/.test(u));
  const flOz = first((u) => /^fl oz\b/.test(u));
  // A piece: one item, not a serving of several. Any portion that isn't a weight or volume
  // can be one ("slice", "croissant, medium"); a medium one wins, then a counted item,
  // then anything else, and a "serving" (often several items) comes last.
  const pieceRank = (u: string) => (/\bmedium\b/.test(u) ? 0 : /\bserving\b|\bnlea\b/.test(u) ? 3 : COUNT_WORDS.test(u) ? 1 : 2);
  const piece = list
    .filter((p) => /^[a-z]/.test(p.unit) && !NOT_COUNT.test(p.unit) && !/^(racc|miniature|mini)\b/.test(p.unit) && !/\b(miniature|mini|bite size)\b/.test(p.unit))
    .map((p, i) => ({ p, rank: pieceRank(p.unit), i }))
    .sort((a, b) => a.rank - b.rank || a.i - b.i)[0]?.p;
  const drink = (/^(Beverages|Alcoholic Beverages)$/.test(category) || DRINK_NAME.test(name)) && !NOT_DRINK.test(name);

  const unitGrams: Record<string, number> = { g: 1 };
  if (drink) {
    const glass = flOz ? clampUnit(per(flOz) * (250 / 29.5735)) : cup ? clampUnit(per(cup) * (250 / 240)) : undefined;
    if (glass) unitGrams.glass = glass;
  } else if (cup) {
    const katori = clampUnit(per(cup) * (150 / 240));
    if (katori) unitGrams.katori = katori;
  }
  if (tbsp) {
    const g = clampUnit(per(tbsp));
    if (g) unitGrams.tbsp = g;
  }
  if (piece) {
    const g = clampUnit(per(piece));
    if (g) unitGrams.piece = g;
  }
  const defaultUnit = unitGrams.glass ? "glass" : unitGrams.piece ? "piece" : unitGrams.katori ? "katori" : "g";
  return { unitGrams, defaultUnit };
}

/** [kcal, protein, carbs, fat, fibre, sugar, sat fat, sodium mg, calcium mg, iron mg] per 100 g; null = not measured. */
function nutrientRow(m: Map<string, number>): Array<number | null> | null {
  const get = (id: string) => (m.has(id) ? Math.max(0, m.get(id)!) : null);
  const protein = get(N.protein);
  const fat = get(N.fat);
  const carb = get(N.carb);
  let kcal = get(N.kcal) ?? get(N.kcalGeneral) ?? get(N.kcalSpecific);
  if (kcal === null && (protein !== null || fat !== null || carb !== null)) kcal = (protein ?? 0) * 4 + (carb ?? 0) * 4 + (fat ?? 0) * 9;
  if (kcal === null || kcal > 950) return null; // nothing usable, or not food per 100 g
  const r2 = (n: number | null) => (n === null ? null : Math.round(n * 100) / 100);
  return [kcal, protein ?? 0, carb ?? 0, fat ?? 0, get(N.fiber) ?? 0, get(N.sugar) ?? get(N.sugarNlea), get(N.satFat), get(N.sodium), get(N.calcium), get(N.iron)].map(r2);
}

async function main() {
  const [srDir, foundationDir] = process.argv.slice(2);
  if (!srDir || !foundationDir) throw new Error("Pass the SR Legacy and Foundation Foods CSV folders.");
  const out: unknown[] = [];
  const names = new Set<string>();
  let skipped = 0;
  // Foundation first: newer analyses win when both datasets have the same description.
  for (const [dir, types] of [[foundationDir, new Set(["foundation_food"])], [srDir, new Set(["sr_legacy_food"])]] as const) {
    const { foods, nutrients, portions } = await readDataset(dir, types);
    for (const [fdcId, { name, category }] of foods) {
      // Shared food names are unique (ignoring case) in the database, after the 120-character cut.
      const display = name.length > 120 ? `${name.slice(0, 119)}…` : name;
      const key = display.toLowerCase();
      const n = nutrients.get(fdcId);
      const row = n ? nutrientRow(n) : null;
      if (!row || names.has(key)) {
        skipped++;
        continue;
      }
      names.add(key);
      const { unitGrams, defaultUnit } = unitGramsFor(name, category, portions.get(fdcId) ?? []);
      out.push([Number(fdcId), display, category, unitGrams, defaultUnit, row]);
    }
  }
  out.sort((a, b) => (a as [number])[0] - (b as [number])[0]);
  const target = path.join(process.cwd(), "src", "lib", "nutrition", "world", "usda-foods.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(out)}\n`);
  console.log(`World foods: ${out.length} written (${skipped} skipped: no usable nutrients or a duplicate name). ${(fs.statSync(target).size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
