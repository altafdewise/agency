"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LineReveal } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { BRAND, LOCATION } from "@/lib/site";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Google's keyless embed, centred on the office. Google doesn't offer a dark
// style for it, so the frame is inverted and hue-shifted back: dark streets,
// and the pin stays red.
const EMBED_SRC = `https://maps.google.com/maps?q=${LOCATION.lat},${LOCATION.lng}&z=16&hl=en&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;

const linkClass =
  "inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 hover:text-foreground";

/**
 * "Find us": the office address, directions, and a dark Google map. On phones
 * the map is a picture that opens Google Maps, so scrolling past it never gets
 * caught in the map; from sm up it can be panned and zoomed.
 */
export function LocationSection() {
  const instant = useSafeReducedMotion();

  return (
    <section
      aria-labelledby="location-heading"
      className="relative w-full px-6 py-[clamp(7rem,18vh,12rem)] sm:px-10"
    >
      <div className="mx-auto w-full max-w-path">
        <p className="eyebrow">find us</p>
        <LineReveal
          id="location-heading"
          lines={["made in hyderabad"]}
          dot
          className="mt-5 font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-semibold leading-[1.02] tracking-tightest text-foreground"
        />

        <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <address className="max-w-md text-base font-light not-italic leading-relaxed text-muted sm:text-lg">
            {LOCATION.building},
            <br />
            {LOCATION.street},
            <br />
            {LOCATION.area}, {LOCATION.city} {LOCATION.postalCode}
          </address>
          <div className="flex shrink-0 gap-6">
            <a href={DIRECTIONS} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-foreground`}>
              get directions
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </a>
            <a href={LOCATION.mapsUrl} target="_blank" rel="noopener noreferrer" className={`${linkClass} text-muted`}>
              open in google maps
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </a>
          </div>
        </div>

        <motion.div
          className="relative mt-12 aspect-[4/3] overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] sm:aspect-[2/1]"
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
            tabIndex={-1}
            className="pointer-events-none absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.8)_brightness(0.95)_contrast(0.92)] sm:pointer-events-auto"
          />
          {/* Softens the map's edges into the page. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_60px_rgb(var(--background)/0.9)]"
          />
          <a
            href={LOCATION.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open our office in Google Maps"
            className="absolute inset-0 sm:hidden"
          />
        </motion.div>
      </div>
    </section>
  );
}
