"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

/* The home page's one reveal language: a focus pull. Each word comes in from
   a soft blur to sharp, one after another, without moving — and the full stop
   eases in last as the brand's red dot. Nothing jumps or overshoots. Under
   reduced motion the same states apply instantly (keeping server and client
   markup identical). */

type Step = { i: number; instant: boolean; delay: number };

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const WORD_STAGGER = 0.06;

const wordVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  show: ({ i, instant, delay }: Step) => ({
    opacity: 1,
    filter: "blur(0px)",
    transition: instant
      ? { duration: 0 }
      : { duration: 1.1, ease: EASE_OUT, delay: delay + i * WORD_STAGGER },
  }),
};

const dotVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  show: ({ i, instant, delay }: Step) => ({
    opacity: 1,
    scale: 1,
    transition: instant
      ? { duration: 0 }
      : { duration: 0.8, ease: EASE_OUT, delay: delay + i * WORD_STAGGER + 0.3 },
  }),
};

/**
 * The words of `text`, each focusing in on its turn. `start` is this run's
 * position in the overall sequence, so several runs can share one cascade.
 * Must sit inside a motion parent that switches between "hidden" and "show".
 */
export function FocusWords({
  text,
  start = 0,
  delay = 0,
  tail,
}: {
  text: string;
  start?: number;
  delay?: number;
  /** Rendered right after the last word, never wrapping away from it. */
  tail?: React.ReactNode;
}) {
  const instant = useSafeReducedMotion();
  const words = text.split(" ");
  const last = words.length - 1;
  return (
    <>
      {words.map((word, k) => (
        <span key={k} className={k === last && tail ? "whitespace-nowrap" : undefined}>
          <motion.span
            className="inline-block"
            custom={{ i: start + k, instant, delay }}
            variants={wordVariants}
          >
            {word}
          </motion.span>
          {k < last ? " " : tail}
        </span>
      ))}
    </>
  );
}

/** The brand full stop — a red dot sized to the surrounding type. */
export function RedDot({
  index = 0,
  delay = 0,
  className,
}: {
  index?: number;
  delay?: number;
  className?: string;
}) {
  const instant = useSafeReducedMotion();
  return (
    <motion.span
      aria-hidden
      custom={{ i: index, instant, delay }}
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
 * Renders `lines` as stacked lines whose words focus in one by one. With
 * `dot`, the last line ends in a <RedDot> instead of a typed full stop
 * (screen readers still get the plain sentence via aria-label).
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
  const Component = motion[as];
  const label = lines.join(" ") + (dot ? "." : "");
  const starts = lines.map((_, i) =>
    lines.slice(0, i).reduce((sum, line) => sum + line.split(" ").length, 0)
  );
  const total = starts[starts.length - 1] + lines[lines.length - 1].split(" ").length;

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
          // If a line has to wrap on a narrow screen, wrap it evenly.
          className={cn("block text-balance", lineClassName)}
        >
          <FocusWords
            text={line}
            start={starts[i]}
            tail={dot && i === lines.length - 1 ? <RedDot index={total} /> : undefined}
          />
        </span>
      ))}
    </Component>
  );
}
