import { notFound } from "next/navigation";

import { loadDeckWithCards } from "@/lib/decks/load-deck-with-cards";

import { StudySession } from "./study-session";

export const dynamic = "force-dynamic";

export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await loadDeckWithCards(id);

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-2xl rounded-xl border border-red-500/25 bg-red-500/5 px-5 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
      >
        <p className="font-medium">Could not load deck</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const cards = data.cards.map(({ id: cardId, front, back }) => ({
    id: cardId,
    front,
    back,
  }));

  return (
    <div className="px-4 sm:px-6">
      <StudySession deckId={id} deckTitle={data.title} cards={cards} />
    </div>
  );
}
