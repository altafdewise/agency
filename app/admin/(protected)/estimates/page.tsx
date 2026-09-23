import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EstimatesBoard } from "@/components/admin/EstimatesBoard";
import { requireAdminSection } from "@/lib/admin/auth";
import type { EstimateStatus, LeadRow } from "@/lib/supabase/database.types";

export const metadata: Metadata = { title: "Estimates | Admin" };
const STATUSES: EstimateStatus[] = ["new", "reviewing", "sent", "accepted", "rejected"];
function one(value: string | string[] | undefined) { return typeof value === "string" ? value : ""; }

export default async function EstimatesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdminSection("estimates");
  if (session.status !== "ready") return null;

  const params = await searchParams;
  const query = one(params.q).trim().slice(0, 100).replace(/[,%_()]/g, " ");
  const status = STATUSES.includes(one(params.status) as EstimateStatus) ? one(params.status) as EstimateStatus : "all";
  const sort = one(params.sort) === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(params.page), 10) || 1));
  const pageSize = 25;

  let request = session.supabase.from("leads").select("*", { count: "exact" }).not("ai_price_low", "is", null);
  if (query) request = request.or(`name.ilike.%${query}%,contact_email.ilike.%${query}%,company.ilike.%${query}%,brief_text.ilike.%${query}%`);
  if (status !== "all") request = request.eq("estimate_status", status);
  const { data, error, count } = await request.order("created_at", { ascending: sort === "oldest" }).range((page - 1) * pageSize, page * pageSize - 1);
  if (error) { console.error("[admin/estimates] query failed:", error); throw new Error("Estimates could not be loaded."); }

  return <>
    <AdminPageHeader eyebrow="Estimates" title="from brief to budget." description="Every estimate stays connected to its original enquiry." />
    <EstimatesBoard estimates={(data ?? []) as LeadRow[]} role={session.profile.role} query={query} status={status} sort={sort} page={page} total={count ?? 0} />
  </>;
}
