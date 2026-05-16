/**
 * `public.decks` row shape (aligned with seed + Supabase conventions).
 * Prefer selecting explicit columns in queries rather than relying on `*`.
 */
export type DeckRow = {
  id: string;
  user_id: string;
  title: string;
  /** Nullable long text; add column via `supabase/migrations` if missing. */
  description: string | null;
  is_public: boolean;
};

/** Normalized deck for UI after optional `cards(count)` embed. */
export type DeckListItem = DeckRow & {
  card_count: number;
};

/** `public.cards` row shape (see `scripts/seed.mjs`). */
export type CardRow = {
  id: string;
  deck_id: string;
  position: number;
  front: string;
  back: string;
};

export type CardInsert = Pick<CardRow, "deck_id" | "position" | "front" | "back">;

/** Deck row plus nested cards from `select('*, cards(*)')` (ordered by `position`). */
export type DeckWithCards = DeckRow & {
  cards: CardRow[];
};
