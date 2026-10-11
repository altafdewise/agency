import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { getAllPosts, formatDate } from "@/lib/posts";

// The blog studio refreshes these pages on every save; this catches anything
// changed outside it (e.g. directly in Supabase) within the hour.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes on building, creating and growing — from the Zev studio.",
};

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <PageShell>
      <p className="eyebrow">Blog</p>
      <h1 className="headline-md mt-5 text-balance">notes from the studio.</h1>

      {posts.length === 0 ? (
        <section className="mt-10 rounded-lg border border-border bg-foreground/[0.025] p-6">
          <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
            first post coming soon.
          </p>
          <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-muted">
            Studio notes are being prepared. This page is intentionally quiet
            until there is something useful to read.
          </p>
        </section>
      ) : (
        <div className="mt-12 flex flex-col">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group grid gap-5 border-t border-border py-8 transition-colors last:border-b hover:border-accent/40 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
            >
              {post.coverImage && (
                <span className="relative block aspect-[16/9] w-full overflow-hidden rounded-xl bg-foreground/[0.04] sm:order-2 sm:w-56">
                  <Image
                    src={post.coverImage}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 224px, 100vw"
                    className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]"
                  />
                </span>
              )}
              <span className="flex flex-col gap-2">
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
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}
