import type { DietType, Food, Nutrients, Unit } from "./types";

/*
 * Seed catalogue for development: common Indian dishes and staples.
 * Values are rough per-100 g estimates for typical home cooking, written for this
 * project (source "ai", verified false). They are placeholders until the catalogue
 * is rebuilt from USDA FoodData Central ingredients as planned in architecture.md.
 */

const VEG: DietType[] = ["vegetarian", "eggetarian", "non_vegetarian"];
const VEGAN: DietType[] = ["vegan", ...VEG];
const JAIN_VEGAN: DietType[] = ["jain", ...VEGAN];
const JAIN_VEG: DietType[] = ["jain", ...VEG];
const EGG: DietType[] = ["eggetarian", "non_vegetarian"];
const MEAT: DietType[] = ["non_vegetarian"];

type Row = [
  id: string,
  name: string,
  nameHi: string | undefined,
  aliases: string[],
  diet: DietType[],
  units: Partial<Record<Unit, number>>,
  defaultUnit: Unit,
  // kcal, protein, carbs, fat, fibre, sugar, sat fat, sodium mg, calcium mg, iron mg
  n: [number, number, number, number, number, number, number, number, number, number],
];

const rows: Row[] = [
  ["phulka", "Phulka", "फुलका", ["roti", "chapati", "chapatti", "fulka"], JAIN_VEGAN, { piece: 35 }, "piece", [297, 9.8, 55, 3.7, 9, 1.5, 0.6, 400, 30, 3.2]],
  ["paratha", "Plain paratha", "पराठा", ["parantha", "parotha"], JAIN_VEG, { piece: 80 }, "piece", [320, 7, 45, 13, 5, 1.5, 4.5, 450, 30, 2.6]],
  ["aloo-paratha", "Aloo paratha", "आलू पराठा", ["potato paratha"], VEG, { piece: 120 }, "piece", [260, 5.5, 36, 10.5, 3.5, 1.5, 3.5, 420, 25, 1.8]],
  ["rice", "Steamed rice", "चावल", ["rice", "chawal", "chaval", "plain rice", "white rice", "bhaat"], JAIN_VEGAN, { katori: 150 }, "katori", [130, 2.7, 28, 0.3, 0.4, 0.1, 0.1, 2, 10, 0.2]],
  ["jeera-rice", "Jeera rice", "जीरा राइस", ["cumin rice"], JAIN_VEG, { katori: 150 }, "katori", [165, 3, 29, 4, 0.6, 0.2, 1.8, 250, 15, 0.6]],
  ["dal-tadka", "Dal tadka", "दाल तड़का", ["dal", "daal", "toor dal", "arhar dal", "yellow dal"], VEG, { katori: 150 }, "katori", [120, 6, 15, 4, 3, 1, 1.5, 350, 25, 1.5]],
  ["dal-makhani", "Dal makhani", "दाल मखनी", ["maa ki dal", "black dal"], VEG, { katori: 150 }, "katori", [160, 6, 15, 8.5, 4, 1.5, 4.5, 380, 40, 2]],
  ["rajma", "Rajma curry", "राजमा", ["rajma", "rajma masala", "kidney bean curry"], VEGAN, { katori: 150 }, "katori", [130, 6.5, 17, 4, 5, 2, 0.6, 360, 40, 2.2]],
  ["chole", "Chole", "छोले", ["chana", "chana masala", "chickpea curry", "chhole"], VEGAN, { katori: 150 }, "katori", [150, 7, 19, 5, 6, 2.5, 0.7, 380, 45, 2.4]],
  ["palak-paneer", "Palak paneer", "पालक पनीर", ["saag paneer"], VEG, { katori: 150 }, "katori", [165, 8, 6, 12.5, 2.5, 1.5, 6, 380, 220, 2.5]],
  ["paneer-butter-masala", "Paneer butter masala", "पनीर बटर मसाला", ["paneer makhani", "shahi paneer"], VEG, { katori: 150 }, "katori", [230, 8.5, 9, 18, 1.5, 4, 9.5, 420, 200, 1]],
  ["paneer-bhurji", "Paneer bhurji", "पनीर भुर्जी", ["scrambled paneer"], VEG, { katori: 120 }, "katori", [200, 12, 5, 15, 1, 2, 8, 380, 280, 0.8]],
  ["mixed-sabzi", "Mixed veg sabzi", "मिक्स सब्ज़ी", ["sabzi", "sabji", "mixed vegetable", "veg curry"], VEGAN, { katori: 120 }, "katori", [95, 2.5, 9, 5.5, 3, 3, 0.8, 320, 35, 1]],
  ["aloo-gobi", "Aloo gobi", "आलू गोभी", ["gobi aloo", "cauliflower potato"], VEGAN, { katori: 120 }, "katori", [105, 2.5, 12, 5.5, 3, 2.5, 0.8, 330, 25, 0.9]],
  ["bhindi", "Bhindi masala", "भिंडी", ["okra", "bhindi fry", "lady finger"], JAIN_VEGAN, { katori: 100 }, "katori", [110, 2.5, 9, 7.5, 4, 2, 1, 300, 80, 0.9]],
  ["curd", "Curd", "दही", ["dahi", "yogurt", "yoghurt"], JAIN_VEG, { katori: 150 }, "katori", [61, 3.5, 4.7, 3.3, 0, 4.7, 2.1, 46, 121, 0.1]],
  ["poha", "Poha", "पोहा", ["kanda poha", "aval", "flattened rice"], VEGAN, { katori: 150 }, "katori", [180, 3.5, 30, 5, 1.5, 2, 0.7, 350, 12, 2.6]],
  ["upma", "Upma", "उपमा", ["rava upma", "suji upma"], VEGAN, { katori: 150 }, "katori", [170, 4, 25, 6, 2, 1.5, 1, 380, 15, 1]],
  ["idli", "Idli", "इडली", ["idly"], JAIN_VEGAN, { piece: 40 }, "piece", [130, 4, 27, 0.5, 1.2, 0.3, 0.1, 250, 15, 0.6]],
  ["dosa", "Plain dosa", "डोसा", ["dosa", "dosai", "sada dosa"], JAIN_VEGAN, { piece: 90 }, "piece", [170, 4, 29, 4, 1, 0.5, 0.6, 300, 15, 0.8]],
  ["masala-dosa", "Masala dosa", "मसाला डोसा", [], VEGAN, { piece: 180 }, "piece", [190, 4, 28, 7, 2, 1.5, 1, 330, 20, 1]],
  ["sambar", "Sambar", "सांबर", ["sambhar"], VEGAN, { katori: 150 }, "katori", [65, 3, 9, 2, 2.5, 2, 0.3, 300, 30, 1]],
  ["coconut-chutney", "Coconut chutney", "नारियल चटनी", ["chutney"], JAIN_VEGAN, { tbsp: 20, katori: 60 }, "tbsp", [230, 3, 9, 21, 5, 3, 17, 250, 15, 1.2]],
  ["moong-chilla", "Moong dal chilla", "मूंग दाल चीला", ["chilla", "cheela", "besan chilla"], VEGAN, { piece: 70 }, "piece", [160, 9, 20, 5, 4, 1, 0.7, 320, 35, 2]],
  ["chai", "Masala chai", "चाय", ["tea", "chai", "milk tea", "cutting chai"], JAIN_VEG, { glass: 150 }, "glass", [50, 1.6, 7.5, 1.5, 0, 7, 1, 25, 60, 0.1]],
  ["banana", "Banana", "केला", ["kela"], VEGAN, { piece: 118 }, "piece", [89, 1.1, 23, 0.3, 2.6, 12, 0.1, 1, 5, 0.3]],
  ["apple", "Apple", "सेब", ["seb"], JAIN_VEGAN, { piece: 180 }, "piece", [52, 0.3, 14, 0.2, 2.4, 10, 0, 1, 6, 0.1]],
  ["boiled-egg", "Boiled egg", "उबला अंडा", ["egg", "anda", "anda boiled"], EGG, { piece: 50 }, "piece", [155, 13, 1.1, 11, 0, 1.1, 3.3, 124, 50, 1.2]],
  ["chicken-curry", "Chicken curry", "चिकन करी", ["chicken", "chicken masala", "murgh curry"], MEAT, { katori: 150 }, "katori", [150, 14, 4, 9, 1, 1.5, 2.5, 420, 20, 1]],
  ["salad", "Green salad", "सलाद", ["salad", "kachumber", "cucumber salad"], JAIN_VEGAN, { katori: 100 }, "katori", [20, 1, 4, 0.2, 1.8, 2.5, 0, 10, 20, 0.4]],
  ["samosa", "Samosa", "समोसा", ["aloo samosa"], VEGAN, { piece: 80 }, "piece", [300, 5, 32, 17, 3, 2, 3, 420, 20, 1.5]],
  ["gulab-jamun", "Gulab jamun", "गुलाब जामुन", [], JAIN_VEG, { piece: 40 }, "piece", [320, 4, 50, 12, 0.5, 40, 6, 60, 80, 0.6]],
  ["milk", "Milk", "दूध", ["doodh", "toned milk"], JAIN_VEG, { glass: 250 }, "glass", [58, 3.1, 4.8, 3, 0, 4.8, 1.9, 44, 120, 0.1]],
  ["ghee", "Ghee", "घी", ["desi ghee", "clarified butter"], JAIN_VEG, { tbsp: 14 }, "tbsp", [900, 0, 0, 100, 0, 0, 62, 0, 0, 0]],
  ["paneer", "Paneer", "पनीर", ["cottage cheese"], JAIN_VEG, { piece: 25 }, "g", [265, 18.3, 1.2, 20.8, 0, 1.2, 13, 20, 208, 0.2]],
];

