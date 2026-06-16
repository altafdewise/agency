import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { requireAdminSection } from "@/lib/admin/auth";
import type {
  FunnelEventRow,
  LeadRow,
  PageViewRow,
} from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Analytics | Admin",
};

export default async function AnalyticsPage() {
  const session = await requireAdminSection("analytics");
  if (session.status !== "ready") return null;

  const [{ data: pageViews = [] }, { data: funnelEvents = [] }, { data: leads = [] }] =
    await Promise.all([
      session.supabase
        .from("page_views")
        .select("*")
        .order("viewed_at", { ascending: false })
        .limit(5000),
      session.supabase
        .from("funnel_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5000),
      session.supabase.from("leads").select("*").order("created_at", { ascending: false }),
    ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Analytics"
        title="what people do."
        description="Internal page views, lead conversion, and the flow drop-off that matters most."
      />
      <AnalyticsDashboard
        pageViews={pageViews as PageViewRow[]}
        funnelEvents={funnelEvents as FunnelEventRow[]}
        leads={leads as LeadRow[]}
      />
    </>
  );
}
