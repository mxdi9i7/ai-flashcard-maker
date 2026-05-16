import "server-only";

import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

import { getSupabaseEnv, getSupabaseSecretKey } from "./env";

export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const secretKey = getSupabaseSecretKey();

  if (!secretKey) {
    throw new Error("Missing env: SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  }

  return createSupabaseJsClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

