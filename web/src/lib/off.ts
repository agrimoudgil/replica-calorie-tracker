import "server-only";
import type { Nutrients } from "@/lib/nutrition/types";

/*
 * Barcode lookups from Open Food Facts (open data: ODbL for the database, DbCL for the
 * product data). Only the barcode number leaves our server. Results are shown with credit
 * and a link, and kept only if the person saves them as their own private food: Oswald
 * never builds a shared copy of the database.
 */

export const OFF_CREDIT = "Open Food Facts";
const USER_AGENT = "Oswald/1.0 (agrim.moudgil06@gmail.com)"; // they ask every app to name itself
const FIELDS = "product_name,brands,nutriments,serving_quantity";

export type OffProduct = {
  code: string;
  name: string;
  brand: string | null;
  per100g: Nutrients;
  /** One serving's weight, when the pack gives one. */
  servingGrams: number | null;
  url: string;
};

export class OffUnavailable extends Error {}

/** Digits only, 8 to 14 of them (EAN-8, UPC-A, EAN-13, GTIN-14), or null. */
export function cleanBarcode(input: string): string | null {
  const code = input.replace(/[\s-]/g, "");
  return /^\d{8,14}$/.test(code) ? code : null;
}

const num = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : undefined;
};
const mg = (grams: unknown) => {
  const g = num(grams);
  return g === undefined ? undefined : Math.round(g * 1000 * 10) / 10;
};

/** The product's numbers per 100 g, or null when the pack has no usable energy value. */
export function productFromOff(code: string, product: Record<string, unknown>): OffProduct | null {
  const n = (product.nutriments ?? {}) as Record<string, unknown>;
  const kcal = num(n["energy-kcal_100g"]) ?? (num(n.energy_100g) !== undefined ? num(n.energy_100g)! / 4.184 : undefined);
  if (kcal === undefined || kcal > 950) return null;
  const brand = typeof product.brands === "string" && product.brands.trim() ? product.brands.split(",")[0].trim() : null;
  const name = typeof product.product_name === "string" && product.product_name.trim() ? product.product_name.trim() : brand ? `${brand} product` : `Product ${code}`;
  const serving = num(product.serving_quantity);
  return {
    code,
    name: name.slice(0, 120),
    brand,
    per100g: {
      kcal: Math.round(kcal * 10) / 10,
      proteinG: num(n.proteins_100g) ?? 0,
      carbG: num(n.carbohydrates_100g) ?? 0,
      fatG: num(n.fat_100g) ?? 0,
      fiberG: num(n.fiber_100g) ?? 0,
      sugarG: num(n.sugars_100g),
      satFatG: num(n["saturated-fat_100g"]),
      sodiumMg: mg(n.sodium_100g),
      calciumMg: mg(n.calcium_100g),
      ironMg: mg(n.iron_100g),
    },
    servingGrams: serving && serving >= 1 && serving <= 2000 ? serving : null,
    url: `https://world.openfoodfacts.org/product/${code}`,
  };
}

/** Looks one barcode up. Null when Open Food Facts doesn't know it (or has no numbers for it). */
export async function lookupBarcode(code: string, fetcher: typeof fetch = fetch): Promise<OffProduct | null> {
  let res: Response;
  try {
    res = await fetcher(`https://world.openfoodfacts.org/api/v3/product/${code}.json?fields=${FIELDS}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
  } catch {
    throw new OffUnavailable("timeout or network");
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new OffUnavailable(`status ${res.status}`);
  const body = (await res.json().catch(() => null)) as { status?: string; product?: Record<string, unknown> } | null;
  if (!body?.product) return null;
  return productFromOff(code, body.product);
}
