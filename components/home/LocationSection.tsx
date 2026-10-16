"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { LineReveal } from "@/components/ui/LineReveal";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { BRAND, LOCATION } from "@/lib/site";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Google's own pin marks the studio, so it stays on the spot when the map is
// panned or zoomed (a drawn-over marker can't follow a cross-origin map). The
// frame is inverted and hue-shifted back into a dark, nearly monochrome map;
// the hue shift keeps the pin red.
const EMBED_SRC = `https://maps.google.com/maps?q=${LOCATION.lat},${LOCATION.lng}&z=15&t=m&hl=en&output=embed`;
const DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${LOCATION.lat},${LOCATION.lng}`;

/**
 * "Find us": a centred heading over a wide, dark, monochrome map you can pan
 * and zoom (two fingers on phones, so a one-finger scroll carries on down
 * the page). Google's pin marks the studio; a thin glass bar along the
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
          className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.6)_contrast(1.2)_brightness(0.78)]"
        />

        {/* Vignette: the map melts into the card's edges. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(10,10,10,0.55)_75%,rgba(10,10,10,0.92)_100%)]"
        />

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
