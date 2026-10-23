import { SEED_FOODS } from "./foods";
import rows from "./world/usda-foods.json";
import type { Food, Unit } from "./types";

/*
 * World foods: 7,700 generic foods from USDA FoodData Central (SR Legacy 2018 and
 * Foundation Foods 2026; public domain, CC0), built by scripts/build-world-foods.ts.
 * Searched after Oswald's own catalogue and fetched by id when used; never loaded all
 * at once, and never in meal ideas (their diet fit is unknown, so they carry no diet tags).
 */

/** Ids of world foods start with this; the catalogue never does. */
export const WORLD_ID_PREFIX = "usda-";
export const WORLD_SOURCE = "USDA FoodData Central";

type WorldRow = [fdcId: number, name: string, category: string, unitGrams: Partial<Record<Unit, number>>, defaultUnit: Unit, n: Array<number | null>];

const opt = (n: number | null) => (n === null ? undefined : n);

function toFood([fdcId, name, , unitGrams, defaultUnit, n]: WorldRow): Food {
  return {
    id: `${WORLD_ID_PREFIX}${fdcId}`,
    ownerId: null,
    name,
    aliases: [],
    dietTags: [],
    unitGrams,
    defaultUnit,
    per100g: {
      kcal: n[0] ?? 0,
      proteinG: n[1] ?? 0,
      carbG: n[2] ?? 0,
      fatG: n[3] ?? 0,
      fiberG: n[4] ?? 0,
      sugarG: opt(n[5]),
      satFatG: opt(n[6]),
      sodiumMg: opt(n[7]),
      calciumMg: opt(n[8]),
      ironMg: opt(n[9]),
    },
    source: "usda",
    verified: true,
  };
}

let cache: Food[] | null = null;

/**
 * All world foods (built once per process), for seeding and the development store. A world
 * food named exactly like one of Oswald's own (say "Honey") is left out: shared names are
 * unique in the database, and the catalogue's version is the one people expect.
 */
export function worldFoods(): Food[] {
  if (cache) return cache;
  const taken = new Set(SEED_FOODS.map((f) => f.name.toLowerCase()));
  return (cache = (rows as unknown as WorldRow[]).map(toFood).filter((f) => !taken.has(f.name.toLowerCase())));
}

export const isWorldFood = (id: string) => id.startsWith(WORLD_ID_PREFIX);
