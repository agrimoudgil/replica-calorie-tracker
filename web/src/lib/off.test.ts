import { describe, expect, it, vi } from "vitest";
import { cleanBarcode, lookupBarcode, OffUnavailable, productFromOff } from "./off";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("Open Food Facts barcode lookups", () => {
  it("accepts 8 to 14 digits, with spaces or dashes, and nothing else", () => {
    expect(cleanBarcode("8901058 851427")).toBe("8901058851427");
    expect(cleanBarcode("0-12345-67890-5")).toBe("012345678905");
    expect(cleanBarcode("1234567")).toBeNull();
    expect(cleanBarcode("123456789012345")).toBeNull();
    expect(cleanBarcode("89010588514a7")).toBeNull();
    expect(cleanBarcode("../../etc")).toBeNull();
  });

  it("reads per-100 g numbers, a serving, the first brand, and minerals in mg", () => {
    const p = productFromOff("3017620422003", {
      product_name: " Nutella ",
      brands: "Ferrero, Nutella",
      serving_quantity: "15",
      nutriments: {
        "energy-kcal_100g": 539,
        proteins_100g: 6.3,
        carbohydrates_100g: 57.5,
        fat_100g: 30.9,
        sugars_100g: 56.3,
        "saturated-fat_100g": 10.6,
        sodium_100g: 0.0428,
      },
    });
    expect(p).toMatchObject({ name: "Nutella", brand: "Ferrero", servingGrams: 15, url: "https://world.openfoodfacts.org/product/3017620422003" });
    expect(p?.per100g).toMatchObject({ kcal: 539, proteinG: 6.3, carbG: 57.5, fatG: 30.9, fiberG: 0, sugarG: 56.3, satFatG: 10.6, sodiumMg: 42.8 });
    expect(p?.per100g.ironMg).toBeUndefined();
  });

  it("works out kcal from kJ, and gives up without any energy value or with an impossible one", () => {
    expect(productFromOff("12345678", { nutriments: { energy_100g: 1674 } })?.per100g.kcal).toBe(400.1);
    expect(productFromOff("12345678", { product_name: "Mystery", nutriments: {} })).toBeNull();
    expect(productFromOff("12345678", { nutriments: { "energy-kcal_100g": 2000 } })).toBeNull();
    expect(productFromOff("12345678", { nutriments: { "energy-kcal_100g": -5 } })).toBeNull();
  });

  it("names nameless products, and drops servings that can't be right", () => {
    expect(productFromOff("12345678", { brands: "Amul", nutriments: { "energy-kcal_100g": 70 } })?.name).toBe("Amul product");
    expect(productFromOff("12345678", { nutriments: { "energy-kcal_100g": 70 } })?.name).toBe("Product 12345678");
    expect(productFromOff("12345678", { serving_quantity: 0, nutriments: { "energy-kcal_100g": 70 } })?.servingGrams).toBeNull();
    expect(productFromOff("12345678", { serving_quantity: 5000, nutriments: { "energy-kcal_100g": 70 } })?.servingGrams).toBeNull();
  });

  it("asks for just the fields it needs, naming itself, and reads the answer", async () => {
    const fetcher = vi.fn(async () => json(200, { status: "success", product: { product_name: "Parle-G", nutriments: { "energy-kcal_100g": 454 } } }));
    const p = await lookupBarcode("8901719100017", fetcher as unknown as typeof fetch);
    expect(p?.name).toBe("Parle-G");
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://world.openfoodfacts.org/api/v3/product/8901719100017.json?fields=product_name,brands,nutriments,serving_quantity");
    expect((init.headers as Record<string, string>)["User-Agent"]).toMatch(/^Oswald\//);
  });

  it("says 'not found' for unknown barcodes, and 'unavailable' when the service is down or slow", async () => {
    expect(await lookupBarcode("12345678", (async () => json(404, { status: "failure" })) as unknown as typeof fetch)).toBeNull();
    expect(await lookupBarcode("12345678", (async () => json(200, { status: "failure" })) as unknown as typeof fetch)).toBeNull();
    await expect(lookupBarcode("12345678", (async () => json(429, {})) as unknown as typeof fetch)).rejects.toBeInstanceOf(OffUnavailable);
    await expect(lookupBarcode("12345678", (async () => json(503, {})) as unknown as typeof fetch)).rejects.toBeInstanceOf(OffUnavailable);
    await expect(
      lookupBarcode("12345678", (async () => {
        throw new DOMException("timed out", "TimeoutError");
      }) as unknown as typeof fetch),
    ).rejects.toBeInstanceOf(OffUnavailable);
  });
});
