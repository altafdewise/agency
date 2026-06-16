import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { getPost, getSlugs, formatDate } from "@/lib/posts";

export async function generateStaticParams() {
  return (await getSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Not found" };
  return { title: post.meta.title, description: post.meta.excerpt };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <PageShell className="max-w-2xl">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm font-light text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        all posts
      </Link>

      <article className="mt-10">
        <header>
          {post.meta.date && (
            <p className="eyebrow">{formatDate(post.meta.date)}</p>
          )}
          <h1 className="headline-md mt-4 text-balance">{post.meta.title}</h1>
        </header>

        <div
          className="mt-10 text-base font-light leading-relaxed text-muted [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:mt-2 [&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-5 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </PageShell>
  );
}
