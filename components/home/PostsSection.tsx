"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LineReveal } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

/** A card on the home page. Blog posts today; Instagram posts can use the same
 *  shape later (kind "instagram", external href, image). */
export interface HomePost {
  kind: "journal" | "instagram";
  title: string;
  href: string;
  dateLabel?: string;
  excerpt?: string;
  image?: string;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function PostCard({ post, index }: { post: HomePost; index: number }) {
  const reduce = useSafeReducedMotion();
  const external = post.href.startsWith("http");

  return (
    <motion.li
      className="w-[82vw] max-w-[380px] shrink-0 snap-start lg:w-auto lg:max-w-none"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      // Trigger on vertical position only, so a card peeking in from the right
      // of the mobile swipe row is already visible.
      viewport={{ once: true, amount: "some", margin: "0px 0px -15% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.8, ease: EASE_OUT, delay: index * 0.1 }}
    >
      <Link
        href={post.href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="group flex h-full min-h-[340px] flex-col overflow-hidden rounded-[28px] border border-foreground/[0.06] bg-surface/70 transition-[transform,box-shadow,border-color] duration-500 ease-out-soft hover:-translate-y-1 hover:border-foreground/10 hover:shadow-card-hover"
      >
        {post.image && (
          <span className="relative block aspect-[4/3] w-full overflow-hidden">
            <Image
              src={post.image}
              alt=""
              fill
              sizes="(min-width: 1024px) 380px, 82vw"
              className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]"
            />
          </span>
        )}

        <span className="flex flex-1 flex-col p-7 sm:p-8">
          <span className="flex items-center justify-between gap-4 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted">
            <span>{post.kind === "instagram" ? "instagram" : "journal"}</span>
            {post.dateLabel && <span className="tracking-[0.08em]">{post.dateLabel}</span>}
          </span>

          <span className="mt-8 font-display text-[1.6rem] font-semibold leading-[1.12] tracking-tightest text-foreground">
            {post.title}
          </span>

          {post.excerpt && (
            <span className="mt-4 line-clamp-2 text-[0.95rem] font-light leading-relaxed text-muted">
              {post.excerpt}
            </span>
          )}

          <span className="mt-auto flex items-center justify-between pt-10">
            <span className="h-[7px] w-[7px] scale-0 rounded-full bg-accent transition-transform duration-500 ease-out-soft group-hover:scale-100" />
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 text-foreground transition-colors duration-300 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </span>
        </span>
      </Link>
    </motion.li>
  );
}

/** "From the studio" — the latest posts. Hidden entirely when there are none. */
export function PostsSection({ posts }: { posts: HomePost[] }) {
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="posts-heading"
      className="relative w-full py-[clamp(7rem,18vh,12rem)]"
    >
      <div className="mx-auto w-full max-w-path px-6 sm:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">from the studio</p>
            <LineReveal
              id="posts-heading"
              lines={["notes & posts"]}
              dot
              className="mt-5 font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-semibold leading-[1.02] tracking-tightest text-foreground"
            />
          </div>
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-2 pb-3 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground sm:inline-flex"
          >
            all posts
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      {/* Mobile: a swipeable row that bleeds to the edge. Desktop: a grid. */}
      <ul className="no-scrollbar mx-auto mt-14 flex w-full max-w-path snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-6 px-6 pb-4 sm:scroll-px-10 sm:px-10 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible">
        {posts.map((post, i) => (
          <PostCard key={post.href} post={post} index={i} />
        ))}
      </ul>

      <div className="mt-6 px-6 sm:hidden">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground"
        >
          all posts
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
