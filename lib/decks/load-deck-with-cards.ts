import "server-only";

import { supabaseServer } from "@/lib/supabaseServer";
import type { CardRow, DeckWithCards } from "@/lib/types/database";

function asDeckWithCards(raw: unknown): DeckWithCards {
  const r = raw as Record<string, unknown> & { cards?: unknown };
  const cardsRaw = Array.isArray(r.cards) ? r.cards : [];
  const cards = (cardsRaw as CardRow[]).slice().sort((a, b) => a.position - b.position);
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    title: r.title as string,
    description:
      "description" in r && r.description !== undefined && r.description !== null
        ? (r.description as string)
        : null,
    is_public: Boolean(r.is_public),
    cards,
  };
}

/**
 * Single round trip: deck row + all cards ordered by `position`.
 * Card count is `data.cards.length` (not a separate aggregate query).
 */
export async function loadDeckWithCards(
  deckId: string
): Promise<{ data: DeckWithCards | null; error: string | null }> {
  const id = deckId.trim();
  if (!id) {
    return { data: null, error: "Missing deck id." };
  }

  const supabase = await supabaseServer();
  const res = await supabase
    .from("decks")
    .select("*, cards(*)")
    .eq("id", id)
    .order("position", { referencedTable: "cards", ascending: true })
    .maybeSingle();

  if (res.error) {
    return { data: null, error: res.error.message };
  }
  if (!res.data) {
    return { data: null, error: null };
  }

  return { data: asDeckWithCards(res.data), error: null };
}
