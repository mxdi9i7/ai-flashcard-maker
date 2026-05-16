import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseSecretKey } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-only Supabase client for mutations and privileged reads.
 * Uses the service role when configured (local dev / admin paths); otherwise the cookie session client.
 */
export async function supabaseServer(): Promise<SupabaseClient> {
  if (getSupabaseSecretKey()) {
    return createAdminClient();
  }
  return createClient();
}
