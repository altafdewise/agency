"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LineReveal } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { BRAND, LOCATION } from "@/lib/site";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Centred on the studio without Google's own pin (ll, not q): the red dot
// drawn over the middle is the marker. The frame is greyscaled and inverted
// into a near-black monochrome map that sits in the dark page.
const EMBED_SRC = `https://maps.google.com/maps?ll=${LOCATION.lat},${LOCATION.lng}&z=15&t=m&hl=en&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;

/**
 * "Find us": a centred heading over a wide, dark, monochrome map you can pan
 * and zoom (two fingers on phones, so a one-finger scroll carries on down
 * the page). A pulsing red dot marks the studio; a thin glass bar along the
 * bottom names the area and opens directions.
 */
export function LocationSection() {
  const instant = useSafeReducedMotion();

  return (
    <section
      aria-labelledby="location-heading"
      className="relative w-full px-4 py-[clamp(7rem,18vh,12rem)] sm:px-10"
    >
      <div className="mx-auto w-full max-w-path text-center">
        <p className="eyebrow">find us</p>
        <LineReveal
          id="location-heading"
          lines={["made in hyderabad"]}
          dot
          className="mt-5 font-display text-[clamp(2.4rem,5.4vw,4.75rem)] font-semibold leading-[1.02] tracking-tightest text-foreground"
        />
      </div>

      <motion.div
        className="relative mx-auto mt-[clamp(3rem,8vh,5rem)] aspect-[4/5] w-full max-w-6xl overflow-hidden rounded-[28px] border border-foreground/10 bg-[#0d0d0d] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:aspect-[16/9] lg:aspect-[21/9]"
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={instant ? { duration: 0 } : { duration: 1.2, ease: EASE_OUT }}
      >
        <iframe
          src={EMBED_SRC}
          title={`${BRAND.name} on Google Maps`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 [filter:grayscale(1)_invert(0.93)_contrast(1.18)_brightness(0.78)]"
        />

        {/* Vignette: the map melts into the card's edges. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,10,10,0.55)_75%,rgba(10,10,10,0.92)_100%)]"
        />

        {/* The studio: a red dot with a soft pulse, and its name above. */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 motion-safe:animate-ping" />
          <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/25" />
          <span className="relative block h-3.5 w-3.5 rounded-full bg-accent shadow-[0_0_24px_6px_rgb(var(--accent)/0.55)] ring-2 ring-black/60" />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground backdrop-blur-md">
            {BRAND.name}
          </span>
        </div>

        {/* Glass bar */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/55 py-2.5 pl-4 pr-2.5 backdrop-blur-md sm:inset-x-5 sm:bottom-5 sm:py-3 sm:pl-5 sm:pr-3">
          <span className="min-w-0 truncate text-left">
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Studio</span>
            <span className="block text-sm font-medium text-foreground sm:text-[15px]">
              {LOCATION.area}, {LOCATION.city}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <a
              href={LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center rounded-full px-4 text-[13px] font-medium text-muted transition-colors hover:text-foreground sm:inline-flex"
            >
              Open in Maps
            </a>
            <a
              href={DIRECTIONS}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-[13px] font-medium text-background transition-[filter] hover:brightness-110"
            >
              Directions <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </a>
          </span>
        </div>
      </motion.div>
    </section>
  );
}
