import { Path } from "@/components/Path";
import type { HomePost } from "@/components/home/PostsSection";
import { formatDate, getAllPosts } from "@/lib/posts";

// Re-check for newly published posts every 10 minutes.
export const revalidate = 600;

// PathProvider now lives in app/layout.tsx so flow state persists across
// navigation to /about, /blog, etc.
export default async function Home() {
  const posts: HomePost[] = (await getAllPosts()).slice(0, 3).map((post) => ({
    kind: "journal",
    title: post.title,
    href: `/blog/${post.slug}`,
    dateLabel: formatDate(post.date),
    excerpt: post.excerpt,
    image: post.coverImage,
  }));

  return <Path posts={posts} />;
}
