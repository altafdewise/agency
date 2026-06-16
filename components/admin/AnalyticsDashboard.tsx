"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FunnelEventRow, LeadRow, PageViewRow } from "@/lib/supabase/database.types";
import { StatCard } from "@/components/admin/StatCard";
import { inr } from "@/lib/admin/format";

const RANGE_DAYS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

const FLOW_STEPS = [
  "step_1",
  "step_2",
  "step_3",
  "step_4",
  "step_5",
  "step_6",
  "step_7",
  "step_8",
];

function dayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function inRange(value: string, days: number) {
  const date = new Date(value).getTime();
  return date >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export function AnalyticsDashboard({
  pageViews,
  funnelEvents,
  leads,
}: {
  pageViews: PageViewRow[];
  funnelEvents: FunnelEventRow[];
  leads: LeadRow[];
}) {
  const [range, setRange] = useState(30);
  const [path, setPath] = useState("all");

  const paths = useMemo(
    () => ["all", ...Array.from(new Set(pageViews.map((view) => view.path))).sort()],
    [pageViews]
  );

  const visibleViews = useMemo(
    () =>
      pageViews.filter(
        (view) => inRange(view.viewed_at, range) && (path === "all" || view.path === path)
      ),
    [pageViews, path, range]
  );

  const viewsByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = range - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      map.set(date, 0);
    }
    visibleViews.forEach((view) => {
      const key = dayKey(view.viewed_at);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, views]) => ({
      date: date.slice(5),
      views,
    }));
  }, [visibleViews, range]);

  const funnel = useMemo(() => {
    return FLOW_STEPS.map((step) => {
      const sessions = new Set(
        funnelEvents
          .filter((event) => event.step_name === step && event.action === "entered")
          .map((event) => event.session_id)
      );
      return { step: step.replace("_", " "), sessions: sessions.size };
    });
  }, [funnelEvents]);

  const totalVisitors = new Set(
    pageViews.filter((view) => inRange(view.viewed_at, 30)).map((view) => view.session_id)
  ).size;
  const converted = leads.filter((lead) => lead.status === "converted").length;
  const conversionRate = leads.length ? Math.round((converted / leads.length) * 100) : 0;
  const avgEstimate =
    leads.reduce((sum, lead) => {
      if (lead.ai_price_low == null || lead.ai_price_high == null) return sum;
      return sum + (lead.ai_price_low + lead.ai_price_high) / 2;
    }, 0) / Math.max(1, leads.filter((lead) => lead.ai_price_low != null).length);

  const topBlogPosts = useMemo(() => {
    const map = new Map<string, number>();
    pageViews
      .filter((view) => view.path.startsWith("/blog/"))
      .forEach((view) => map.set(view.path, (map.get(view.path) || 0) + 1));
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([postPath, views]) => ({ path: postPath, views }));
  }, [pageViews]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors this month" value={String(totalVisitors)} />
        <StatCard label="Total leads" value={String(leads.length)} tone="accent" />
        <StatCard label="Conversion rate" value={`${conversionRate}%`} tone="good" />
        <StatCard label="Avg estimate" value={avgEstimate ? inr(avgEstimate) : "-"} />
      </div>

      <section className="mt-6 rounded-lg border border-border bg-[#141414]/72 p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Page views</p>
            <p className="mt-2 text-sm text-muted">Views per day.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={range}
              onChange={(event) => setRange(Number(event.target.value))}
              className="h-10 rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
            >
              {RANGE_DAYS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={path}
              onChange={(event) => setPath(event.target.value)}
              className="h-10 rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
            >
              {paths.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All pages" : item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={viewsByDay}>
              <CartesianGrid stroke="rgba(242,238,227,0.08)" vertical={false} />
              <XAxis dataKey="date" stroke="#9B9B9B" fontSize={11} tickLine={false} />
              <YAxis stroke="#9B9B9B" fontSize={11} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{
                  background: "#141414",
                  border: "1px solid rgba(242,238,227,0.12)",
                  color: "#F2EEE3",
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#FF4438"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-[#141414]/72 p-5">
        <div className="mb-5">
          <p className="eyebrow">Funnel drop-off</p>
          <p className="mt-2 text-sm text-muted">
            Unique sessions that reached each flow step.
          </p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnel} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="rgba(242,238,227,0.08)" horizontal={false} />
              <XAxis type="number" stroke="#9B9B9B" fontSize={11} tickLine={false} />
              <YAxis
                dataKey="step"
                type="category"
                stroke="#9B9B9B"
                fontSize={12}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: "#141414",
                  border: "1px solid rgba(242,238,227,0.12)",
                  color: "#F2EEE3",
                }}
              />
              <Bar dataKey="sessions" fill="#FF4438" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-border bg-[#141414]/72 p-5">
        <p className="eyebrow">Top blog posts</p>
        <div className="mt-5 divide-y divide-border">
          {topBlogPosts.length ? (
            topBlogPosts.map((post) => (
              <div key={post.path} className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-foreground">{post.path}</span>
                <span className="font-mono text-xs text-muted">{post.views}</span>
              </div>
            ))
          ) : (
            <p className="py-8 text-sm text-muted">No blog views yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
