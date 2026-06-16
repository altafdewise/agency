import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/config";
import type { AppRole, ProfileRow } from "@/lib/supabase/database.types";
import type { AdminSection } from "@/lib/admin/permissions";
import { canAccess } from "@/lib/admin/permissions";

export type AdminSession =
  | { status: "missing-env" }
  | { status: "missing-profile"; email: string }
  | {
      status: "ready";
      profile: ProfileRow;
      userId: string;
      email: string;
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
    };

export async function getAdminSession(): Promise<AdminSession> {
  if (!hasSupabaseBrowserConfig()) return { status: "missing-env" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return {
      status: "missing-profile",
      email: user.email ?? "unknown user",
    };
  }

  await supabase
    .from("profiles")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", user.id);

  return {
    status: "ready",
    profile,
    userId: user.id,
    email: user.email ?? profile.email,
    supabase,
  };
}

export async function requireAdminSection(section: AdminSection) {
  const session = await getAdminSession();

  if (session.status !== "ready") return session;
  if (!canAccess(session.profile.role as AppRole, section)) redirect("/admin");

  return session;
}
