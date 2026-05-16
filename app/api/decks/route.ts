import { NextResponse } from "next/server";

import { resolveDeckOwnerUserId } from "@/lib/decks/resolve-owner";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseSecretKey } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { CardInsert } from "@/lib/types/database";

export const runtime = "nodejs";

type CardPayload = { front: string; back: string };

type Body = {
  title?: unknown;
  is_public?: unknown;
  cards?: unknown;
};

const MAX_CARDS = 200;
const MAX_TITLE = 500;
const MAX_SIDE = 8000;

export async function POST(req: Request) {
  const owner = await resolveDeckOwnerUserId();
  if (!owner.ok) {
    return NextResponse.json({ error: owner.message }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title =
    typeof body.title === "string" ? body.title.trim().slice(0, MAX_TITLE) : "";
  if (!title) {
    return NextResponse.json({ error: "Deck title is required." }, { status: 400 });
  }

  const is_public = body.is_public === true;

  if (!Array.isArray(body.cards) || body.cards.length === 0) {
    return NextResponse.json({ error: "At least one card is required." }, { status: 400 });
  }

  const cards: CardPayload[] = [];
  for (const row of body.cards.slice(0, MAX_CARDS)) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const front = typeof r.front === "string" ? r.front.trim().slice(0, MAX_SIDE) : "";
    const back = typeof r.back === "string" ? r.back.trim().slice(0, MAX_SIDE) : "";
    if (!front || !back) continue;
    cards.push({ front, back });
  }

  if (cards.length === 0) {
    return NextResponse.json(
      { error: "Each card needs non-empty front and back text." },
      { status: 400 }
    );
  }

  const secret = getSupabaseSecretKey();

  if (secret) {
    const admin = createAdminClient();
    const { data: deck, error: deckErr } = await admin
      .from("decks")
      .insert({
        user_id: owner.userId,
        title,
        is_public,
      })
      .select("id")
      .single();

    if (deckErr || !deck?.id) {
      return NextResponse.json(
        { error: deckErr?.message ?? "Failed to create deck." },
        { status: 500 }
      );
    }

    const deckId = deck.id as string;
    const inserts: CardInsert[] = cards.map((c, position) => ({
      deck_id: deckId,
      position,
      front: c.front,
      back: c.back,
    }));

    const { error: cardsErr } = await admin.from("cards").insert(inserts);
    if (cardsErr) {
      return NextResponse.json({ error: cardsErr.message }, { status: 500 });
    }

    return NextResponse.json({ id: deckId });
  }

  const supabase = await createClient();
  const { data: deck, error: deckErr } = await supabase
    .from("decks")
    .insert({
      user_id: owner.userId,
      title,
      is_public,
    })
    .select("id")
    .single();

  if (deckErr || !deck?.id) {
    return NextResponse.json(
      { error: deckErr?.message ?? "Failed to create deck." },
      { status: deckErr?.message?.includes("permission") ? 403 : 500 }
    );
  }

  const deckId = deck.id as string;
  const inserts: CardInsert[] = cards.map((c, position) => ({
    deck_id: deckId,
    position,
    front: c.front,
    back: c.back,
  }));

  const { error: cardsErr } = await supabase.from("cards").insert(inserts);
  if (cardsErr) {
    return NextResponse.json({ error: cardsErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: deckId });
}
