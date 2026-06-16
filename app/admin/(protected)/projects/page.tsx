import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectsBoard } from "@/components/admin/ProjectsBoard";
import { requireAdminSection } from "@/lib/admin/auth";
import type { ProfileRow, ProjectRow } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Projects | Admin",
};

export default async function ProjectsPage() {
  const session = await requireAdminSection("projects");
  if (session.status !== "ready") return null;

  const [{ data: projects = [] }, { data: profiles = [] }] = await Promise.all([
    session.supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    session.supabase.from("profiles").select("*").order("name", { ascending: true }),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Projects"
        title="board."
        description="A practical kanban for active work, values, ownership, and deadlines."
      />
      <ProjectsBoard
        projects={projects as ProjectRow[]}
        profiles={profiles as ProfileRow[]}
        role={session.profile.role}
      />
    </>
  );
}
