export default async function StudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-lg font-semibold text-zinc-950 dark:text-white">Study</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Deck {id} — study UI coming next.</p>
    </div>
  );
}
