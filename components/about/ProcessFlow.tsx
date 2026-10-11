"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { cn } from "@/lib/cn";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Each step says what happens, what's asked of the client, what we do, and how
// long it takes. Kept in line with the terms page and the estimate flow.
const STEPS = [
  {
    label: "brief",
    title: "you tell us what you're building.",
    body: "Pick what you need on the home page and describe it in a few lines. No forms, and no call needed yet.",
    you: "A few lines: what it is, who it's for, what you already have.",
    us: "Read it properly and ask about anything that's missing.",
    time: "a few minutes",
  },
  {
    label: "estimate",
    title: "you see a price straight away.",
    body: "We read your brief against our rate card. A detailed brief gets a precise range; a short one gets a starting price and the questions that would sharpen it.",
    you: "Answer a couple of questions if we ask.",
    us: "Price it from the same rates for everyone.",
    time: "instant",
  },
  {
    label: "scope",
    title: "we agree the plan in writing.",
    body: "A short call to confirm what we'll deliver, when, the price and the payment schedule. Nothing starts until that's agreed.",
    you: "One short call, then sign off on the plan.",
    us: "Turn your brief into a clear, written scope.",
    time: "one call",
  },
  {
    label: "build",
    title: "we design and build it.",
    body: "Design and development, kept moving and fully transparent. You see the work take shape and give feedback at each milestone.",
    you: "Feedback, content and approvals when they're needed.",
    us: "Design, build and test everything in the plan.",
    time: "set in your plan, from 24 hours for essentials",
  },
  {
    label: "launch",
    title: "we launch it, and it's yours.",
    body: "We take it live with you and hand over the files and access. Once it's paid for, you own what we made for you.",
    you: "Say go.",
    us: "Launch it and hand everything over.",
    time: "launch day",
  },
];

/**
 * "How we work": five steps on one line. Tapping a step sends the red dot
 * along to it and opens that step's explanation; "next" walks the flow.
 */
export function ProcessFlow() {
  const reduce = useSafeReducedMotion();
  const [active, setActive] = useState(0);
  const last = STEPS.length - 1;
  const at = (i: number) => `${(i / last) * 100}%`;
  const step = STEPS[active];

  return (
    <div className="mt-14">
      <div className="relative mx-6 sm:mx-10">
        {/* The line, filled up to the current step. */}
        <div aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-foreground/15" />
        <motion.div
          aria-hidden
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-foreground"
          initial={false}
          animate={{ width: at(active) }}
          transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_OUT }}
        />

        <ol className="relative flex justify-between">
          {STEPS.map((s, i) => {
            const on = i === active;
            const done = i < active;
            return (
              // Zero-width items so each step sits exactly at its point on the
              // line (0%, 25% ... 100%); the tap target overflows evenly.
              <li key={s.label} className="relative flex w-0 justify-center">
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={on ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${s.label}`}
                  className="group relative flex h-12 w-12 items-center justify-center"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition-all duration-300",
                      done || on ? "bg-foreground" : "bg-foreground/25 group-hover:bg-foreground/60",
                      on && "scale-0"
                    )}
                  />
                </button>
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute top-12 whitespace-nowrap font-mono text-[0.7rem] transition-colors duration-300",
                    on ? "text-foreground" : "text-muted"
                  )}
                >
                  <span className="hidden sm:inline">{String(i + 1).padStart(2, "0")} </span>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        {/* The dot leads: it travels along the line to the step you tap. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_18px_rgba(255,68,56,0.55)]"
          initial={false}
          animate={{ left: at(active) }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 20 }}
        />
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={reduce ? { duration: 0 } : { duration: 0.55, ease: EASE_OUT }}
        className="mt-20 border-t border-border pt-10"
        aria-live="polite"
      >
        <p className="font-mono text-xs tabular-nums text-accent">
          {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </p>
        <h3 className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold leading-tight tracking-tight text-foreground">
          {step.title}
        </h3>
        <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-muted">{step.body}</p>

        <dl className="mt-9 grid gap-6 sm:grid-cols-3">
          {(
            [
              ["you", step.you],
              ["us", step.us],
              ["time", step.time],
            ] as const
          ).map(([term, text]) => (
            <div key={term}>
              <dt className="eyebrow">{term}</dt>
              <dd className="mt-2 text-sm font-light leading-relaxed text-foreground/90">{text}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10">
          {active < last ? (
            <button
              type="button"
              onClick={() => setActive(active + 1)}
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              next: {STEPS[active + 1].label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
            </button>
          ) : (
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
              start your project
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
