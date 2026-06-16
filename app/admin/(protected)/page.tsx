import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { requireAdminSection } from "@/lib/admin/auth";
import { canAccess } from "@/lib/admin/permissions";
import { inr, shortDate } from "@/lib/admin/format";
import type { AppRole, LeadRow, ProjectRow } from "@/lib/supabase/database.types";

export default async function AdminDashboardPage() {
  const session = await requireAdminSection("dashboard");
  if (session.status !== "ready") return null;

  const [{ data: leads = [] }, { data: projects = [] }, { data: posts = [] }] =
    await Promise.all([
      session.supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
      session.supabase
        .from("projects")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(8),
      session.supabase
        .from("blog_posts")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(5),
    ]);

  const role = session.profile.role as AppRole;
  const leadRows = leads as LeadRow[];
  const projectRows = projects as ProjectRow[];
  const converted = leadRows.filter((lead) => lead.status === "converted").length;
  const avgEstimate =
    leadRows.reduce((sum, lead) => {
      if (lead.ai_price_low == null || lead.ai_price_high == null) return sum;
      return sum + (lead.ai_price_low + lead.ai_price_high) / 2;
    }, 0) / Math.max(1, leadRows.filter((lead) => lead.ai_price_low != null).length);

  return (
    <>
      <AdminPageHeader
        eyebrow="Dashboard"
        title="today's pulse."
        description="A compact read on leads, active work, content, and the public path."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recent leads" value={String(leadRows.length)} tone="accent" />
        <StatCard
          label="Converted"
          value={String(converted)}
          note="from the latest visible batch"
          tone="good"
        />
        <StatCard
          label="Active projects"
          value={String(projectRows.filter((p) => p.status === "ongoing").length)}
        />
        <StatCard label="Avg estimate" value={avgEstimate ? inr(avgEstimate) : "-"} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {canAccess(role, "leads") && (
          <section className="rounded-lg border border-border bg-[#141414]/72 p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="eyebrow">Latest leads</p>
              <Link
                href="/admin/leads"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-accent"
              >
                open <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {leadRows.length ? (
                leadRows.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {lead.name || lead.contact_email || "Unnamed lead"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {(lead.needs || []).join(", ") || "no needs"} -{" "}
                        {lead.persona || "unknown"}
                      </p>
                    </div>
                    <span className="text-xs text-muted">{shortDate(lead.created_at)}</span>
                  </div>
                ))
              ) : (
                <p className="py-8 text-sm text-muted">No leads yet.</p>
              )}
            </div>
          </section>
        )}

        {canAccess(role, "projects") && (
          <section className="rounded-lg border border-border bg-[#141414]/72 p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="eyebrow">Projects</p>
              <Link
                href="/admin/projects"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-accent"
              >
                board <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {projectRows.length ? (
                projectRows.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="rounded-md border border-border bg-background/30 p-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {project.client_name}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {project.service_type} - {project.status.replace("_", " ")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="py-8 text-sm text-muted">No projects yet.</p>
              )}
            </div>
          </section>
        )}
      </div>

      {canAccess(role, "blog") && (
        <section className="mt-6 rounded-lg border border-border bg-[#141414]/72 p-5">
          <p className="eyebrow">Blog studio</p>
          <p className="mt-4 text-sm text-muted">
            {posts?.length || 0} post{posts?.length === 1 ? "" : "s"} visible to your role.
          </p>
        </section>
      )}
    </>
  );
}
