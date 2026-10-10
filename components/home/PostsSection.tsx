"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FocusWords, LineReveal } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

/** A row on the home page. Blog posts today; Instagram posts can use the same
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

/** A hairline that draws in from the left when its row arrives. */
function Hairline({ delay = 0 }: { delay?: number }) {
  const instant = useSafeReducedMotion();
  const variants: Variants = {
    hidden: { scaleX: 0 },
    show: {
      scaleX: 1,
      transition: instant ? { duration: 0 } : { duration: 1.3, ease: EASE_OUT, delay },
    },
  };
  return (
    <motion.span
      aria-hidden
      variants={variants}
      className="absolute inset-x-0 top-0 h-px origin-left bg-foreground/15"
    />
  );
}

function PostRow({ post, index }: { post: HomePost; index: number }) {
  const external = post.href.startsWith("http");
  const delay = index * 0.1;

  return (
    <motion.li
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      // The row you point at stays lit; the others step back.
      className="relative transition-opacity duration-300 group-hover/list:opacity-40 hover:!opacity-100 focus-within:!opacity-100"
    >
      <Hairline delay={delay} />
      <Link
        href={post.href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="group flex items-center gap-4 py-7 sm:gap-8 sm:py-9"
      >
        <span className="w-7 shrink-0 self-start pt-[0.55em] font-mono text-xs tabular-nums text-muted transition-colors duration-300 group-hover:text-accent sm:self-center sm:pt-0">
          {String(index + 1).padStart(2, "0")}
        </span>

        {post.image && (
          <span className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-full sm:block">
            <Image src={post.image} alt="" fill sizes="56px" className="object-cover" />
          </span>
        )}

        <span className="relative min-w-0 flex-1">
          {post.dateLabel && (
            <span className="mb-2 block font-mono text-[0.68rem] uppercase tracking-[0.16em] text-muted sm:hidden">
              {post.dateLabel}
            </span>
          )}
          <span className="relative block">
            <span
              aria-hidden
              className="absolute left-0 top-[0.55em] h-2 w-2 scale-0 rounded-full bg-accent transition-transform duration-500 ease-out-soft group-hover:scale-100"
            />
            <span className="block font-display text-[clamp(1.35rem,2.7vw,2.35rem)] font-semibold leading-[1.15] tracking-tightest text-foreground transition-transform duration-500 ease-out-soft group-hover:translate-x-6">
              <FocusWords text={post.title} delay={0.15 + delay} />
            </span>
          </span>
        </span>

        {post.dateLabel && (
          <span className="hidden w-44 shrink-0 text-right font-mono text-xs uppercase tracking-[0.14em] text-muted sm:block">
            {post.dateLabel}
          </span>
        )}

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-foreground transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-background">
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </Link>
    </motion.li>
  );
}

/**
 * "From the studio" — the latest posts as a box-less editorial list, in the
 * same language as the services: rows straight on the page, hairlines
 * between them, and the red dot marking the one you're on. Hidden entirely
 * when there are none.
 */
export function PostsSection({ posts }: { posts: HomePost[] }) {
  if (posts.length === 0) return null;

  return (
    <section
      data-chapter
      aria-labelledby="posts-heading"
      className="relative w-full px-6 py-[clamp(7rem,18vh,12rem)] sm:px-10"
    >
      <div className="mx-auto w-full max-w-path">
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

        <ul className="group/list mt-[clamp(3rem,8vh,5rem)]">
          {posts.map((post, i) => (
            <PostRow key={post.href} post={post} index={i} />
          ))}
        </ul>
        <motion.div
          className="relative h-px"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 1 }}
        >
          <Hairline delay={posts.length * 0.1} />
        </motion.div>

        <Link
          href="/blog"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-foreground sm:hidden"
        >
          all posts
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
