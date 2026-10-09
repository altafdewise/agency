"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Logo, { LOGO_GEOMETRY } from "@/components/Logo";
import { usePath } from "@/components/PathProvider";
import { OtherInput } from "@/components/ui/OtherInput";
import { StepShell } from "@/components/ui/StepShell";
import { ServiceList } from "@/components/steps/ServiceList";
import { SERVICES } from "@/lib/content";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { cn } from "@/lib/cn";

/* ── "The dot leads" ─────────────────────────────────────────────────────────
   One pinned scene. The headline lifts away line by line while the red dot of
   the 7. drops to a selector line; the services then glide through that line
   like a type wheel — the one nearest the dot is in focus. Choosing a service
   hands the same dot to the funnel's progress rail (see <Progress>). */

const N = SERVICES.length;
const OTHER_INDEX = SERVICES.findIndex((s) => s.key === "other");

// Scroll budget per phase, in viewport heights.
const INTRO_HOLD = 0.12;
const HANDOFF = 0.6;
const PER_SERVICE = 0.24;
const TAIL = 0.3;
const SCROLL_VH = INTRO_HOLD + HANDOFF + (N - 1) * PER_SERVICE + TAIL;
const P_HANDOFF = INTRO_HOLD / SCROLL_VH;
const P_WHEEL = (INTRO_HOLD + HANDOFF) / SCROLL_VH;
const P_WHEEL_END = (INTRO_HOLD + HANDOFF + (N - 1) * PER_SERVICE) / SCROLL_VH;

/** Scroll target that lands exactly on the first service (closing CTA). */
export const SERVICES_ANCHOR_ID = "services";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface Geometry {
  from: { x: number; y: number; size: number };
  to: { x: number; y: number };
}

interface HeroServicesProps {
  onChoose: (key: string) => void;
  showOther: boolean;
  other: string;
  setOther: (value: string) => void;
  submitOther: () => void;
}

export function HeroServices(props: HeroServicesProps) {
  const reduce = useSafeReducedMotion();
  return reduce ? <StaticHero {...props} /> : <PinnedHero {...props} />;
}

/* Reduced motion: the same content as a calm, static page. */
function StaticHero({ onChoose, showOther, other, setOther, submitOther }: HeroServicesProps) {
  const { step } = usePath();
  return (
    <section id="tap-funnel" aria-label="What brings you here?">
      <StepShell>
        <div className="flex flex-col items-center text-center">
          <div style={{ width: "clamp(72px, 9vw, 112px)" }}>
            <Logo guideSource guideReleased={step > 0} />
          </div>
          <h1 className="mt-10 font-display text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.98] tracking-tightest">
            no fluff.
            <br />
            just build.
          </h1>
          <p id={SERVICES_ANCHOR_ID} className="mt-8 body-muted">
            what brings you here?
          </p>
        </div>
        <ServiceList onChoose={onChoose} showOther={showOther} />
        {showOther && <OtherInput value={other} onChange={setOther} onSubmit={submitOther} />}
      </StepShell>
    </section>
  );
}