/*
 * Raw staples for building recipes ("my dal" = toor dal + onion + tomato + oil).
 * Rough per-100 g values after USDA FoodData Central. They're ingredients, not dishes:
 * insights never suggest them as something to eat. Aliases avoid short words like
 * "aloo" or "dal" so typed meals still match the cooked dishes above.
 */
const ingredientRows: Row[] = [
  ["raw-toor-dal", "Toor dal (raw)", "तूर दाल (कच्ची)", ["raw toor dal", "arhar dal raw", "uncooked dal", "pigeon peas"], JAIN_VEGAN, { katori: 130, tbsp: 12 }, "katori", [343, 21.7, 62.8, 1.5, 15, 2, 0.3, 17, 130, 5.2]],
  ["raw-rice", "Rice (raw)", "चावल (कच्चे)", ["raw rice", "uncooked rice"], JAIN_VEGAN, { katori: 140, tbsp: 12 }, "katori", [365, 7.1, 80, 0.7, 1.3, 0.1, 0.2, 5, 28, 0.8]],
  ["atta", "Whole wheat flour (atta)", "आटा", ["atta", "gehun ka atta", "wheat flour"], JAIN_VEGAN, { katori: 120, tbsp: 8 }, "katori", [340, 13.2, 72, 2.5, 10.7, 0.4, 0.4, 2, 34, 3.6]],
  ["besan", "Besan (gram flour)", "बेसन", ["besan", "gram flour", "chickpea flour"], JAIN_VEGAN, { katori: 90, tbsp: 7 }, "katori", [387, 22.4, 57.8, 6.7, 10.8, 10.9, 0.7, 64, 45, 4.9]],
  ["onion", "Onion", "प्याज़", ["pyaz", "pyaaz", "raw onion"], VEGAN, { piece: 110 }, "piece", [40, 1.1, 9.3, 0.1, 1.7, 4.2, 0, 4, 23, 0.2]],
  ["tomato", "Tomato", "टमाटर", ["tamatar"], JAIN_VEGAN, { piece: 100 }, "piece", [18, 0.9, 3.9, 0.2, 1.2, 2.6, 0, 5, 10, 0.3]],
  ["raw-potato", "Potato (raw)", "आलू (कच्चा)", ["raw potato", "aloo raw"], VEGAN, { piece: 150 }, "piece", [77, 2, 17.5, 0.1, 2.2, 0.8, 0, 6, 12, 0.8]],
  ["green-peas", "Green peas", "मटर", ["matar", "peas"], JAIN_VEGAN, { katori: 145 }, "katori", [81, 5.4, 14.5, 0.4, 5.1, 5.7, 0.1, 5, 25, 1.5]],
  ["raw-spinach", "Spinach (raw)", "पालक (कच्चा)", ["raw spinach", "palak raw"], JAIN_VEGAN, { katori: 30 }, "katori", [23, 2.9, 3.6, 0.4, 2.2, 0.4, 0.1, 79, 99, 2.7]],
  ["oil", "Cooking oil", "तेल", ["oil", "tel", "refined oil", "sunflower oil", "mustard oil"], JAIN_VEGAN, { tbsp: 14 }, "tbsp", [884, 0, 0, 100, 0, 0, 11, 0, 0, 0]],
  ["sugar", "Sugar", "चीनी", ["cheeni", "chini", "shakkar"], JAIN_VEGAN, { tbsp: 12.5 }, "tbsp", [387, 0, 100, 0, 0, 100, 0, 1, 1, 0.1]],
];

