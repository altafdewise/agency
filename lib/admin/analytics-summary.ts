import type { FunnelEventRow, LeadRow, PageViewRow } from "@/lib/supabase/database.types";

/* Turns raw analytics rows into the small summary the dashboard draws. Runs on
   the server, so the browser gets totals instead of every row. Pure (type-only
   imports) so it can be unit tested. */

const DAY_MS = 24 * 60 * 60 * 1000;

export type AnalyticsView = Pick<PageViewRow, "path" | "viewed_at" | "session_id">;
export type AnalyticsEvent = Pick<FunnelEventRow, "session_id" | "step_name" | "action">;
export type AnalyticsLead = Pick<LeadRow, "status" | "ai_price_low" | "ai_price_high">;

export interface AnalyticsSummary {
  /** Views per day (YYYY-MM-DD) per path, over the whole loaded range. */
  dailyViews: { day: string; path: string; views: number }[];
  paths: string[];
  /** Distinct sessions with a page view in the last 30 days. */
  visitors30: number;
  /** Distinct sessions that entered each step of the flow, in order. */
  funnel: { step: string; sessions: number }[];
  topBlogPosts: { path: string; views: number }[];
  enquiries: number;
  /** Percent of enquiries converted or won; null with no enquiries. */
  conversionRate: number | null;
  estimateRequests: number;
  /** Mean of each estimate's midpoint; null with no estimates. */
  avgEstimate: number | null;
}

/** The team's own admin screens are not visitor traffic. */
export function isVisitorPath(path: string) {
  return path !== "/admin" && !path.startsWith("/admin/");
}

export function summarizeAnalytics({
  pageViews,
  funnelEvents,
  leads,
  flowSteps,
  now = Date.now(),
}: {
  pageViews: AnalyticsView[];
  funnelEvents: AnalyticsEvent[];
  leads: AnalyticsLead[];
  /** How many steps the flow has; the funnel shows step_1..step_N. */
  flowSteps: number;
  now?: number;
}): AnalyticsSummary {
  const views = pageViews.filter((view) => isVisitorPath(view.path));

  const daily = new Map<string, number>();
  const blog = new Map<string, number>();
  const visitors = new Set<string>();
  for (const view of views) {
    const time = new Date(view.viewed_at).getTime();
    if (Number.isNaN(time)) continue;
    const key = `${new Date(time).toISOString().slice(0, 10)}\u0000${view.path}`;
    daily.set(key, (daily.get(key) ?? 0) + 1);
    if (view.path.startsWith("/blog/")) blog.set(view.path, (blog.get(view.path) ?? 0) + 1);
    if (view.session_id && time >= now - 30 * DAY_MS) visitors.add(view.session_id);
  }

  const entered = new Map<string, Set<string>>();
  for (const event of funnelEvents) {
    if (event.action !== "entered") continue;
    const sessions = entered.get(event.step_name) ?? new Set<string>();
    sessions.add(event.session_id);
    entered.set(event.step_name, sessions);
  }

  const converted = leads.filter((lead) => lead.status === "converted" || lead.status === "won").length;
  const priced = leads.filter((lead) => lead.ai_price_low != null && lead.ai_price_high != null);

  return {
    dailyViews: [...daily].map(([key, count]) => {
      const [day, path] = key.split("\u0000");
      return { day, path, views: count };
    }),
    paths: [...new Set(views.map((view) => view.path))].sort(),
    visitors30: visitors.size,
    funnel: Array.from({ length: flowSteps }, (_, index) => {
      const step = `step_${index + 1}`;
      return { step: `step ${index + 1}`, sessions: entered.get(step)?.size ?? 0 };
    }),
    topBlogPosts: [...blog]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, count]) => ({ path, views: count })),
    enquiries: leads.length,
    conversionRate: leads.length ? Math.round((converted / leads.length) * 100) : null,
    estimateRequests: priced.length,
    avgEstimate: priced.length
      ? priced.reduce((sum, lead) => sum + ((lead.ai_price_low ?? 0) + (lead.ai_price_high ?? 0)) / 2, 0) /
        priced.length
      : null,
  };
}
