"use client";

import { motion } from "framer-motion";
import { LineReveal } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { BRAND, LOCATION } from "@/lib/site";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Google's keyless embed, centred on the office. Google doesn't offer a dark
// style for it, so the frame is inverted and hue-shifted back: dark streets,
// and the pin stays red.
const EMBED_SRC = `https://maps.google.com/maps?q=${LOCATION.lat},${LOCATION.lng}&z=16&hl=en&output=embed`;

/**
 * "Find us": a centred heading over a dark Google map you can pan and zoom.
 * On phones Google's embed moves with two fingers, so a one-finger scroll
 * still carries on down the page.
 */
export function LocationSection() {
  const instant = useSafeReducedMotion();

  return (
    <section
      aria-labelledby="location-heading"
      className="relative w-full px-6 py-[clamp(7rem,18vh,12rem)] sm:px-10"
    >
      <div className="mx-auto w-full max-w-path text-center">
        <p className="eyebrow">find us</p>
        <LineReveal
          id="location-heading"
          lines={["made in hyderabad"]}
          dot
          className="mt-5 font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-semibold leading-[1.02] tracking-tightest text-foreground"
        />

        <motion.div
          className="relative mt-[clamp(3rem,8vh,5rem)] aspect-[4/3] overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] sm:aspect-[2/1]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={instant ? { duration: 0 } : { duration: 1.1, ease: EASE_OUT }}
        >
          <iframe
            src={EMBED_SRC}
            title={`${BRAND.name} on Google Maps`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.8)_brightness(0.95)_contrast(0.92)]"
          />
          {/* Softens the map's edges into the page. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgb(var(--background)/0.9)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
