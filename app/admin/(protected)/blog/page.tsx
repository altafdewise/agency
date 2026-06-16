import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BlogStudio } from "@/components/admin/BlogStudio";
import { requireAdminSection } from "@/lib/admin/auth";
import type { BlogPostRow } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Blog Studio | Admin",
};

export default async function BlogAdminPage() {
  const session = await requireAdminSection("blog");
  if (session.status !== "ready") return null;

  const { data = [] } = await session.supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        eyebrow="Blog"
        title="studio."
        description="Draft, edit, upload images, and publish notes to the public blog."
      />
      <BlogStudio posts={data as BlogPostRow[]} />
    </>
  );
}
