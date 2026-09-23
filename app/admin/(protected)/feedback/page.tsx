import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { requireAdminSection } from "@/lib/admin/auth";
import { normalizeFeedbackRow } from "@/lib/admin/feedback-model";

export const metadata: Metadata = {
  title: "Feedback | Admin",
};

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await requireAdminSection("feedback");
  if (session.status !== "ready") return null;

  const params = await searchParams;
  const query = one(params.q).trim().slice(0, 100).replace(/[,%_()]/g, " ");
  const rating = Number(one(params.rating));
  const validRating = Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null;
  const sort = one(params.sort) === "oldest" ? "oldest" : "newest";
  const page = Math.max(1, Math.min(1000, Number.parseInt(one(params.page), 10) || 1));
  const pageSize = 20;

  let request = session.supabase
    .from("feedback")
    .select("id,message,created_at,name,rating,project", { count: "exact" });
  if (query) request = request.or(`message.ilike.%${query}%,name.ilike.%${query}%,project.ilike.%${query}%`);
  if (validRating) request = request.eq("rating", validRating);
  const { data, error, count } = await request
    .order("created_at", { ascending: sort === "oldest" })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) {
    console.error("[admin/feedback] database read failed:", error);
    throw new Error("Feedback data could not be loaded.");
  }

  const items = (data ?? []).map(normalizeFeedbackRow);

  return (
    <>
      <AdminPageHeader
        eyebrow="Feedback"
        title="off the record."
        description="Anonymous issue reports and feedback from the public site. Newest first, with no name or contact field collected."
      />
      <FeedbackList items={items} page={page} total={count ?? 0} query={query} rating={validRating} sort={sort} canDelete={session.profile.role === "owner" || session.profile.role === "project_lead"} />
    </>
  );
}
