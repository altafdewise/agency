import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BookingsBoard } from "@/components/admin/BookingsBoard";
import { requireAdminSection } from "@/lib/admin/auth";
import type { BookingRow, BookingStatus } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Bookings | Admin" };
const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];
function one(value: string | string[] | undefined) { return typeof value === "string" ? value : ""; }

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdminSection("bookings");
  if (session.status !== "ready") return null;

  const params = await searchParams;
  const query = one(params.q).trim().slice(0, 100).replace(/[,%_()]/g, " ");
  const status = STATUSES.includes(one(params.status) as BookingStatus) ? one(params.status) as BookingStatus : "all";
  const period = one(params.period) === "upcoming" || one(params.period) === "completed" ? one(params.period) as "upcoming" | "completed" : "all";
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(params.page), 10) || 1));
  const pageSize = 25;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  let request = session.supabase.from("bookings").select("*", { count: "exact" });
  if (query) request = request.or(`contact_name.ilike.%${query}%,contact_email.ilike.%${query}%,note.ilike.%${query}%`);
  if (status !== "all") request = request.eq("status", status);
  if (period === "upcoming") request = request.gte("date", today).neq("status", "cancelled");
  if (period === "completed") request = request.lt("date", today);
  const { data, error, count } = await request.order("date", { ascending: period === "upcoming" }).order("time", { ascending: true }).range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error("[admin/bookings] query failed:", error); throw new Error("Bookings could not be loaded."); }

  return <>
    <AdminPageHeader eyebrow="Bookings" title="time together." description="Upcoming calls, completed conversations, and booking changes in one place." />
    <BookingsBoard bookings={(data ?? []) as BookingRow[]} role={session.profile.role} query={query} status={status} period={period} page={page} total={count ?? 0} today={today} />
  </>;
}
