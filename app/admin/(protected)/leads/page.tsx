import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LeadsInbox } from "@/components/admin/LeadsInbox";
import { requireAdminSection } from "@/lib/admin/auth";
import type { LeadRow } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Leads | Admin",
};

export default async function LeadsPage() {
  const session = await requireAdminSection("leads");
  if (session.status !== "ready") return null;

  const { data = [] } = await session.supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        eyebrow="Leads"
        title="inbox."
        description="Newest first. Open a lead to see the brief, contact details, estimate, and status."
      />
      <LeadsInbox leads={data as LeadRow[]} role={session.profile.role} />
    </>
  );
}
