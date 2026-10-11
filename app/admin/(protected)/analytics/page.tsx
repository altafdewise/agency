import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { requireAdminSection } from "@/lib/admin/auth";
import {
  summarizeAnalytics,
  type AnalyticsEvent,
  type AnalyticsLead,
  type AnalyticsView,
} from "@/lib/admin/analytics-summary";
import { TOTAL_STEPS } from "@/lib/brief";

export const metadata: Metadata = {
  title: "Analytics | Admin",
};

// Supabase returns at most 1,000 rows per request, so rows are read page by page.
const PAGE_SIZE = 1000;
const MAX_ROWS = 100_000;

async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
) {
  const rows: T[] = [];
  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1);
    if (error) return { rows, error };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return { rows, error: null };
}

export default async function AnalyticsPage() {
  const session = await requireAdminSection("analytics");
  if (session.status !== "ready") return null;

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const [views, events, leads, { count: bookingCount, error: bookingsError }] = await Promise.all([
    fetchAll<AnalyticsView>((from, to) =>
      session.supabase
        .from("page_views")
        .select("path,viewed_at,session_id")
        .gte("viewed_at", since)
        .order("viewed_at", { ascending: false })
        .order("id")
        .range(from, to)
    ),
    fetchAll<AnalyticsEvent>((from, to) =>
      session.supabase
        .from("funnel_events")
        .select("session_id,step_name,action")
        .eq("action", "entered")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to)
    ),
    fetchAll<AnalyticsLead>((from, to) =>
      session.supabase
        .from("leads")
        .select("status,ai_price_low,ai_price_high")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to)
    ),
    session.supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);
  const failed = views.error || events.error || leads.error || bookingsError;
  if (failed) { console.error("[admin/analytics] query failed:", failed); throw new Error("Analytics could not be loaded."); }

  return (
    <>
      <AdminPageHeader
        eyebrow="Analytics"
        title="what people do."
        description="Internal page views, lead conversion, and the flow drop-off that matters most."
      />
      <AnalyticsDashboard
        summary={summarizeAnalytics({
          pageViews: views.rows,
          funnelEvents: events.rows,
          leads: leads.rows,
          flowSteps: TOTAL_STEPS,
        })}
        bookingCount={bookingCount ?? 0}
      />
    </>
  );
}
