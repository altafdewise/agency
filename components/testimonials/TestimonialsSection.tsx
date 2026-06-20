"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type Transition, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/testimonials";
import { TestimonialCard } from "./TestimonialCard";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const SWIPE_THRESHOLD = 48; // px of horizontal travel to count as a swipe

/** Shortest signed distance from `active` to `i` around a ring of `n`. */
function ringOffset(i: number, active: number, n: number): number {
  let off = i - active;
  if (off > n / 2) off -= n;
  if (off < -n / 2) off += n;
  return off;
}

type CardAnim = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  filter: string;
  rotate: number;
  rotateY: number;
  zIndex: number;
};

/**
 * Depth treatment per card. The active card is sharp, full-contrast and centred;
 * the cards behind it read as quiet DEPTH CUES — dimmed, blurred so the
 * text is illegible, scaled down and pushed back. Only the immediate neighbours
 * peek; everything further out is fully hidden, so the stack reads as a couple of
 * clean layers rather than overlapping duplicates.
 *
 * Desktop: one blurred layer peeking on each side. Mobile: a single soft sliver
 * of the next card peeking past the right edge — a hint of depth without clutter.
 */
function cardAnim(off: number, compact: boolean): CardAnim {
  if (off === 0) {
    return {
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      filter: "blur(0px)",
      rotate: 0,
      rotateY: 0,
      zIndex: 40,
    };
  }
  if (compact) {
    // Only the next card peeks, as a thin blurred sliver on the right.
    if (off === 1) {
      return {
        x: 34,
        y: 18,
        scale: 0.94,
        opacity: 0.22,
        filter: "blur(6px)",
        rotate: 0,
        rotateY: 0,
        zIndex: 25,
      };
    }
    return {
      x: 0,
      y: 24,
      scale: 0.9,
      opacity: 0,
      filter: "blur(8px)",
      rotate: 0,
      rotateY: 0,
      zIndex: 10,
    };
  }
  if (Math.abs(off) === 1) {
    return {
      x: off * 230,
      y: 28,
      scale: 0.86,
      opacity: 0.4,
      filter: "blur(6px)",
      rotate: off * 5,
      rotateY: off * -9,
      zIndex: 25,
    };
  }
  // Further-out cards stay fully hidden (no third/fourth visible layer).
  return {
    x: off * 280,
    y: 46,
    scale: 0.78,
    opacity: 0,
    filter: "blur(8px)",
    rotate: off * 7,
    rotateY: off * -12,
    zIndex: 10,
  };
}

export function TestimonialsSection() {
  const reduce = useReducedMotion();
  const count = TESTIMONIALS.length;

  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  // Below `lg`, keep only a single soft next-card peek for mobile/tablet depth.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = (dir: 1 | -1) => setActive((a) => (a + dir + count) % count);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);
    }
  };

  const transition: Transition = reduce
    ? { duration: 0 }
    : {
        type: "tween",
        duration: 0.5,
        ease: EASE_OUT,
        opacity: { duration: 0.42, ease: EASE_OUT },
        filter: { duration: 0.42, ease: EASE_OUT },
      };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      className="relative w-full overflow-hidden py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto w-full max-w-path px-6 sm:px-10">
        {/* Heading */}
        <div className="text-center">
          <p className="eyebrow">Testimonials</p>
          <h2 className="headline-md mt-4 text-balance">in their words</h2>
        </div>

        {/* Stacked-card carousel */}
        <div
          className="relative mx-auto mt-10 max-w-[1060px] select-none sm:mt-12 lg:mt-16"
          style={{ perspective: 1400 }}
          tabIndex={0}
          role="group"
          aria-label="Use the arrows or swipe to browse testimonials"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            else if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <div className="relative flex h-[306px] items-center justify-center sm:h-[340px] lg:h-[410px]">
            {TESTIMONIALS.map((t, i) => {
              const off = ringOffset(i, active, count);
              const isActive = off === 0;
              const anim = cardAnim(off, compact);

              return (
                <motion.div
                  key={t.id}
                  className="absolute inset-0 flex will-change-[transform,opacity,filter] items-center justify-center"
                  initial={false}
                  animate={anim}
                  transition={transition}
                  style={{
                    pointerEvents: isActive ? "auto" : "none",
                    transformOrigin:
                      off < 0 ? "right center" : off > 0 ? "left center" : "center",
                  }}
                >
                  <TestimonialCard
                    testimonial={t}
                    isActive={isActive}
                    activeAudioId={activeAudioId}
                    onPlayAudio={setActiveAudioId}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Navigation: looping arrows only, with no count/dots. */}
          <div className="mt-3 flex items-center justify-center gap-4 sm:mt-5 sm:gap-5">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="grid h-12 w-12 place-items-center rounded-full border border-foreground/[0.12] bg-background/70 text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.08),0_18px_50px_-32px_rgb(var(--foreground)/0.5)] backdrop-blur transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-background focus-visible:border-accent focus-visible:bg-accent focus-visible:text-background"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="grid h-12 w-12 place-items-center rounded-full border border-foreground/[0.12] bg-background/70 text-foreground shadow-[inset_0_1px_0_rgb(var(--foreground)/0.08),0_18px_50px_-32px_rgb(var(--foreground)/0.5)] backdrop-blur transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-background focus-visible:border-accent focus-visible:bg-accent focus-visible:text-background"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
