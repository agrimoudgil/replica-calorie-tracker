import { describe, expect, it } from "vitest";
import { nutrientsForGrams } from "@/lib/nutrition/portions";
import { SEED_FOODS } from "@/lib/nutrition/foods";
import { hashCode, newLinkCode, normalizeCode, showCode } from "./codes";
import { CODE_ALPHABET, whatsappLinkOn } from "./config";
import { buildItems, eatenAtFor, mealsBodySchema, rpcItems, rpcMeal, type WhatsAppMeal } from "./meals";
import { checkWhatsAppSignature, signWhatsAppRequest } from "./signature";

const secret = "s".repeat(32);
const catalogue = new Map(SEED_FOODS.map((f) => [f.id, f]));

describe("signed requests from the WhatsApp tracker", () => {
  it("matches the vector the WhatsApp tracker signs with", () => {
    expect(signWhatsAppRequest(secret, "/api/integrations/whatsapp/meals", "1762675200", "00000000-0000-4000-8000-000000000000",
      '{"linkRef":"x","ops":[]}')).toBe("v1=1b607b50ffaaccc5cfcad4f8a7a19249f35862691cf7d4c462271cfbbaf6b786");
  });
  it("accepts a fresh, exact signature and refuses anything else", () => {
    const body = '{"linkRef":"x","ops":[]}';
    const nonce = "3f2b5c1e-8a4d-4c6b-9e7f-1a2b3c4d5e6f";
    const now = 1762675200_000;
    const headers = { timestamp: "1762675200", nonce, signature: signWhatsAppRequest(secret, "/p", "1762675200", nonce, body) };
    expect(checkWhatsAppSignature(secret, "/p", body, headers, now)).toEqual({ ok: true, nonce });
    expect(checkWhatsAppSignature(secret, "/p", body + " ", headers, now)).toEqual({ ok: false, reason: "bad_signature" });
    expect(checkWhatsAppSignature(secret, "/other", body, headers, now)).toEqual({ ok: false, reason: "bad_signature" });
    expect(checkWhatsAppSignature("t".repeat(32), "/p", body, headers, now)).toEqual({ ok: false, reason: "bad_signature" });
    expect(checkWhatsAppSignature(secret, "/p", body, headers, now + 301_000)).toEqual({ ok: false, reason: "stale" });
    expect(checkWhatsAppSignature(secret, "/p", body, { ...headers, nonce: "not-a-uuid" }, now)).toEqual({ ok: false, reason: "missing" });
    expect(checkWhatsAppSignature(secret, "/p", body, { ...headers, signature: null }, now)).toEqual({ ok: false, reason: "missing" });
  });
  it("stays off without WHATSAPP_LINK=on and a long shared secret", () => {
    expect(whatsappLinkOn({})).toBe(false);
    expect(whatsappLinkOn({ WHATSAPP_LINK: "on", OSWALD_SYNC_SECRET: "short" })).toBe(false);
    expect(whatsappLinkOn({ WHATSAPP_LINK: "off", OSWALD_SYNC_SECRET: secret })).toBe(false);
    expect(whatsappLinkOn({ WHATSAPP_LINK: "on", OSWALD_SYNC_SECRET: secret })).toBe(true);
  });
});

describe("link codes", () => {
  it("are 8 unambiguous characters, shown as ABCD-2345 and read back however typed", () => {
    for (let i = 0; i < 50; i++) {
      const code = newLinkCode();
      expect(code).toMatch(/^[A-Z2-9]{8}$/);
      expect([...code].every((c) => CODE_ALPHABET.includes(c))).toBe(true);
      expect(normalizeCode(showCode(code).toLowerCase())).toBe(code);
    }
    expect(normalizeCode("abcd 2345")).toBe("ABCD2345");
    expect(normalizeCode("ABCD-0011")).toBeNull();
    expect(normalizeCode("ABC")).toBeNull();
  });
  it("are stored only as a hash keyed by the shared secret", () => {
    expect(hashCode(secret, "ABCD2345")).toMatch(/^[0-9a-f]{64}$/);
    expect(hashCode(secret, "ABCD2345")).toBe(hashCode(secret, "ABCD2345"));
    expect(hashCode("t".repeat(32), "ABCD2345")).not.toBe(hashCode(secret, "ABCD2345"));
  });
});

