"use server";

import { revalidatePath } from "next/cache";

import { missingDescriptionColumn } from "@/lib/decks/description-column";
import { resolveDeckOwnerUserId } from "@/lib/decks/resolve-owner";
import { supabaseServer } from "@/lib/supabaseServer";
import type { DeckListItem, DeckRow } from "@/lib/types/database";

const MAX_TITLE = 500;
const MAX_DESCRIPTION = 4000;

export type DeckActionResult<T> = { data: T | null; error: string | null };

type DeckRowWithCount = DeckRow & {
  cards?: { count: number }[] | null;
};

function normalizeDeck(row: DeckRowWithCount): DeckListItem {
  const raw = row.cards?.[0]?.count;
  const card_count = typeof raw === "number" ? raw : 0;
  const desc =
    "description" in row && row.description !== undefined && row.description !== null
      ? row.description
      : null;
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: desc,
    is_public: row.is_public,
    card_count,
  };
}

const DECK_SELECT_FULL = "id, user_id, title, is_public, description, cards(count)";
const DECK_SELECT_NO_DESC = "id, user_id, title, is_public, cards(count)";

function trimTitle(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof raw !== "string") {
    return { ok: false, error: "Title is required." };
  }
  const trimmed = raw.trim().slice(0, MAX_TITLE);
  if (!trimmed) {
    return { ok: false, error: "Title is required." };
  }
  return { ok: true, value: trimmed };
}

function trimDescription(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const t = raw.trim().slice(0, MAX_DESCRIPTION);
  return t.length ? t : null;
}

export async function createDeck(input: {
  title: unknown;
  description?: unknown;
}): Promise<DeckActionResult<DeckListItem>> {
  const titleResult = trimTitle(input.title);
  if (!titleResult.ok) {
    return { data: null, error: titleResult.error };
  }

  const owner = await resolveDeckOwnerUserId();
  if (!owner.ok) {
    return { data: null, error: owner.message };
  }

  const description = trimDescription(input.description);

  const supabase = await supabaseServer();

  const baseInsert = {
    user_id: owner.userId,
    title: titleResult.value,
    is_public: false,
  };

  const insertWithDesc =
    description !== null ? { ...baseInsert, description } : baseInsert;

  let { data, error } = await supabase
    .from("decks")
    .insert(insertWithDesc)
    .select(DECK_SELECT_FULL)
    .single();

  if (error?.message && missingDescriptionColumn(error.message)) {
    ({ data, error } = await supabase
      .from("decks")
      .insert(baseInsert)
      .select(DECK_SELECT_NO_DESC)
      .single());
  }

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to create deck." };
  }

  revalidatePath("/decks");
  revalidatePath(`/decks/${(data as { id: string }).id}`);

  return { data: normalizeDeck(data as DeckRowWithCount), error: null };
}

export async function updateDeck(input: {
  id: unknown;
  title: unknown;
  description?: unknown;
  is_public?: unknown;
}): Promise<DeckActionResult<DeckListItem>> {
  if (typeof input.id !== "string" || !input.id.trim()) {
    return { data: null, error: "Deck id is required." };
  }
  const deckId = input.id.trim();

  const titleResult = trimTitle(input.title);
  if (!titleResult.ok) {
    return { data: null, error: titleResult.error };
  }

  const owner = await resolveDeckOwnerUserId();
  if (!owner.ok) {
    return { data: null, error: owner.message };
  }

  const description = trimDescription(input.description);
  const is_public = input.is_public === true;

  const supabase = await supabaseServer();

  const updateFull = {
    title: titleResult.value,
    description,
    is_public,
  };
  const updateNoDesc = {
    title: titleResult.value,
    is_public,
  };

  let { data, error } = await supabase
    .from("decks")
    .update(updateFull)
    .eq("id", deckId)
    .eq("user_id", owner.userId)
    .select(DECK_SELECT_FULL)
    .single();

  if (error?.message && missingDescriptionColumn(error.message)) {
    ({ data, error } = await supabase
      .from("decks")
      .update(updateNoDesc)
      .eq("id", deckId)
      .eq("user_id", owner.userId)
      .select(DECK_SELECT_NO_DESC)
      .single());
  }

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to update deck." };
  }

  revalidatePath("/decks");
  revalidatePath(`/decks/${deckId}`);

  return { data: normalizeDeck(data as DeckRowWithCount), error: null };
}

export async function deleteDeck(input: { id: unknown }): Promise<DeckActionResult<{ id: string }>> {
  if (typeof input.id !== "string" || !input.id.trim()) {
    return { data: null, error: "Deck id is required." };
  }
  const deckId = input.id.trim();

  const owner = await resolveDeckOwnerUserId();
  if (!owner.ok) {
    return { data: null, error: owner.message };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("decks")
    .delete()
    .eq("id", deckId)
    .eq("user_id", owner.userId)
    .select("id");

  if (error) {
    return { data: null, error: error.message };
  }
  if (!data?.length) {
    return { data: null, error: "Deck not found or you do not have permission to delete it." };
  }

  revalidatePath("/decks");
  revalidatePath(`/decks/${deckId}`);

  return { data: { id: deckId }, error: null };
}
