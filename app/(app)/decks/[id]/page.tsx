import { notFound } from "next/navigation";

import { loadDeckWithCards } from "@/lib/decks/load-deck-with-cards";

import { DeckDetailView } from "./deck-detail-view";

export const dynamic = "force-dynamic";

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await loadDeckWithCards(id);

  if (error) {
    return (
      <div
        role="alert"
        className="mx-auto max-w-5xl rounded-xl border border-red-500/25 bg-red-500/5 px-5 py-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
      >
        <p className="font-medium">Could not load deck</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return <DeckDetailView deck={data} />;
}
