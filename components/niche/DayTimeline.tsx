"use client";

import { motion, type Variants } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Seconds between one stop lighting up and the next. */
const PACE = 0.7;

// Kept in line with the terms: the clock starts once we have the details and
// the go-ahead, and the work is the client's once it's paid for.
const STOPS = [
  {
    time: "0h",
    title: "you send your details",
    body: "Your name, address, timings, what you offer, a few photos, and your logo if you have one.",
  },
  {
    title: "we design and build",
    body: "One fast page, laid out around what your customers look for.",
  },
  {
    title: "you check it",
    body: "On your own phone. Tell us what to change.",
  },
  {
    time: "24h",
    title: "it's live",
    body: "On your own domain. Once it's paid for, it's yours.",
  },
];

/**
 * The 24 hours from details to a live site: four stops that light up in turn,
 * joined by a line that draws from one to the next. Stacked on phones, in a
 * row from sm up.
 */
export function DayTimeline() {
  const instant = useSafeReducedMotion();
  const at = (i: number, extra = 0) => (instant ? { duration: 0 } : { duration: 0.6, ease: EASE_OUT, delay: i * PACE + extra });

  const fill: Variants = {
    hidden: { scale: 0 },
    show: (i: number) => ({ scale: 1, transition: at(i) }),
  };
  const segment: Variants = {
    hidden: { scale: 0 },
    show: (i: number) => ({ scale: 1, transition: { ...at(i, 0.15), duration: instant ? 0 : PACE } }),
  };
  const text: Variants = {
    hidden: { opacity: 0, filter: "blur(8px)" },
    show: (i: number) => ({ opacity: 1, filter: "blur(0px)", transition: at(i, 0.05) }),
  };

  return (
    <motion.ol
      className="mt-14 grid sm:grid-cols-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {STOPS.map((stop, i) => (
        <li key={stop.title} className="relative pb-10 pl-10 last:pb-0 sm:px-4 sm:pb-0 sm:pl-4 sm:pt-12 sm:text-center">
          {i < STOPS.length - 1 && (
            // Joins this stop to the next: down on phones, across from sm up.
            <motion.span
              aria-hidden
              custom={i}
              variants={segment}
              className="absolute bottom-0 left-[5px] top-4 w-px origin-top bg-foreground/30 sm:bottom-auto sm:left-1/2 sm:top-[5px] sm:h-px sm:w-full sm:origin-left"
            />
          )}
          {/* The ring stays put (it carries the centring translate); the red
              fill inside it is what animates. */}
          <span
            aria-hidden
            className="absolute left-0 top-1 h-[11px] w-[11px] rounded-full border border-accent/60 bg-background sm:left-1/2 sm:top-0 sm:-translate-x-1/2"
          >
            <motion.span custom={i} variants={fill} className="absolute -inset-px rounded-full bg-accent" />
          </span>
          <motion.div custom={i} variants={text}>
            <p className="min-h-[1rem] font-mono text-xs tracking-[0.12em] text-accent">{stop.time}</p>
            <h3 className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.35rem]">
              {stop.title}
            </h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-muted">{stop.body}</p>
          </motion.div>
        </li>
      ))}
    </motion.ol>
  );
}
