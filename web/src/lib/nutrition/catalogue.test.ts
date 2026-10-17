import { describe, expect, it } from "vitest";
import { rankFoods } from "@/lib/data/food-rank";
import { DISH_RECIPES, INGREDIENT_ONLY_IDS, SEED_FOODS, matchFood, normalizeFoodName } from "./foods";
import { parseMeal } from "./parse-meal";
import { gramsFor, nutrientsForGrams } from "./portions";

const byId = (id: string) => SEED_FOODS.find((f) => f.id === `seed-${id}`)!;

describe("seed catalogue", () => {
  it("has about 300 foods with unique ids and names (the database requires unique names)", () => {
    expect(SEED_FOODS.length).toBeGreaterThanOrEqual(300);
    expect(new Set(SEED_FOODS.map((f) => f.id)).size).toBe(SEED_FOODS.length);
    for (const f of SEED_FOODS) expect(f.id).toMatch(/^seed-[a-z0-9-]+$/);
    const names = SEED_FOODS.map((f) => f.name.toLowerCase());
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
  });

  it("gives every name and alias to one food only, so typing and search are predictable", () => {
    const owner = new Map<string, string>();
    const clashes: string[] = [];
    for (const f of SEED_FOODS) {
      for (const label of new Set([f.name, ...f.aliases].map(normalizeFoodName))) {
        const other = owner.get(label);
        if (other && other !== f.id) clashes.push(`"${label}": ${other} and ${f.id}`);
        owner.set(label, f.id);
      }
    }
    expect(clashes).toEqual([]);
  });

  it("has believable numbers: macros fit in 100 g, and calories agree with them", () => {
    const problems: string[] = [];
    for (const f of SEED_FOODS) {
      const n = f.per100g;
      // Carbs include fibre, which gives about 2 kcal per gram, not 4.
      const atwater = 4 * n.proteinG + 4 * (n.carbG - n.fiberG) + 2 * n.fiberG + 9 * n.fatG;
      if (n.kcal < 0 || n.kcal > 900) problems.push(`${f.id}: ${n.kcal} kcal`);
      if (n.proteinG + n.carbG + n.fatG > 100.5) problems.push(`${f.id}: macros over 100 g`);
      if ((n.sugarG ?? 0) > n.carbG + 0.5 || n.fiberG > n.carbG + 0.5) problems.push(`${f.id}: sugar or fibre above carbs`);
      if ((n.satFatG ?? 0) > n.fatG + 0.1) problems.push(`${f.id}: saturated fat above fat`);
      if (n.kcal >= 20 && Math.abs(n.kcal - atwater) > Math.max(0.15 * n.kcal, 15)) problems.push(`${f.id}: ${n.kcal} kcal vs ${Math.round(atwater)} from macros`);
    }
    expect(problems).toEqual([]);
  });

  it("has sensible serving sizes", () => {
    const problems: string[] = [];
    for (const f of SEED_FOODS) {
      if (f.defaultUnit !== "g" && !f.unitGrams[f.defaultUnit]) problems.push(`${f.id}: no weight for ${f.defaultUnit}`);
      const serving = nutrientsForGrams(f, gramsFor(f, f.defaultUnit, f.defaultUnit === "g" ? 100 : 1)).kcal;
      if (serving > 1200) problems.push(`${f.id}: ${Math.round(serving)} kcal per serving`);
    }
    expect(problems).toEqual([]);
  });

  it("works dishes out from recipes, with diet tags every ingredient allows", () => {
    expect(DISH_RECIPES.size).toBeGreaterThan(150);
    for (const [id, { recipe, cookedGrams }] of DISH_RECIPES) {
      const raw = recipe.reduce((s, [, g]) => s + g, 0);
      expect(cookedGrams, id).toBeGreaterThan(raw * 0.3); // fried or dried can shrink
      expect(cookedGrams, id).toBeLessThan(raw * 15); // dal and soup take a lot of water
    }
    expect(byId("butter-chicken").dietTags).toEqual(["non_vegetarian"]);
    expect(byId("egg-curry").dietTags).toEqual(["eggetarian", "non_vegetarian"]);
    expect(byId("dal-fry").dietTags).toContain("vegetarian");
    expect(byId("dal-fry").dietTags).not.toContain("vegan"); // a little ghee
    expect(byId("masoor-dal").dietTags).toContain("vegan"); // oil only
    expect(byId("masoor-dal").dietTags).not.toContain("jain"); // onion and garlic
    expect(byId("besan-ladoo").dietTags).toEqual(expect.arrayContaining(["jain", "vegetarian"]));
    expect(byId("besan-ladoo").dietTags).not.toContain("vegan"); // ghee
    // A typical katori of dal fry: about 150 kcal, protein from the toor dal.
    const dal = nutrientsForGrams(byId("dal-fry"), 150);
    expect(dal.kcal).toBeGreaterThan(120);
    expect(dal.kcal).toBeLessThan(200);
    expect(dal.sodiumMg).toBeGreaterThan(300); // salt is in the recipe
  });

  it("keeps raw staples out of meal suggestions", () => {
    for (const id of ["raw-masoor-dal", "maida", "salt", "raw-chicken", "cauliflower"]) expect(INGREDIENT_ONLY_IDS.has(`seed-${id}`), id).toBe(true);
    for (const id of ["mango", "almonds", "dal-fry", "white-bread"]) expect(INGREDIENT_ONLY_IDS.has(`seed-${id}`), id).toBe(false);
  });

  it("finds what people commonly log, by name or the way they type it", () => {
    const common = [
      "roti", "tandoori roti", "naan", "butter naan", "paratha", "aloo paratha", "gobi paratha", "puri", "bhature", "thepla",
      "rice", "jeera rice", "pulao", "biryani", "chicken biryani", "curd rice", "lemon rice", "khichdi", "fried rice",
      "dal", "dal fry", "moong dal", "masoor dal", "chana dal", "dal makhni", "rajma", "chole", "kadhi", "sambar", "rasam",
      "paneer butter masala", "kadai paneer", "matar paneer", "palak paneer", "paneer tikka", "malai kofta",
      "aloo gobi", "aloo matar", "jeera aloo", "bhindi", "baingan bharta", "lauki", "mix veg", "sarson ka saag",
      "idli", "dosa", "masala dosa", "uttapam", "vada", "upma", "poha", "dhokla", "besan chilla", "sabudana khichdi",
      "omelette", "boiled egg", "egg curry", "chicken curry", "butter chicken", "tandoori chicken", "fish curry", "mutton",
      "samosa", "pakora", "pani puri", "bhel", "vada pav", "pav bhaji", "momos", "maggi noodles", "sandwich",
      "raita", "curd", "lassi", "chaas", "chai", "coffee", "milk", "banana", "apple", "mango", "almonds",
      "gulab jamun", "rasgulla", "jalebi", "kheer", "halwa", "ladoo",
    ];
    const missing = common.filter((name) => !matchFood(name, SEED_FOODS) && rankFoods(SEED_FOODS, name, 1).length === 0);
    expect(missing).toEqual([]);
    // Search for "dal" lists many dal dishes (the original showed 21).
    expect(rankFoods(SEED_FOODS, "dal", 50).length).toBeGreaterThanOrEqual(20);
  });

  it("still reads typed meals the same way, including pairs", () => {
    const ids = (text: string) => parseMeal(text, SEED_FOODS).items.map((i) => [i.food.id.replace("seed-", ""), i.quantity, i.unit]);
    expect(ids("2 tandoori roti and kadai paneer")).toEqual([["tandoori-roti", 2, "piece"], ["kadai-paneer", 1, "katori"]]);
    expect(ids("chole bhature")).toEqual([["chole", 1, "katori"], ["bhatura", 1, "piece"]]);
    expect(ids("dal bati")).toEqual([["dal-tadka", 1, "katori"], ["bati", 1, "piece"]]);
    expect(ids("1 katori dal fry")).toEqual([["dal-fry", 1, "katori"]]);
    expect(ids("aloo puri")).toEqual([["aloo-sabzi", 1, "katori"], ["puri", 1, "piece"]]);
  });
});
