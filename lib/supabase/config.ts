export function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { url, publishableKey };
}

export function hasSupabaseBrowserConfig() {
  const { url, publishableKey } = getSupabaseBrowserConfig();
  return Boolean(url && publishableKey);
}

export function getSupabaseServiceConfig() {
  const { url } = getSupabaseBrowserConfig();
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  return { url, serviceKey };
}

export function hasSupabaseServiceConfig() {
  const { url, serviceKey } = getSupabaseServiceConfig();
  return Boolean(url && serviceKey);
}
