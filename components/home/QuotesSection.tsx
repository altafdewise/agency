"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LineReveal } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Studio lines — edit freely. Each array is the line breaks of one quote.
const QUOTES = [
  ["we'd rather show you", "than tell you"],
  ["good work should", "feel obvious"],
];

const quoteType =
  "font-display text-[clamp(2.3rem,6vw,5.25rem)] font-semibold leading-[1.02] tracking-tightest text-foreground";

/**
 * A few studio lines with room to breathe, ending on the closing call to
 * action, which scrolls back up to the services wheel.
 */
export function QuotesSection({ onStart }: { onStart: () => void }) {
  const reduce = useSafeReducedMotion();

  return (
    <section aria-label="What we believe" className="relative w-full px-6 sm:px-10">
      <div className="mx-auto flex w-full max-w-path flex-col items-center text-center">
        <p className="eyebrow pt-[clamp(5rem,12vh,8rem)]">what we believe</p>

        {QUOTES.map((lines) => (
          <blockquote
            key={lines.join(" ")}
            className="flex min-h-[50svh] items-center justify-center py-[8vh] sm:min-h-[62svh]"
          >
            <LineReveal as="p" lines={lines} dot className={quoteType} />
          </blockquote>
        ))}

        <div className="flex min-h-[70svh] flex-col sm:min-h-[78svh] items-center justify-center py-[10vh]">
          <LineReveal
            as="h2"
            lines={["in an AI era,", "speed is what matters"]}
            dot
            className={quoteType}
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_OUT, delay: 0.5 }}
            className="mt-6 text-lg font-light text-muted sm:text-xl"
          >
            and we know that well.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={reduce ? { duration: 0 } : { duration: 0.7, ease: EASE_OUT, delay: 0.65 }}
            className="mt-12"
          >
            <Button type="button" size="lg" withArrow onClick={onStart}>
              start your project
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
