import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseSecretKey } from "@/lib/supabase/env";

/**
 * Prefer the signed-in user; when no session exists but a service key is configured,
 * allow a dev fallback UUID via `GINGER_DECK_OWNER_USER_ID` (matches local seed workflows).
 */
export async function resolveDeckOwnerUserId(): Promise<
  { ok: true; userId: string } | { ok: false; message: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    return { ok: true, userId: user.id };
  }

  if (getSupabaseSecretKey()) {
    const fallback = process.env.GINGER_DECK_OWNER_USER_ID?.trim();
    if (fallback) {
      return { ok: true, userId: fallback };
    }
  }

  return {
    ok: false,
    message:
      "No signed-in user. Sign in, or set GINGER_DECK_OWNER_USER_ID (with SUPABASE_SECRET_KEY) for local deck creation.",
  };
}