function PinnedHero({ onChoose, showOther, other, setOther, submitOther }: HeroServicesProps) {
  const { step } = usePath();
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLSpanElement>(null);

  // Read through a ref inside transforms so they never see stale geometry.
  const geoRef = useRef<Geometry | null>(null);
  const geoVersion = useMotionValue(0);
  const [measured, setMeasured] = useState(false);
  const [focused, setFocused] = useState(0);

  const scrollYProgress = useScrollProgress(trackRef, ["start start", "end end"]);
  const handoff = useTransform(scrollYProgress, [P_HANDOFF, P_WHEEL], [0, 1], { clamp: true });
  const wheelRaw = useTransform(scrollYProgress, [P_WHEEL, P_WHEEL_END], [0, N - 1], {
    clamp: true,
  });
  // Detents: the curve flattens at every whole number, so the wheel dwells on
  // each service and moves briskly between them — without hijacking scroll.
  const wheelDetent = useTransform(wheelRaw, (v) => v - Math.sin(2 * Math.PI * v) / (2 * Math.PI));
  const wheel = useSpring(wheelDetent, { stiffness: 300, damping: 40, mass: 0.6, restDelta: 0.0005 });

  useMotionValueEvent(wheel, "change", (w) => {
    const next = Math.round(w);
    setFocused((prev) => (prev === next ? prev : next));
  });

  // Headline + mark exit.
  const line1Y = useTransform(handoff, [0, 0.42], ["0%", "-112%"]);
  const line2Y = useTransform(handoff, [0.08, 0.5], ["0%", "-112%"]);
  const markOpacity = useTransform(handoff, [0, 0.3], [1, 0]);
  const markY = useTransform(handoff, [0, 0.3], [0, -24]);
  const cueOpacity = useTransform(scrollYProgress, [0, P_HANDOFF * 0.8], [1, 0]);

  // Services entrance.
  const servicesOpacity = useTransform(handoff, [0.5, 0.9], [0, 1]);
  const labelY = useTransform(handoff, [0.5, 0.95], [28, 0]);
  const wheelEnterY = useTransform(handoff, [0.42, 1], [140, 0]);

  // The dot: logo → selector (with a small hop), then a soft tick per service.
  const dotX = useTransform([handoff, geoVersion] as MotionValue<number>[], ([h]: number[]) => {
    const g = geoRef.current;
    if (!g) return 0;
    const u = easeInOut(clamp01((h - 0.1) / 0.72));
    return g.from.x + (g.to.x - g.from.x) * u;
  });
  const dotY = useTransform([handoff, geoVersion] as MotionValue<number>[], ([h]: number[]) => {
    const g = geoRef.current;
    if (!g) return 0;
    const u = easeInOut(clamp01((h - 0.1) / 0.72));
    const hop = Math.sin(Math.PI * u) * Math.min(90, g.to.y * 0.18);
    return g.from.y + (g.to.y - g.from.y) * u - hop;
  });
  const dotScale = useTransform([handoff, wheel, geoVersion] as MotionValue<number>[], ([h, w]: number[]) => {
    const g = geoRef.current;
    const start = g ? g.from.size / DOT_SIZE : 1.6;
    const u = easeInOut(clamp01((h - 0.1) / 0.72));
    const travel = start + (1 - start) * u;
    const tick = h >= 1 ? 1 - 0.32 * Math.sin(Math.PI * (w - Math.floor(w))) : 1;
    return travel * tick;
  });

  useEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const logo = logoRef.current;
      const selector = selectorRef.current;
      if (!stage || !logo || !selector) return;
      const s = stage.getBoundingClientRect();
      const l = logo.getBoundingClientRect();
      const t = selector.getBoundingClientRect();
      geoRef.current = {
        from: {
          x: l.left - s.left + l.width * LOGO_GEOMETRY.DOT_CX,
          y: l.top - s.top + l.height * LOGO_GEOMETRY.DOT_CY,
          size: l.width * LOGO_GEOMETRY.DOT_R * 2,
        },
        to: { x: t.left - s.left + t.width / 2, y: t.top - s.top + t.height / 2 },
      };
      geoVersion.set(geoVersion.get() + 1); // re-run the dot transforms
      setMeasured(true);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    if (introRef.current) ro.observe(introRef.current);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [geoVersion]);

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const scrollable = track.offsetHeight - window.innerHeight;
    const p = P_WHEEL + (index / (N - 1)) * (P_WHEEL_END - P_WHEEL);
    window.scrollTo({ top: top + scrollable * p, behavior: "smooth" });
  };

  const choose = (key: string, index: number) => {
    if (key === "other") scrollToIndex(index);
    onChoose(key);
  };

  return (
    <section
      ref={trackRef}
      id="tap-funnel"
      aria-label="What brings you here?"
      className="relative"
      style={{ height: `${(1 + SCROLL_VH) * 100}svh` }}
    >
      <div
        id={SERVICES_ANCHOR_ID}
        aria-hidden
        className="pointer-events-none absolute left-0 h-px w-px"
        style={{ top: `${(INTRO_HOLD + HANDOFF) * 100}svh` }}
      />

      <div ref={stageRef} className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* ── Intro: the mark and the headline ── */}
        <div
          ref={introRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-[4svh] text-center"
        >
          <div
            ref={logoRef}
            className="relative"
            style={{
              width: "clamp(68px, min(8.4vw, 13svh), 116px)",
              aspectRatio: `${LOGO_GEOMETRY.BOX_ASPECT}`,
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ opacity: markOpacity, y: markY }}
              aria-hidden
            >
              <motion.div
                className="absolute inset-0 bg-foreground"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE_OUT }}
                style={{
                  WebkitMaskImage: "url(/Logo/logo-mark.png)",
                  maskImage: "url(/Logo/logo-mark.png)",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </motion.div>
          </div>

          <h1
            aria-label="no fluff. just build."
            className="mt-[clamp(1.75rem,5svh,3.5rem)] font-display text-[clamp(3.1rem,min(10.5vw,15svh),9.25rem)] font-semibold leading-[0.98] tracking-tightest text-foreground"
          >
            {["no fluff.", "just build."].map((line, i) => (
              <span key={line} aria-hidden className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                <motion.span className="block" style={{ y: i === 0 ? line1Y : line2Y }}>
                  <motion.span
                    className="block"
                    initial={{ y: "112%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, ease: EASE_OUT, delay: 0.15 + i * 0.1 }}
                  >
                    {line}
                  </motion.span>
                </motion.span>
              </span>
            ))}
          </h1>
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-[max(1.75rem,4svh)] flex flex-col items-center gap-3"
          style={{ opacity: cueOpacity }}
          aria-hidden
        >
          <span className="text-[0.65rem] font-medium uppercase tracking-eyebrow text-muted">
            scroll
          </span>
          <span className="relative h-10 w-px overflow-hidden bg-foreground/15">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-foreground" />
          </span>
        </motion.div>

        {/* ── Services: label + the type wheel ── */}
        <div className="absolute inset-0 mx-auto flex w-full max-w-path flex-col px-6 sm:px-10 lg:grid lg:grid-cols-[minmax(220px,0.62fr)_1.38fr] lg:gap-16">
          <motion.div
            className="pt-[max(6.5rem,15svh)] lg:flex lg:items-center lg:pt-0"
            style={{ opacity: servicesOpacity, y: labelY }}
          >
            <div>
              <p className="eyebrow">start here</p>
              <h2 className="mt-4 font-display text-[clamp(1.9rem,3.2vw,3rem)] font-semibold leading-[1.04] tracking-tightest text-foreground lg:mt-5">
                what brings
                <br className="hidden lg:block" /> you here?
              </h2>
              <p className="mt-6 hidden font-mono text-xs tabular-nums text-muted lg:block">
                <span className="text-foreground">{String(focused + 1).padStart(2, "0")}</span>
                <span className="text-muted/60"> / {String(N).padStart(2, "0")}</span>
              </p>
            </div>
          </motion.div>

          <div className="relative min-h-0 flex-1 [--row:96px] lg:h-full lg:[--row:clamp(88px,7vw,112px)]">
            {/* The selector line the dot settles on (measured, never seen). */}
            <span
              ref={selectorRef}
              aria-hidden
              className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
            />

          <motion.div
            className="absolute inset-0"
            style={{ opacity: servicesOpacity, y: wheelEnterY }}
          >
            <div
              className="absolute inset-0"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%)",
              }}
            >
              <ul className="absolute inset-0">
                {SERVICES.map((service, index) => (
                  <WheelRow
                    key={service.key}
                    index={index}
                    title={service.short ?? service.title}
                    subtitle={service.brief ?? service.blurb}
                    wheel={wheel}
                    focused={focused === index}
                    reachable={Math.abs(focused - index) <= 2}
                    selected={service.key === "other" && showOther}
                    onChoose={() => choose(service.key, index)}
                    onKeyboardFocus={() => scrollToIndex(index)}
                  />
                ))}
              </ul>
            </div>

            {showOther && (
              <motion.div
                className="absolute left-16 right-0 top-[calc(50%+var(--row)*0.95)] sm:left-[5.5rem] [&>div]:mx-0 [&>div]:mt-0 [&>div]:max-w-[520px]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: focused === OTHER_INDEX ? 1 : 0, y: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                style={{ pointerEvents: focused === OTHER_INDEX ? "auto" : "none" }}
              >
                <OtherInput value={other} onChange={setOther} onSubmit={submitOther} />
              </motion.div>
            )}
          </motion.div>
          </div>
        </div>

        {/* ── The dot ── */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0"
          style={{ x: dotX, y: dotY, opacity: measured && step === 0 ? 1 : 0 }}
        >
          <motion.span
            className="block rounded-full bg-accent"
            data-guiding-dot-source="true"
            style={{
              width: DOT_SIZE,
              height: DOT_SIZE,
              marginLeft: -DOT_SIZE / 2,
              marginTop: -DOT_SIZE / 2,
              scale: dotScale,
            }}
          >
            <motion.span
              className="block h-full w-full rounded-full bg-accent"
              initial={{ scale: 0 }}
              animate={{ scale: measured ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.55 }}
            />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

const DOT_SIZE = 14;

function WheelRow({
  index,
  title,
  subtitle,
  wheel,
  focused,
  reachable,
  selected,
  onChoose,
  onKeyboardFocus,
}: {
  index: number;
  title: string;
  subtitle?: string;
  wheel: MotionValue<number>;
  focused: boolean;
  reachable: boolean;
  selected: boolean;
  onChoose: () => void;
  onKeyboardFocus: () => void;
}) {
  const y = useTransform(wheel, (w) => `calc(${(index - w).toFixed(4)} * var(--row) - 50%)`);
  const distance = useTransform(wheel, (w) => Math.abs(index - w));
  const opacity = useTransform(distance, (d) => 0.09 + 0.91 * Math.exp(-2.6 * d * d));
  const x = useTransform(distance, (d) => (1 - Math.min(d, 1)) * 10);
  const subtitleOpacity = useTransform(distance, (d) => clamp01(1 - d * 2.4));

  return (
    <motion.li
      className={cn(
        "absolute inset-x-0 top-1/2 pl-8 will-change-transform hover:!opacity-100 focus-within:!opacity-100 sm:pl-12",
        !reachable && "pointer-events-none"
      )}
      style={{ y, opacity, x }}
    >
      <button
        type="button"
        onClick={onChoose}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && onKeyboardFocus()}
        aria-pressed={selected || undefined}
        className="group flex items-baseline gap-3 text-left sm:gap-5"
      >
        <span
          className={cn(
            "w-5 shrink-0 font-mono text-[0.7rem] tabular-nums transition-colors duration-300",
            focused || selected ? "text-accent" : "text-muted"
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="whitespace-nowrap font-display text-[clamp(1.5rem,6.6vw,2.25rem)] font-semibold leading-none tracking-tightest text-foreground lg:text-[clamp(2rem,3.3vw,3.1rem)]">
          {title}
        </span>
      </button>
      {subtitle && (
        <motion.p
          aria-hidden
          className="pointer-events-none absolute left-16 right-4 top-full mt-2.5 max-w-md text-[0.95rem] font-light leading-snug text-muted sm:left-[5.5rem] lg:mt-3 lg:text-base"
          style={{ opacity: subtitleOpacity }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.li>
  );
}
