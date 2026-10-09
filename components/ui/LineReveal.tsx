"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

/* The home page's one reveal language: each line rises out from behind its
   own baseline (a clipped mask), and the full stop lands as the brand's red
   dot. The container is what's observed — the lines start clipped, so they
   would never register as "in view" themselves. Under reduced motion the
   same states apply instantly (keeping server and client markup identical). */

type Step = { i: number; instant: boolean };

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const LINE_STAGGER = 0.09;

const lineVariants: Variants = {
  hidden: { y: "112%" },
  show: ({ i, instant }: Step) => ({
    y: "0%",
    transition: instant
      ? { duration: 0 }
      : { duration: 0.95, ease: EASE_OUT, delay: i * LINE_STAGGER },
  }),
};

const dotVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: ({ i, instant }: Step) => ({
    scale: 1,
    opacity: 1,
    transition: instant
      ? { duration: 0 }
      : { type: "spring", stiffness: 520, damping: 16, delay: 0.45 + i * LINE_STAGGER },
  }),
};

/** The brand full stop — a red dot sized to the surrounding type. */
export function RedDot({ index = 0, className }: { index?: number; className?: string }) {
  const reduce = useSafeReducedMotion();
  return (
    <motion.span
      aria-hidden
      custom={{ i: index, instant: reduce }}
      variants={dotVariants}
      className={cn(
        "ml-[0.06em] inline-block h-[0.19em] w-[0.19em] rounded-full bg-accent align-baseline",
        className
      )}
    />
  );
}

type Tag = "h1" | "h2" | "h3" | "p";

/**
 * Renders `lines` as stacked, individually masked lines. With `dot`, the last
 * line ends in a <RedDot> instead of a typed full stop (screen readers still
 * get the plain sentence via aria-label).
 */
export function LineReveal({
  as = "h2",
  lines,
  dot = false,
  className,
  lineClassName,
  amount = 0.5,
  id,
}: {
  as?: Tag;
  lines: string[];
  dot?: boolean;
  className?: string;
  lineClassName?: string;
  amount?: number;
  id?: string;
}) {
  const reduce = useSafeReducedMotion();
  const Component = motion[as];
  const label = lines.join(" ") + (dot ? "." : "");

  return (
    <Component
      id={id}
      aria-label={label}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          aria-hidden
          // Room under the baseline so descenders aren't clipped by the mask.
          className={cn("block overflow-hidden pb-[0.14em] -mb-[0.14em]", lineClassName)}
        >
          <motion.span
            // If a line has to wrap on a narrow screen, wrap it evenly.
            className="block text-balance"
            custom={{ i, instant: reduce }}
            variants={lineVariants}
          >
            {line}
            {dot && i === lines.length - 1 && <RedDot index={i} />}
          </motion.span>
        </span>
      ))}
    </Component>
  );
}
