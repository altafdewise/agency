import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LeadsInbox } from "@/components/admin/LeadsInbox";
import { requireAdminSection } from "@/lib/admin/auth";
import type { LeadRow, LeadStatus } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Leads | Admin",
};

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "converted", "lost"];
function one(value: string | string[] | undefined) { return typeof value === "string" ? value : ""; }

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdminSection("leads");
  if (session.status !== "ready") return null;

  const params = await searchParams;
  const query = one(params.q).trim().slice(0, 100).replace(/[,%_()]/g, " ");
  const status = STATUSES.includes(one(params.status) as LeadStatus) ? one(params.status) as LeadStatus : "all";
  const sort = one(params.sort) === "oldest" ? "oldest" : one(params.sort) === "updated" ? "updated" : "newest";
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(params.page), 10) || 1));
  const pageSize = 25;

  let request = session.supabase
    .from("leads")
    .select("*", { count: "exact" });
  if (query) request = request.or(`name.ilike.%${query}%,contact_email.ilike.%${query}%,company.ilike.%${query}%,brief_text.ilike.%${query}%`);
  if (status !== "all") request = request.eq("status", status);
  const { data, error, count } = await request
    .order(sort === "updated" ? "updated_at" : "created_at", { ascending: sort === "oldest" })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error("[admin/leads] query failed:", error); throw new Error("Leads could not be loaded."); }

  return (
    <>
      <AdminPageHeader
        eyebrow="Leads"
        title="inbox."
        description="Newest first. Open a lead to see the brief, contact details, estimate, and status."
      />
      <LeadsInbox leads={(data ?? []) as LeadRow[]} role={session.profile.role} page={page} total={count ?? 0} query={query} status={status} sort={sort} />
    </>
  );
}
