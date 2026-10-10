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

// Phones: a scene taller than the screen whose content is sticky, so it holds
// for half a screen of scrolling. Desktop: an ordinary, generous block.
const HOLD_TRACK = "relative h-[150svh] w-full sm:h-auto";
const HOLD_STAGE =
  "sticky top-0 flex h-[100svh] flex-col items-center justify-center sm:static sm:h-auto";

const quoteType =
  "font-display text-[clamp(2.3rem,6vw,5.25rem)] font-semibold leading-[1.02] tracking-tightest text-foreground";

/**
 * A few studio lines with room to breathe, ending on the closing call to
 * action, which scrolls back up to the services wheel. On phones each line
 * pins to the middle of the screen for a stretch of scrolling — a soft hold
 * under a finger that keeps moving — then the next one takes its place.
 */
export function QuotesSection({ onStart }: { onStart: () => void }) {
  const reduce = useSafeReducedMotion();

  return (
    <section aria-label="What we believe" className="relative w-full px-6 sm:px-10">
      <div className="mx-auto flex w-full max-w-path flex-col items-center text-center">
        {QUOTES.map((lines, i) => (
          <blockquote key={lines.join(" ")} className={HOLD_TRACK}>
            <div className={`${HOLD_STAGE} sm:min-h-[62svh] sm:py-[8vh]`}>
              {i === 0 && <p className="eyebrow mb-10 sm:mb-14">what we believe</p>}
              <LineReveal as="p" lines={lines} dot className={quoteType} />
            </div>
          </blockquote>
        ))}

        <div className={HOLD_TRACK}>
          <div className={`${HOLD_STAGE} sm:min-h-[78svh] sm:py-[10vh]`}>
            <LineReveal
              as="h2"
              lines={["in an AI era,", "speed is what matters"]}
              dot
              className={quoteType}
            />
            <motion.p
              initial={{ opacity: 0, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.8 }}
              transition={reduce ? { duration: 0 } : { duration: 1, ease: EASE_OUT, delay: 0.6 }}
              className="mt-6 text-lg font-light text-muted sm:text-xl"
            >
              and we know that well.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.8 }}
              transition={reduce ? { duration: 0 } : { duration: 1, ease: EASE_OUT, delay: 0.8 }}
              className="mt-12"
            >
              <Button type="button" size="lg" withArrow onClick={onStart}>
                start your project
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
