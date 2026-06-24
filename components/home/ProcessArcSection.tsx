"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

/* Calm, premium ease-out — matches the site's motion language (see Reveal). */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type ProcessStep = {
  num: string;
  title: string;
  body: string;
};

const STEPS: ProcessStep[] = [
  {
    num: "01",
    title: "tell us what you need",
    body: "A quick conversation or a short brief — whatever's easiest for you.",
  },
  {
    num: "02",
    title: "we scope it",
    body: "A clear plan, timeline, and price — agreed before anything starts.",
  },
  {
    num: "03",
    title: "we build",
    body: "Design and development, kept moving and fully transparent.",
  },
  {
    num: "04",
    title: "you launch",
    body: "We ship it, fast — and you're live.",
  },
];

/**
 * How each big number sits relative to the active one. The active number is
 * upright, full-opacity and centred; neighbours slide up/down along a gentle
 * arc (bowing left), tilt away, shrink and fade — peeking above and below.
 */
function numberAnim(offset: number, compact: boolean) {
  const span = compact ? 96 : 150; // vertical gap between steps
  const bow = compact ? 16 : 30; // leftward arc shift per step away
  const abs = Math.abs(offset);

  if (offset === 0) {
    return { y: 0, x: 0, rotate: 0, scale: 1, opacity: 1 };
  }
  return {
    y: offset * span,
    x: -abs * bow,
    rotate: (offset < 0 ? 1 : -1) * (6 + (abs - 1) * 4),
    scale: abs === 1 ? 0.6 : 0.5,
    opacity: abs === 1 ? 0.16 : abs === 2 ? 0.07 : 0,
  };
}

/* Faint background arc with a dot-marker per step (active marker = accent). */
function Arc({ active }: { active: number }) {
  // viewBox is fixed; the element scales uniformly (meet) so dots stay round.
  const H = 420;
  const fracs = [0.14, 0.38, 0.62, 0.86];
  const dotX = (f: number) => 28 + 48 * (1 - f) * f;

  return (
    <svg
      aria-hidden
      viewBox="0 0 56 420"
      preserveAspectRatio="xMidYMid meet"
      className="h-[240px] w-10 shrink-0 sm:h-[420px] sm:w-14"
    >
      <path
        d="M 28 0 Q 52 210 28 420"
        fill="none"
        stroke="rgb(var(--foreground) / 0.14)"
        strokeWidth="1.5"
      />
      {fracs.map((f, i) => {
        const isActive = i === active;
        return (
          <circle
            key={i}
            cx={dotX(f)}
            cy={f * H}
            r={isActive ? 6 : 4}
            fill={
              isActive ? "rgb(var(--accent))" : "rgb(var(--foreground) / 0.28)"
            }
            style={
              isActive
                ? { filter: "drop-shadow(0 0 8px rgb(var(--accent) / 0.55))" }
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}

/* Header — eyebrow + Playfair-style display heading, centred. */
function Header() {
  return (
    <div className="text-center">
      <p className="eyebrow">How it works</p>
      <h2
        id="process-heading"
        className="mt-4 text-balance font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.02] tracking-tight text-foreground"
      >
        from hello to launch.
      </h2>
    </div>
  );
}

export function ProcessArcSection() {
  const reduce = Boolean(useReducedMotion());
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);

  // Smaller numbers + tighter arc on narrow screens.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Scroll progress over the tall container → discrete active step. A plain
  // scroll listener (reading the track's position) drives React state; the
  // numbers then animate via their `animate` prop on each change. We avoid
  // scroll-linked transforms bound to style (no WAAPI scroll animation).
  useEffect(() => {
    if (reduce) return;
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      const idx = Math.min(
        STEPS.length - 1,
        Math.max(0, Math.floor(progress * STEPS.length))
      );
      setActive((prev) => (prev === idx ? prev : idx));
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [reduce]);

  const transition: Transition = { duration: 0.5, ease: EASE_OUT };

  // ── Reduced motion: a static, fully readable list (no scroll mechanic). ──
  if (reduce) {
    return (
      <section
        id="process"
        aria-labelledby="process-heading"
        className="relative w-full overflow-hidden py-20 sm:py-24 lg:py-32"
      >
        <div className="mx-auto w-full max-w-2xl px-6 sm:px-10">
          <Header />
          <ol className="mt-14 space-y-10">
            {STEPS.map((step) => (
              <li key={step.num} className="flex items-baseline gap-5">
                <span className="font-display text-4xl font-bold leading-none tabular-nums text-foreground/70">
                  {step.num}
                </span>
                <div>
                  <h3 className="font-display text-2xl font-semibold leading-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-sm font-sans text-base font-light leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  // ── Scroll-driven curved-arc version ──
  return (
    <section id="process" aria-labelledby="process-heading" className="relative w-full">
      {/* Tall track: the sticky stage stays pinned while we scrub the 4 steps. */}
      <div ref={containerRef} className="relative h-[340vh]">
        <div className="sticky top-0 flex h-[100svh] w-full flex-col overflow-hidden">
          <div className="mx-auto w-full max-w-path px-6 pt-20 sm:px-10 sm:pt-24">
            <Header />
          </div>

          {/* Stage: arc · numbers · active title/description. On mobile the
              copy stacks beneath the arc+number pair so it has room to breathe. */}
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="flex flex-col items-center gap-12 sm:flex-row sm:justify-center sm:gap-10">
              <div className="flex items-center gap-5 sm:gap-10">
                <Arc active={active} />

                {/* Number wheel — vertical fade so peeks dissolve at the edges. */}
                <div
                  className="relative h-[240px] w-[132px] overflow-hidden sm:h-[420px] sm:w-[210px]"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to bottom, transparent, #000 24%, #000 76%, transparent)",
                    maskImage:
                      "linear-gradient(to bottom, transparent, #000 24%, #000 76%, transparent)",
                  }}
                >
                  {STEPS.map((step, i) => (
                    <motion.span
                      key={step.num}
                      aria-hidden
                      className="absolute inset-0 grid place-items-center font-display font-bold leading-none tabular-nums text-foreground [font-size:clamp(4rem,13vw,8.5rem)] will-change-transform"
                      initial={false}
                      animate={numberAnim(i - active, compact)}
                      transition={transition}
                    >
                      {step.num}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Active step copy (keyed so it fades in on each change). */}
              <div className="relative min-h-[96px] w-[260px] text-center sm:min-h-[120px] sm:w-[300px] sm:text-left">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={transition}
                >
                  <h3 className="font-display text-2xl font-semibold leading-tight text-foreground sm:text-[2rem]">
                    {STEPS[active].title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-[260px] font-sans text-[0.95rem] font-light leading-relaxed text-muted sm:mx-0 sm:text-base">
                    {STEPS[active].body}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full step list for assistive tech (the visual shows one at a time). */}
      <ol className="sr-only">
        {STEPS.map((step) => (
          <li key={step.num}>
            {step.num}. {step.title} — {step.body}
          </li>
        ))}
      </ol>
    </section>
  );
}
