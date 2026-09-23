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

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: pageViews = [], error: viewsError }, { data: funnelEvents = [], error: funnelError }, { data: leads = [], error: leadsError }, { count: bookingCount, error: bookingsError }] =
    await Promise.all([
      session.supabase
        .from("page_views")
        .select("id,path,viewed_at,referrer,session_id")
        .gte("viewed_at", since)
        .order("viewed_at", { ascending: false })
        .limit(5000),
      session.supabase
        .from("funnel_events")
        .select("id,session_id,step_name,action,created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5000),
      session.supabase.from("leads").select("id,status,ai_price_low,ai_price_high,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
      session.supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);
  const failed = viewsError || funnelError || leadsError || bookingsError;
  if (failed) { console.error("[admin/analytics] query failed:", failed); throw new Error("Analytics could not be loaded."); }

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
        leads={leads as Pick<LeadRow, "id" | "status" | "ai_price_low" | "ai_price_high" | "created_at">[]}
        bookingCount={bookingCount ?? 0}
      />
    </>
  );
}
