"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { FAQS } from "@/lib/faqs";
import { mailtoHref } from "@/lib/contact";

/* Calm, premium ease-out — the site's shared motion language (see Reveal). */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Homepage FAQ — a numbered, single-open accordion. The open row lifts into a
 * more prominent card (lighter surface, accent border, soft shadow) while the
 * closed rows dim back, mirroring the reference layout in the site's own dark
 * theme. The "+" toggle rotates 45° into a "×" on open.
 */
export function FaqSection() {
  const reduce = Boolean(useReducedMotion());
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative w-full overflow-hidden py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-path px-6 sm:px-10">
        {/* Header */}
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">FAQs</p>
          <h2 id="faq-heading" className="headline-md mt-4 text-balance">
            common questions.
          </h2>
        </div>

        {/* Accordion list */}
        <div className="mx-auto mt-12 max-w-2xl space-y-3 sm:mt-14">
          {FAQS.map((faq, i) => {
            const isOpen = i === open;
            const dimmed = open !== null && !isOpen;
            const num = String(i + 1).padStart(2, "0");

            return (
              // Outer wrapper carries the scroll-in entrance only — keeping the
              // dim opacity on a separate inner element so framer's inline
              // opacity (entrance) and the dim class never fight.
              <motion.div
                key={faq.q}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: reduce ? 0 : 0.5,
                  ease: EASE,
                  delay: reduce ? 0 : i * 0.05,
                }}
              >
                {/* Dim closed rows while another is open — driven via framer's
                    inline opacity (not a Tailwind class) so it's deterministic
                    and never depends on a dynamically-toggled arbitrary value. */}
                <motion.div
                  initial={false}
                  animate={{ opacity: dimmed ? 0.45 : 1 }}
                  transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-[background-color,border-color,box-shadow] duration-300 ease-out-soft",
                    isOpen
                      ? "border-accent/40 bg-foreground/[0.04] shadow-card-hover"
                      : "border-foreground/[0.08] bg-foreground/[0.015]"
                  )}
                >
                  {/* Trigger row */}
                  <h3>
                    <button
                      type="button"
                      id={`faq-trigger-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center gap-3 px-4 py-4 text-left sm:gap-5 sm:px-7 sm:py-6"
                    >
                      <span className="w-6 shrink-0 font-mono text-[0.7rem] tabular-nums text-muted/70 sm:w-8 sm:text-xs">
                        {num}
                      </span>
                      <span className="flex-1 font-sans text-sm font-medium leading-snug text-foreground sm:text-lg">
                        {faq.q}
                      </span>
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors duration-300 sm:h-9 sm:w-9",
                          isOpen
                            ? "border-accent/40 bg-accent/[0.1] text-accent"
                            : "border-foreground/[0.1] bg-foreground/[0.03] text-foreground"
                        )}
                      >
                        <Plus
                          className={cn(
                            "h-4 w-4 transition-transform duration-300 ease-out-soft sm:h-[18px] sm:w-[18px]",
                            isOpen && "rotate-45"
                          )}
                          strokeWidth={1.5}
                        />
                      </span>
                    </button>
                  </h3>

                  {/* Answer panel — height + fade, aligned under the question. */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="panel"
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${i}`}
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 pl-[52px] pr-4 font-sans text-[0.85rem] font-light leading-relaxed text-muted sm:pb-6 sm:pl-20 sm:pr-7 sm:text-[0.95rem]">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom contact prompt */}
        <div className="mt-12 flex flex-col items-center gap-4 text-center sm:mt-14">
          <p className="font-sans text-base font-light text-muted">
            have another question?
          </p>
          {/* Routes to the shared contact action (mailto) — same as the nav and
              footer. Swap to whatsappHref() or CONTACT.cal once those env-driven
              placeholders are live. */}
          <a
            href={mailtoHref("Question for maggie")}
            className="group inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-foreground/[0.14] bg-foreground/[0.02] px-6 py-2.5 text-sm font-medium text-foreground transition-[transform,background-color,border-color] duration-200 hover:border-accent/50 hover:bg-accent/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 active:scale-[0.98]"
          >
            contact us
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.8}
            />
          </a>
        </div>
      </div>
    </section>
  );
}
