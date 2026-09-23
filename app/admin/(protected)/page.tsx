import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { requireAdminSection } from "@/lib/admin/auth";
import { canAccess } from "@/lib/admin/permissions";
import type { AppRole } from "@/lib/supabase/database.types";

type Activity = { id: string; label: string; detail: string; at: string; href: string };

function when(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminDashboardPage() {
  const session = await requireAdminSection("dashboard");
  if (session.status !== "ready") return null;
  const db = session.supabase;
  const role = session.profile.role as AppRole;
  const leadsAllowed = canAccess(role, "leads");
  const bookingsAllowed = canAccess(role, "bookings");
  const feedbackAllowed = canAccess(role, "feedback");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [newLeads, pendingEstimates, allLeads, wonLeads, upcomingBookings, newFeedback, recentLeads, recentBookings, recentFeedback] = await Promise.all([
    leadsAllowed ? db.from("leads").select("id", { count: "exact", head: true }).eq("status", "new") : null,
    leadsAllowed ? db.from("leads").select("id", { count: "exact", head: true }).not("ai_price_low", "is", null).in("estimate_status", ["new", "reviewing"]) : null,
    leadsAllowed ? db.from("leads").select("id", { count: "exact", head: true }) : null,
    leadsAllowed ? db.from("leads").select("id", { count: "exact", head: true }).in("status", ["won", "converted"]) : null,
    bookingsAllowed ? db.from("bookings").select("id", { count: "exact", head: true }).gte("date", today).neq("status", "cancelled") : null,
    feedbackAllowed ? db.from("feedback").select("id", { count: "exact", head: true }).gte("created_at", weekAgo) : null,
    leadsAllowed ? db.from("leads").select("id,name,contact_email,needs,ai_price_low,created_at").order("created_at", { ascending: false }).limit(8) : null,
    bookingsAllowed ? db.from("bookings").select("id,contact_name,contact_email,created_at").order("created_at", { ascending: false }).limit(8) : null,
    feedbackAllowed ? db.from("feedback").select("id,message,created_at").order("created_at", { ascending: false }).limit(8) : null,
  ]);

  const failed = [newLeads, pendingEstimates, allLeads, wonLeads, upcomingBookings, newFeedback, recentLeads, recentBookings, recentFeedback].find((result) => result?.error);
  if (failed?.error) { console.error("[admin] overview query failed:", failed.error); throw new Error("Overview could not be loaded."); }

  const activities: Activity[] = [
    ...(recentLeads?.data ?? []).map((lead) => ({ id: `lead-${lead.id}`, label: lead.ai_price_low != null ? "Estimate requested" : "New enquiry", detail: lead.name || lead.contact_email || "Unnamed lead", at: lead.created_at, href: "/admin/leads" })),
    ...(recentBookings?.data ?? []).map((booking) => ({ id: `booking-${booking.id}`, label: "Call booked", detail: booking.contact_name || booking.contact_email || "Unnamed client", at: booking.created_at, href: "/admin/bookings" })),
    ...(recentFeedback?.data ?? []).map((feedback) => ({ id: `feedback-${feedback.id}`, label: "Feedback received", detail: (feedback.message || "Anonymous message").slice(0, 100), at: feedback.created_at, href: "/admin/feedback" })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);

  const total = allLeads?.count ?? 0;
  const rate = total > 0 ? `${Math.round(((wonLeads?.count ?? 0) / total) * 100)}%` : "—";

  return <>
    <AdminPageHeader eyebrow="Overview" title="today's pulse." description="The studio's live enquiry, estimate, booking and feedback activity." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {leadsAllowed && <><StatCard label="New leads" value={String(newLeads?.count ?? 0)} tone="accent" /><StatCard label="Pending estimates" value={String(pendingEstimates?.count ?? 0)} /><StatCard label="Conversion rate" value={rate} note={total ? `${wonLeads?.count ?? 0} won or converted from ${total} leads` : "No activity yet."} /></>}
      {bookingsAllowed && <StatCard label="Upcoming bookings" value={String(upcomingBookings?.count ?? 0)} note="Today onward" />}
      {feedbackAllowed && <StatCard label="New feedback" value={String(newFeedback?.count ?? 0)} note="Last 7 days" />}
    </div>
    <section className="mt-8 border border-border bg-[#141414]/72 p-5 sm:p-7">
      <div className="flex items-center justify-between gap-4"><div><p className="eyebrow">Recent activity</p><h2 className="mt-3 font-display text-2xl text-foreground">What just happened.</h2></div></div>
      {activities.length ? <ul className="mt-6 divide-y divide-border">{activities.map((item) => <li key={item.id}><Link href={item.href} className="grid gap-2 py-4 transition-colors hover:text-accent sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center"><span className="text-xs uppercase tracking-[0.14em] text-accent">{item.label}</span><span className="truncate text-sm text-foreground">{item.detail}</span><time dateTime={item.at} className="text-xs text-muted">{when(item.at)}</time></Link></li>)}</ul> : <p className="py-12 text-sm text-muted">{leadsAllowed || bookingsAllowed || feedbackAllowed ? "No activity yet." : "Operational activity is not available to your role."}</p>}
    </section>
    <nav aria-label="Other admin areas" className="mt-8 grid gap-3 sm:grid-cols-2">
      {canAccess(role, "projects") && <Link href="/admin/projects" className="flex items-center justify-between border border-border p-5 text-sm text-foreground hover:border-accent">Projects <ArrowUpRight className="h-4 w-4" /></Link>}
      {canAccess(role, "blog") && <Link href="/admin/blog" className="flex items-center justify-between border border-border p-5 text-sm text-foreground hover:border-accent">Blog studio <ArrowUpRight className="h-4 w-4" /></Link>}
    </nav>
  </>;
}
