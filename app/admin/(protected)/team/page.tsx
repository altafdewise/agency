import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TeamManagement } from "@/components/admin/TeamManagement";
import { requireAdminSection } from "@/lib/admin/auth";
import type { ProfileRow } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Team | Admin",
};

export default async function TeamPage() {
  const session = await requireAdminSection("team");
  if (session.status !== "ready") return null;

  const { data = [] } = await session.supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        eyebrow="Team"
        title="access."
        description="Owner-only profile and role management."
      />
      <TeamManagement profiles={data as ProfileRow[]} />
    </>
  );
}