const meal = (over: Partial<WhatsAppMeal> = {}): WhatsAppMeal => ({
  mealType: "breakfast", eatenAt: null, localDate: "2026-11-09", timezone: "Asia/Kolkata", rawText: "2 roti and 1 katori rice",
  items: [
    { name: "Roti", foodId: "seed-phulka", grams: 70, quantity: 2, unit: "piece", kcal: 208 },
    { name: "Chips (label)", kcal: 150 },
  ], ...over,
});

describe("meals from WhatsApp", () => {
  it("accepts what the tracker sends, including database timestamps", () => {
    const body = { linkRef: "3f2b5c1e-8a4d-4c6b-9e7f-1a2b3c4d5e6f", ops: [
      { op: "upsert", externalId: "8c0d6a52-1f3e-4b7a-9c2d-5e6f7a8b9c0d", version: "2026-11-09T08:00:00.123456+00:00", meal: meal() },
      { op: "delete", externalId: "8c0d6a52-1f3e-4b7a-9c2d-5e6f7a8b9c0d" },
      { op: "delete_all" },
    ] };
    expect(mealsBodySchema.safeParse(body).success).toBe(true);
  });
  it("refuses items the journal can't store", () => {
    const op = (m: unknown) => ({ linkRef: "3f2b5c1e-8a4d-4c6b-9e7f-1a2b3c4d5e6f",
      ops: [{ op: "upsert", externalId: "8c0d6a52-1f3e-4b7a-9c2d-5e6f7a8b9c0d", version: "2026-11-09T08:00:00Z", meal: m }] });
    const roti = { name: "Roti", foodId: "seed-phulka", grams: 70, quantity: 2, unit: "piece" as const };
    expect(mealsBodySchema.safeParse(op(meal({ items: Array(13).fill(roti) }))).success).toBe(false);
    expect(mealsBodySchema.safeParse(op(meal({ items: [{ ...roti, unit: "plate" }] as never }))).success).toBe(false);
    expect(mealsBodySchema.safeParse(op(meal({ items: [{ ...roti, grams: 3001 }] }))).success).toBe(false);
    expect(mealsBodySchema.safeParse(op(meal({ items: [{ ...roti, foodId: "usda-123" }] }))).success).toBe(false);
    expect(mealsBodySchema.safeParse(op({ ...meal(), extra: 1 })).success).toBe(false);
  });
  it("counts food-list items with Oswald's own numbers and the rest as quick adds", () => {
    const items = buildItems([
      ...meal().items,
      { name: "Gone food", foodId: "seed-no-such-food", grams: 100, quantity: 1, unit: "katori", kcal: 210 },
    ], catalogue);
    expect(items[0]).toMatchObject({ foodId: "seed-phulka", name: "Roti", quantity: 2, unit: "piece", grams: 70, source: "db" });
    expect(items[0].nutrients).toEqual(nutrientsForGrams(catalogue.get("seed-phulka")!, 70));
    expect(items[1]).toMatchObject({ foodId: null, name: "Chips (label)", source: "user", nutrients: { kcal: 150 } });
    expect(items[2]).toMatchObject({ foodId: null, name: "Gone food", source: "user", nutrients: { kcal: 210 } });
    const rows = rpcItems(items);
    expect(Object.keys(rows[0]).sort()).toEqual(["calcium_mg", "carb_g", "fat_g", "fiber_g", "food_id", "grams", "iron_mg", "kcal",
      "name", "protein_g", "quantity", "sat_fat_g", "sodium_mg", "source", "sugar_g", "unit"]);
    expect(rpcMeal(meal(), items)).toMatchObject({ meal_type: "breakfast", raw_text: "2 roti and 1 katori rice" });
  });
  it("uses WhatsApp's eating time, or the usual time for a date-only meal in its time zone", () => {
    expect(eatenAtFor(meal({ eatenAt: "2026-11-09T07:45:00.000Z" }))).toBe("2026-11-09T07:45:00.000Z");
    expect(eatenAtFor(meal())).toBe("2026-11-09T03:00:00.000Z"); // 08:30 in India
    expect(eatenAtFor(meal({ mealType: "dinner", timezone: "Europe/London" }))).toBe("2026-11-09T20:30:00.000Z");
    expect(eatenAtFor(meal({ timezone: "Not/AZone" }))).toBe("2026-11-09T03:00:00.000Z");
  });
});
