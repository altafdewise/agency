import { createSupabaseServerClient } from "@/lib/supabase/server";
import { canAccess, type AdminSection } from "@/lib/admin/permissions";
import type { AppRole } from "@/lib/supabase/database.types";

const ROLES: AppRole[] = ["owner", "project_lead", "editor", "viewer"];

export async function authorizeAdminApi(section: AdminSection, write = false) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false as const, status: 401 };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) {
    console.error(`[admin/${section}] profile lookup failed:`, profileError);
    return { ok: false as const, status: 500 };
  }

  const role = profile?.role;
  if (!role || !ROLES.includes(role) || !canAccess(role, section)) {
    return { ok: false as const, status: 403 };
  }
  if (write && role !== "owner" && role !== "project_lead") {
    return { ok: false as const, status: 403 };
  }

  return { ok: true as const, supabase, role, userId: user.id };
}

export function adminApiError(status: number) {
  return Response.json(
    { error: status === 401 ? "Sign in to continue." : status === 403 ? "You do not have access to this action." : "Something went wrong. Please try again." },
    { status }
  );
}
