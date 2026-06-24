"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.3 } as const;

/**
 * Closing CTA — the page finisher. Sits just above the footer and sends
 * visitors back up to the funnel (Section 2, #tap-funnel) to start a brief.
 *
 * `onStart` reuses the hero's existing smooth-scroll helper, so the scroll
 * target lives in exactly one place.
 *
 * Mobile gets a quiet warm-edge glow and a gradient headline; desktop (sm and
 * up) keeps the original calm, centred typographic layout untouched.
 */
export function ClosingCtaSection({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  const hidden = reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" };
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <section
      aria-label="Start your project"
      className="relative isolate w-full overflow-hidden py-24 sm:py-36 lg:py-44"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-path flex-col items-center px-6 text-center sm:px-10">
        <motion.p
          initial={hidden}
          whileInView={shown}
          viewport={VIEWPORT}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT }}
          className="eyebrow hidden sm:block"
        >
          Ready when you are
        </motion.p>

        <motion.h2
          initial={hidden}
          whileInView={shown}
          viewport={VIEWPORT}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT, delay: reduce ? 0 : 0.08 }}
          className="headline-md mt-5 text-balance bg-[linear-gradient(180deg,rgb(var(--foreground)),rgb(255_176_166))] bg-clip-text text-transparent sm:bg-none sm:text-foreground"
        >
          In an AI Era,
          <br />
          <span className="block whitespace-nowrap text-[clamp(1.5rem,6.6vw,3.5rem)]">
            Speed Is What Matters.
          </span>
        </motion.h2>

        <motion.p
          initial={hidden}
          whileInView={shown}
          viewport={VIEWPORT}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT, delay: reduce ? 0 : 0.16 }}
          className="mt-4 font-display text-sm font-light italic text-foreground/45 sm:mt-5 sm:text-xl sm:font-normal sm:text-foreground/55"
        >
          and we know that well.
        </motion.p>

        <motion.div
          initial={hidden}
          whileInView={shown}
          viewport={VIEWPORT}
          transition={{ duration: reduce ? 0 : 0.6, ease: EASE_OUT, delay: reduce ? 0 : 0.24 }}
          className="relative mt-10"
        >
          <Button
            type="button"
            variant="primary"
            size="md"
            withArrow
            onClick={onStart}
            className="min-h-[40px] px-5 text-[13px] sm:min-h-[48px] sm:px-7 sm:text-[0.95rem]"
          >
            Start Your Work Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
