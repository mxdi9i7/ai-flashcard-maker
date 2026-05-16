import { missingDescriptionColumn } from "@/lib/decks/description-column";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseSecretKey } from "@/lib/supabase/env";
import type { DeckListItem, DeckRow } from "@/lib/types/database";

import { DecksView } from "./decks-view";

export const dynamic = "force-dynamic";

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

const SELECT_WITH_COUNTS =
  "id, user_id, title, is_public, description, cards(count)" as const;
const SELECT_WITH_COUNTS_NO_DESC = "id, user_id, title, is_public, cards(count)" as const;
const SELECT_BASIC = "id, user_id, title, is_public, description" as const;
const SELECT_BASIC_NO_DESC = "id, user_id, title, is_public" as const;

async function loadAllDecks(): Promise<{ decks: DeckListItem[]; fetchError: string | null }> {
  const secret = getSupabaseSecretKey();
  if (secret) {
    try {
      const supabase = createAdminClient();
      const first = await supabase
        .from("decks")
        .select(SELECT_WITH_COUNTS)
        .order("title", { ascending: true });

      const res =
        first.error?.message && missingDescriptionColumn(first.error.message)
          ? await supabase
              .from("decks")
              .select(SELECT_WITH_COUNTS_NO_DESC)
              .order("title", { ascending: true })
          : first;

      if (res.error) {
        return { decks: [], fetchError: res.error.message };
      }

      const data = res.data as DeckRowWithCount[] | null;

      return {
        decks: data?.map(normalizeDeck) ?? [],
        fetchError: null,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load decks.";
      return { decks: [], fetchError: message };
    }
  }

  const supabase = await createClient();
  const first = await supabase.from("decks").select(SELECT_BASIC).order("title", {
    ascending: true,
  });

  const res =
    first.error?.message && missingDescriptionColumn(first.error.message)
      ? await supabase.from("decks").select(SELECT_BASIC_NO_DESC).order("title", {
          ascending: true,
        })
      : first;

  if (res.error) {
    return { decks: [], fetchError: res.error.message };
  }

  const rows =
    (res.data as (Omit<DeckRow, "description"> & { description?: string | null })[] | null) ?? [];
  return {
    decks: rows.map((row) =>
      normalizeDeck({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        is_public: row.is_public,
        description: row.description ?? null,
        cards: null,
      })
    ),
    fetchError: null,
  };
}

export default async function DecksPage() {
  const { decks, fetchError } = await loadAllDecks();

  return <DecksView decks={decks} fetchError={fetchError} />;
}
