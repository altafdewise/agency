import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { getAllPosts, formatDate } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on building, creating and growing — from the maggie studio.",
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <PageShell>
      <p className="eyebrow">Blog</p>
      <h1 className="headline-md mt-5 text-balance">notes from the studio.</h1>

      {posts.length === 0 ? (
        <p className="body-muted mt-10">First post coming soon.</p>
      ) : (
        <div className="mt-12 flex flex-col">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 border-t border-border py-8 transition-colors last:border-b hover:border-accent/40"
            >
              {post.date && (
                <span className="eyebrow">{formatDate(post.date)}</span>
              )}
              <h2 className="flex items-start justify-between gap-4 font-display text-2xl font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-accent sm:text-3xl">
                {post.title}
                <ArrowUpRight
                  className="mt-1 h-5 w-5 shrink-0 text-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                  strokeWidth={1.75}
                />
              </h2>
              {post.excerpt && (
                <p className="max-w-2xl text-base font-light leading-relaxed text-muted">
                  {post.excerpt}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