/** Catalogue foods that are cooking ingredients only: never suggested as a meal. */
export const INGREDIENT_ONLY_IDS: ReadonlySet<string> = new Set(ingredientRows.map(([id]) => `seed-${id}`));

function toNutrients(n: Row[7]): Nutrients {
  const [kcal, proteinG, carbG, fatG, fiberG, sugarG, satFatG, sodiumMg, calciumMg, ironMg] = n;
  return { kcal, proteinG, carbG, fatG, fiberG, sugarG, satFatG, sodiumMg, calciumMg, ironMg };
}

export const SEED_FOODS: readonly Food[] = [...rows, ...ingredientRows].map(([id, name, nameHi, aliases, dietTags, unitGrams, defaultUnit, n]) => ({
  id: `seed-${id}`,
  ownerId: null,
  name,
  nameHi,
  aliases,
  dietTags,
  unitGrams: { g: 1, ...unitGrams },
  defaultUnit,
  per100g: toNutrients(n),
  source: "ai",
  verified: false,
}));

export function normalizeFoodName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    // Accents on Latin letters go ("dāl" → "dal"); Hindi vowel signs are marks too, so they stay.
    .replace(/(\p{Script=Latin})\p{M}+/gu, "$1")
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Best catalogue match for a free-text food name: exact name or alias first,
 * then a name/alias contained in the text (longest wins), otherwise null.
 */
export function matchFood(name: string, foods: readonly Food[]): Food | null {
  const q = normalizeFoodName(name);
  if (!q) return null;
  let best: { food: Food; len: number } | null = null;
  for (const food of foods) {
    for (const label of [food.name, ...food.aliases]) {
      const l = normalizeFoodName(label);
      if (l === q) return food;
      if (l.length >= 3 && ` ${q} `.includes(` ${l} `) && (!best || l.length > best.len)) {
        best = { food, len: l.length };
      }
    }
  }
  return best?.food ?? null;
}
