import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { NewItem, WhatsAppMeal } from "./meals";
import { rpcItems, rpcMeal } from "./meals";

/*
 * Server-only database work for the WhatsApp link. The admin client bypasses row level security,
 * so every query here names the person it acts for.
 */
const admin = () => createAdminClient();

/** Records a request nonce; false when it was seen before (a replay). Old nonces are dropped. */
export async function recordNonce(nonce: string): Promise<boolean> {
  const db = admin();
  await db.from("integration_nonces").delete().lt("seen_at", new Date(Date.now() - 86_400_000).toISOString());
  const { error } = await db.from("integration_nonces").insert({ nonce });
  if (!error) return true;
  if (error.code === "23505") return false;
  throw new Error(`nonce: ${error.code ?? "unknown"}`);
}

export async function userForLink(linkRef: string): Promise<string | null> {
  const { data, error } = await admin().from("whatsapp_links").select("user_id").eq("link_ref", linkRef).maybeSingle();
  if (error) throw new Error(`link lookup: ${error.code ?? "unknown"}`);
  return (data?.user_id as string | undefined) ?? null;
}

export async function linkStatus(userId: string): Promise<{ linkedAt: string } | null> {
  const { data, error } = await admin().from("whatsapp_links").select("linked_at").eq("user_id", userId).maybeSingle();
  if (error) throw new Error(`link status: ${error.code ?? "unknown"}`);
  return data ? { linkedAt: String(data.linked_at) } : null;
}

/** One live code per person: a new code replaces any earlier one. */
export async function storeLinkCode(userId: string, codeHash: string, expiresAt: Date): Promise<void> {
  const db = admin();
  await db.from("whatsapp_link_codes").delete().lt("expires_at", new Date().toISOString());
  await db.from("whatsapp_link_codes").delete().eq("user_id", userId);
  const { error } = await db.from("whatsapp_link_codes").insert({ code_hash: codeHash, user_id: userId, expires_at: expiresAt.toISOString() });
  if (error) throw new Error(`link code: ${error.code ?? "unknown"}`);
}

/** Uses up a live code; returns whose it was, or null. Single use: the row is deleted as it's read. */
export async function takeLinkCode(codeHash: string): Promise<string | null> {
  const { data, error } = await admin().from("whatsapp_link_codes").delete()
    .eq("code_hash", codeHash).gt("expires_at", new Date().toISOString()).select("user_id");
  if (error) throw new Error(`use code: ${error.code ?? "unknown"}`);
  return (data?.[0]?.user_id as string | undefined) ?? null;
}

/** Links this person (replacing an earlier link of theirs). */
export async function saveLink(userId: string, linkRef: string): Promise<void> {
  const { error } = await admin().from("whatsapp_links")
    .upsert({ user_id: userId, link_ref: linkRef, linked_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(`save link: ${error.code ?? "unknown"}`);
}

export async function removeLinkByRef(linkRef: string): Promise<void> {
  const { error } = await admin().from("whatsapp_links").delete().eq("link_ref", linkRef);
  if (error) throw new Error(`unlink: ${error.code ?? "unknown"}`);
}

export async function removeLinkForUser(userId: string): Promise<void> {
  const { error } = await admin().from("whatsapp_links").delete().eq("user_id", userId);
  if (error) throw new Error(`unlink: ${error.code ?? "unknown"}`);
}

export async function upsertWhatsAppMeal(userId: string, externalId: string, version: string, meal: WhatsAppMeal,
  items: NewItem[]): Promise<"created" | "updated" | "stale"> {
  const { data, error } = await admin().rpc("upsert_whatsapp_meal", {
    p_user: userId, p_external_id: externalId, p_version: version, p_meal: rpcMeal(meal, items), p_items: rpcItems(items),
  });
  if (error) throw new Error(`upsert meal: ${error.code ?? "unknown"}`);
  return data as "created" | "updated" | "stale";
}

export async function deleteWhatsAppMeals(userId: string, externalId: string | null): Promise<number> {
  const { data, error } = await admin().rpc("delete_whatsapp_meals", { p_user: userId, p_external_id: externalId });
  if (error) throw new Error(`delete meals: ${error.code ?? "unknown"}`);
  return Number(data ?? 0);
}
