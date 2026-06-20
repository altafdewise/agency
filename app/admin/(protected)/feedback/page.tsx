import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FeedbackList } from "@/components/admin/FeedbackList";
import { requireAdminSection } from "@/lib/admin/auth";
import { listFeedback } from "@/lib/feedback";

export const metadata: Metadata = {
  title: "Feedback | Admin",
};

export default async function FeedbackPage() {
  const session = await requireAdminSection("feedback");
  if (session.status !== "ready") return null;

  const items = await listFeedback();

  return (
    <>
      <AdminPageHeader
        eyebrow="Feedback"
        title="off the record."
        description="Anonymous issue reports and feedback from the public site. Newest first, with no name or contact field collected."
      />
      <FeedbackList items={items} />
    </>
  );
}
