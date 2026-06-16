import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

let adminClient: SupabaseClient<Database> | null = null;

export function getSupabaseAdminClient() {
  const { url, serviceKey } = getSupabaseServiceConfig();
  if (!url || !serviceKey) return null;

  if (!adminClient) {
    adminClient = createClient<Database>(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
