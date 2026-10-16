import { normalizeFoodName } from "./foods";
import type { Food, Unit } from "./types";

/*
 * Turns a typed (or spoken) meal into catalogue items, with no AI:
 * "2 roti, 1 katori dal aur ek bowl dahi" → Phulka ×2 piece, Dal tadka ×1 katori, Curd ×1 katori.
 * Understands English and common Hindi number words, household units, grams,
 * and dish pairs written together ("rajma chawal" → rajma + rice).
 */

export type ParsedItem = { food: Food; quantity: number; unit: Unit; text: string };
export type ParseResult = { items: ParsedItem[]; unmatched: string[] };

export const MAX_PARSED_ITEMS = 12;

const SPLIT = /\s*(?:,|;|\n|\+|&|\band\b|\baur\b|\bwith\b|\bplus\b|\bthen\b)\s*/i;

const NUMBER_WORDS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, quarter: 0.25,
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, panch: 5, paanch: 5, chhe: 6, saat: 7, aath: 8,
  aadha: 0.5, adha: 0.5, aadhi: 0.5, dedh: 1.5, dhai: 2.5, dhaai: 2.5,
};

// [pattern, unit, multiplier on the quantity]
const UNIT_WORDS: Array<[RegExp, Unit, number]> = [
  [/^(katori|katoris|katora|katoras|bowl|bowls)$/, "katori", 1],
  [/^(plate|plates)$/, "katori", 1.5],
  [/^(glass|glasses|cup|cups|mug|mugs)$/, "glass", 1],
  [/^(piece|pieces|pc|pcs|no|nos|slice|slices)$/, "piece", 1],
  [/^(tbsp|tablespoon|tablespoons|spoon|spoons|chamach|chammach)$/, "tbsp", 1],
  [/^(tsp|teaspoon|teaspoons)$/, "tbsp", 1 / 3],
  [/^(g|gm|gms|gram|grams|ml)$/, "g", 1],
];

const FILLER = new Set(["of", "the", "some", "little", "bit", "small", "medium", "big", "large", "full", "had", "ate", "i", "my", "for", "about", "around", "approx", "x"]);

function parseNumber(token: string): number | null {
  if (/^\d+(\.\d+)?$/.test(token)) return Number(token);
  const frac = token.match(/^(\d+)\/(\d+)$/);
  if (frac && Number(frac[2]) > 0) return Number(frac[1]) / Number(frac[2]);
  return token in NUMBER_WORDS ? NUMBER_WORDS[token] : null;
}

/** Every catalogue label found in the text, longest first, without overlaps, in reading order. */
function findFoods(text: string, foods: readonly Food[]): Food[] {
  const vocab = new Set<string>();
  const labels: Array<{ words: string[]; food: Food }> = [];
  for (const food of foods) {
    for (const label of [food.name, ...food.aliases]) {
      const words = normalizeFoodName(label).split(" ").filter(Boolean);
      if (words.length) labels.push({ words, food });
      words.forEach((w) => vocab.add(w));
    }
  }
  // "rotis" → "roti", "idlis" → "idli", when only the singular is a known word.
  const words = normalizeFoodName(text)
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.endsWith("s") && !vocab.has(w) && vocab.has(w.slice(0, -1)) ? w.slice(0, -1) : w));

  const hits: Array<{ start: number; end: number; food: Food }> = [];
  for (const { words: lw, food } of labels) {
    for (let i = 0; i + lw.length <= words.length; i++) {
      if (lw.every((w, j) => words[i + j] === w)) hits.push({ start: i, end: i + lw.length, food });
    }
  }
  hits.sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start);
  const taken = new Array<boolean>(words.length).fill(false);
  const chosen: typeof hits = [];
  for (const h of hits) {
    if (taken.slice(h.start, h.end).some(Boolean)) continue;
    for (let k = h.start; k < h.end; k++) taken[k] = true;
    chosen.push(h);
  }
  return chosen.sort((a, b) => a.start - b.start).map((h) => h.food);
}

const roundQuarter = (n: number) => Math.max(0.25, Math.round(n * 4) / 4);

function parseChunk(chunk: string, foods: readonly Food[]): ParsedItem[] | null {
  const tokens = chunk
    .toLowerCase()
    .replace(/½/g, " 0.5 ")
    .replace(/(\d)\s*(g|gm|gms|ml)\b/g, "$1 $2")
    .split(/\s+/)
    .filter(Boolean);

  let quantity: number | null = null;
  let unit: Unit | null = null;
  let factor = 1;
  const foodWords: string[] = [];
  for (const token of tokens) {
    const n: number | null = quantity === null ? parseNumber(token) : null;
    if (n !== null) {
      quantity = n;
      continue;
    }
    const u: (typeof UNIT_WORDS)[number] | undefined = unit === null ? UNIT_WORDS.find(([re]) => re.test(token)) : undefined;
    if (u) {
      [, unit, factor] = u;
      continue;
    }
    if (!FILLER.has(token)) foodWords.push(token);
  }

  const found = findFoods(foodWords.join(" "), foods);
  if (!found.length) return null;

  // The amount belongs to the first dish; dishes named with it ("rajma chawal") get a usual portion.
  return found.map((food, i) => {
    if (i > 0) return { food, quantity: 1, unit: food.defaultUnit, text: chunk };
    const u = unit ?? food.defaultUnit;
    const q = (quantity ?? 1) * factor;
    return { food, unit: u, quantity: u === "g" ? Math.max(1, Math.round(q)) : roundQuarter(q), text: chunk };
  });
}

export function parseMeal(text: string, foods: readonly Food[]): ParseResult {
  const items: ParsedItem[] = [];
  const unmatched: string[] = [];
  for (const raw of text.split(SPLIT)) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const parsed = parseChunk(chunk, foods);
    if (parsed) items.push(...parsed);
    else unmatched.push(chunk);
  }
  return { items: items.slice(0, MAX_PARSED_ITEMS), unmatched };
}
