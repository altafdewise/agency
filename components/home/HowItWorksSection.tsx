"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { LineReveal } from "@/components/ui/LineReveal";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    title: "tell us",
    body: "a short brief or a quick call. whatever's easiest.",
  },
  {
    title: "know the price",
    body: "plan, timeline and price agreed before anything starts.",
  },
  {
    title: "we build. you launch.",
    body: "kept moving, fully transparent, shipped fast.",
  },
];

/**
 * Three steps on one hairline. As the section scrolls through, the line draws
 * itself and the red dot rides its tip — each step lights up as it's reached.
 * Horizontal on desktop, vertical on mobile; fully drawn under reduced motion.
 */
export function HowItWorksSection() {
  const reduce = useSafeReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrolledTo, setScrolledTo] = useState(0);

  const progress = useScrollProgress(trackRef, ["start 0.88", "end 0.42"]);
  const scrollTip = useTransform(progress, (v) => `${v * 100}%`);

  useMotionValueEvent(progress, "change", (v) => {
    // Step i starts at i / STEPS.length along the line; it lights as the tip passes.
    const count = STEPS.filter((_, i) => v >= i / STEPS.length + 0.03).length;
    setScrolledTo((prev) => (prev === count ? prev : count));
  });

  // Reduced motion: the line is simply drawn and every step is lit.
  const reached = reduce ? STEPS.length : scrolledTo;
  const tip = reduce ? "100%" : scrollTip;

  return (
    <section
      data-chapter
      aria-labelledby="how-heading"
      className="relative w-full px-6 py-[clamp(7rem,18vh,12rem)] sm:px-10"
    >
      <div className="mx-auto w-full max-w-path">
        <p className="eyebrow">how it works</p>
        <LineReveal
          id="how-heading"
          lines={["from hello to launch"]}
          dot
          className="mt-5 font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-semibold leading-[1.02] tracking-tightest text-foreground"
        />

        <div ref={trackRef} className="relative mt-[clamp(4rem,10vh,7rem)]">
          {/* Line: horizontal (lg) / vertical (mobile). */}
          <div aria-hidden className="absolute bottom-0 left-[5px] top-0 w-px bg-foreground/10 lg:bottom-auto lg:left-0 lg:right-0 lg:h-px lg:w-auto">
            <motion.div
              className="absolute inset-x-0 top-0 origin-top bg-foreground lg:hidden"
              style={{ height: tip }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 hidden bg-foreground lg:block"
              style={{ width: tip }}
            />
            <motion.span
              className="absolute left-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent lg:hidden"
              style={{ top: tip }}
            />
            <motion.span
              className="absolute top-1/2 hidden h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent lg:block"
              style={{ left: tip }}
            />
          </div>

          <ol className="grid gap-14 pl-10 lg:grid-cols-3 lg:gap-12 lg:pl-0 lg:pt-14">
            {STEPS.map((step, i) => {
              const on = reached > i;
              return (
                <li
                  key={step.title}
                  className={cn(
                    "transition-[opacity,transform] duration-700 ease-out-soft",
                    on ? "opacity-100" : "translate-y-2 opacity-25"
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums transition-colors duration-500",
                      on ? "text-accent" : "text-muted"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-[clamp(1.5rem,2.3vw,2rem)] font-semibold leading-tight tracking-tightest text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[300px] text-base font-light leading-relaxed text-muted">
                    {step.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
