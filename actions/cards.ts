"use server";

import { revalidatePath } from "next/cache";

import { resolveDeckOwnerUserId } from "@/lib/decks/resolve-owner";
import { supabaseServer } from "@/lib/supabaseServer";
import type { CardRow } from "@/lib/types/database";

export type CardActionResult<T> = { data: T | null; error: string | null };

const MAX_SIDE = 8000;

async function ensureDeckOwned(deckId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const owner = await resolveDeckOwnerUserId();
  if (!owner.ok) return { ok: false, error: owner.message };

  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", owner.userId)
    .maybeSingle();

  if (!data) return { ok: false, error: "Deck not found or access denied." };
  return { ok: true };
}

function revalidateDeckPaths(deckId: string) {
  revalidatePath("/decks");
  revalidatePath(`/decks/${deckId}`);
}

export async function addCard(input: {
  deck_id: unknown;
  front: unknown;
  back: unknown;
}): Promise<CardActionResult<CardRow>> {
  const deckId = typeof input.deck_id === "string" ? input.deck_id.trim() : "";
  const front = typeof input.front === "string" ? input.front.trim().slice(0, MAX_SIDE) : "";
  const back = typeof input.back === "string" ? input.back.trim().slice(0, MAX_SIDE) : "";
  if (!deckId) return { data: null, error: "Deck id is required." };
  if (!front || !back) return { data: null, error: "Question and answer are required." };

  const gate = await ensureDeckOwned(deckId);
  if (!gate.ok) return { data: null, error: gate.error };

  const supabase = await supabaseServer();
  const { data: maxRow } = await supabase
    .from("cards")
    .select("position")
    .eq("deck_id", deckId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = typeof maxRow?.position === "number" ? maxRow.position + 1 : 0;

  const { data, error } = await supabase
    .from("cards")
    .insert({ deck_id: deckId, position, front, back })
    .select("id, deck_id, position, front, back")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to add card." };
  }

  revalidateDeckPaths(deckId);
  return { data: data as CardRow, error: null };
}

export async function updateCard(input: {
  id: unknown;
  deck_id: unknown;
  front: unknown;
  back: unknown;
}): Promise<CardActionResult<CardRow>> {
  const cardId = typeof input.id === "string" ? input.id.trim() : "";
  const deckId = typeof input.deck_id === "string" ? input.deck_id.trim() : "";
  const front = typeof input.front === "string" ? input.front.trim().slice(0, MAX_SIDE) : "";
  const back = typeof input.back === "string" ? input.back.trim().slice(0, MAX_SIDE) : "";
  if (!cardId || !deckId) return { data: null, error: "Card and deck ids are required." };
  if (!front || !back) return { data: null, error: "Question and answer are required." };

  const gate = await ensureDeckOwned(deckId);
  if (!gate.ok) return { data: null, error: gate.error };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("cards")
    .update({ front, back })
    .eq("id", cardId)
    .eq("deck_id", deckId)
    .select("id, deck_id, position, front, back")
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to update card." };
  }

  revalidateDeckPaths(deckId);
  return { data: data as CardRow, error: null };
}

export async function deleteCard(input: {
  id: unknown;
  deck_id: unknown;
}): Promise<CardActionResult<{ id: string }>> {
  const cardId = typeof input.id === "string" ? input.id.trim() : "";
  const deckId = typeof input.deck_id === "string" ? input.deck_id.trim() : "";
  if (!cardId || !deckId) return { data: null, error: "Card and deck ids are required." };

  const gate = await ensureDeckOwned(deckId);
  if (!gate.ok) return { data: null, error: gate.error };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("cards")
    .delete()
    .eq("id", cardId)
    .eq("deck_id", deckId)
    .select("id");

  if (error) return { data: null, error: error.message };
  if (!data?.length) return { data: null, error: "Card not found." };

  revalidateDeckPaths(deckId);
  return { data: { id: cardId }, error: null };
}
