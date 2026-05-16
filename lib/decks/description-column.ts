/**
 * PostgREST / Postgres errors when `public.decks.description` has not been migrated yet.
 */
export function missingDescriptionColumn(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  if (!m.includes("description")) return false;
  return (
    m.includes("does not exist") ||
    m.includes("could not find") ||
    m.includes("schema cache")
  );
}
