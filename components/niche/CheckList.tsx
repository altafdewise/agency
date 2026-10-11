"use client";

import { motion, type Variants } from "framer-motion";
import { FocusWords } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** A hairline that draws in from the left as its row arrives. */
function Hairline() {
  const instant = useSafeReducedMotion();
  const variants: Variants = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: instant ? { duration: 0 } : { duration: 1.3, ease: EASE_OUT } },
  };
  return <motion.span aria-hidden variants={variants} className="absolute inset-x-0 top-0 h-px origin-left bg-foreground/15" />;
}

/**
 * What customers look for, as numbered rows straight on the page (the same
 * box-less language as the home page's posts): the title focuses in, the
 * explanation sits beside it from sm up.
 */
export function CheckList({ items }: { items: { title: string; body: string }[] }) {
  const instant = useSafeReducedMotion();
  const fade: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: instant ? { duration: 0 } : { duration: 0.9, ease: EASE_OUT, delay: 0.35 } },
  };

  return (
    <ol className="mt-[clamp(3rem,8vh,5rem)] border-b border-foreground/15">
      {items.map((item, i) => (
        <motion.li
          key={item.title}
          className="relative grid gap-3 py-8 sm:grid-cols-[2.5rem_1fr_1fr] sm:items-baseline sm:gap-8 sm:py-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
        >
          <Hairline />
          <span className="font-mono text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-tightest text-foreground">
            <FocusWords text={item.title} />
          </h3>
          <motion.p variants={fade} className="text-base font-light leading-relaxed text-muted sm:text-lg">
            {item.body}
          </motion.p>
        </motion.li>
      ))}
    </ol>
  );
}
