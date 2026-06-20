"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

const IMPACT_STAT = {
  label: "THE IMPACT",
  value: 62,
  suffix: "%",
  copy: "our clients see up to 62% more output after we step in.",
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const WAVE_DOTS = [
  { cx: 132, cy: 254, r: 5.5, opacity: 0.58 },
  { cx: 298, cy: 236, r: 4.5, opacity: 0.74 },
  { cx: 486, cy: 196, r: 5, opacity: 0.5 },
  { cx: 686, cy: 150, r: 4.5, opacity: 0.82 },
  { cx: 894, cy: 94, r: 5.5, opacity: 0.6 },
];

export function ImpactStatSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [hasEntered, setHasEntered] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  const contentVisible = reduce || hasEntered;

  useEffect(() => {
    if (reduce) {
      setHasEntered(true);
      return;
    }

    if (hasEntered) return;

    const node = sectionRef.current;
    if (!node) return;

    const markIfVisible = () => {
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const visibleHeight =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
      const triggerHeight = Math.min(rect.height, viewportHeight) * 0.28;

      if (visibleHeight >= triggerHeight) {
        setHasEntered(true);
      }
    };

    markIfVisible();

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEntered(true);
        }
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: [0, 0.18, 0.42],
      }
    );

    observer.observe(node);
    window.addEventListener("scroll", markIfVisible, { passive: true });
    window.addEventListener("resize", markIfVisible);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", markIfVisible);
      window.removeEventListener("resize", markIfVisible);
    };
  }, [hasEntered, reduce]);

  useEffect(() => {
    if (reduce) {
      setDisplayValue(IMPACT_STAT.value);
      return;
    }

    if (!hasEntered) return;

    const controls = animate(0, IMPACT_STAT.value, {
      duration: 1.8,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [hasEntered, reduce]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="impact-stat-heading"
      className="relative isolate w-full overflow-hidden py-20 sm:py-24 lg:py-32"
    >
      <motion.div
        initial={false}
        animate={
          contentVisible
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 28, filter: "blur(10px)" }
        }
        transition={{ duration: reduce ? 0 : 0.7, ease: EASE_OUT }}
        className="relative mx-auto flex w-full max-w-path flex-col items-center px-6 text-center sm:px-10"
      >
        <p className="eyebrow">{IMPACT_STAT.label}</p>
        <h2
          id="impact-stat-heading"
          className="mx-auto mt-4 max-w-2xl font-sans text-lg font-light leading-relaxed text-foreground/68 sm:text-xl"
        >
          {IMPACT_STAT.copy}
        </h2>

        <div className="relative mt-8 grid min-h-[240px] w-full place-items-center sm:mt-10 sm:min-h-[320px] lg:min-h-[430px]">
          <svg
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[min(72vw,460px)] w-[min(1160px,124vw)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
            viewBox="0 0 1000 360"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient
                id="impact-wave-gradient"
                x1="24"
                y1="226"
                x2="976"
                y2="126"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#F2EEE3" stopOpacity="0.18" />
                <stop offset="0.35" stopColor="#FF4438" stopOpacity="0.72" />
                <stop offset="0.72" stopColor="#FF4438" stopOpacity="0.42" />
                <stop offset="1" stopColor="#F2EEE3" stopOpacity="0.16" />
              </linearGradient>
              <linearGradient
                id="impact-area-gradient"
                x1="0"
                y1="62"
                x2="0"
                y2="330"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FF4438" stopOpacity="0.12" />
                <stop offset="0.48" stopColor="#FF4438" stopOpacity="0.045" />
                <stop offset="1" stopColor="#FF4438" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="impact-area-edge-gradient"
                x1="0"
                y1="0"
                x2="1000"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="0.08" stopColor="white" stopOpacity="1" />
                <stop offset="0.9" stopColor="white" stopOpacity="1" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <clipPath id="impact-area-reveal">
                <motion.rect
                  x="0"
                  y="0"
                  height="360"
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: contentVisible ? 1000 : 0 }}
                  transition={{ duration: reduce ? 0 : 1.65, ease: EASE_OUT }}
                />
              </clipPath>
              <mask
                id="impact-area-soft-mask"
                x="0"
                y="0"
                width="1000"
                height="360"
                maskUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="1000"
                  height="360"
                  fill="url(#impact-area-edge-gradient)"
                />
              </mask>
              <filter
                id="impact-wave-glow"
                x="-10%"
                y="-40%"
                width="120%"
                height="180%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feColorMatrix
                  in="blur"
                  type="matrix"
                  values="1 0 0 0 1 0 0.25 0 0 0.12 0 0 0.2 0 0.55 0 0 0 1 0"
                  result="glow"
                />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id="impact-area-blur"
                x="-8%"
                y="-12%"
                width="116%"
                height="136%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="10" />
              </filter>
            </defs>

            <motion.path
              d="M26 276 C110 248 156 238 220 232 C294 224 326 252 390 224 C474 190 516 208 586 176 C650 148 690 162 744 134 C808 100 856 116 910 88 C936 76 956 74 976 62 L976 330 L26 330 Z"
              fill="url(#impact-area-gradient)"
              clipPath="url(#impact-area-reveal)"
              mask="url(#impact-area-soft-mask)"
              filter="url(#impact-area-blur)"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: contentVisible ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.85, ease: EASE_OUT }}
            />
            <motion.path
              d="M26 276 C110 248 156 238 220 232 C294 224 326 252 390 224 C474 190 516 208 586 176 C650 148 690 162 744 134 C808 100 856 116 910 88 C936 76 956 74 976 62"
              stroke="url(#impact-wave-gradient)"
              strokeWidth="2.4"
              strokeLinecap="round"
              filter="url(#impact-wave-glow)"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: contentVisible ? 1 : 0,
                opacity: contentVisible ? 1 : 0,
              }}
              transition={{
                pathLength: { duration: reduce ? 0 : 1.65, ease: EASE_OUT },
                opacity: { duration: reduce ? 0 : 0.35 },
              }}
            />
            <motion.path
              d="M72 300 C150 286 210 272 286 258 C360 244 400 254 466 222 C548 182 600 194 676 158 C752 122 804 138 870 104 C904 86 926 86 942 78"
              stroke="rgb(var(--foreground) / 0.13)"
              strokeWidth="1"
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: contentVisible ? 1 : 0,
                opacity: contentVisible ? 1 : 0,
              }}
              transition={{
                pathLength: {
                  duration: reduce ? 0 : 1.95,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : 0.1,
                },
                opacity: { duration: reduce ? 0 : 0.45 },
              }}
            />

            {WAVE_DOTS.map((dot, index) => (
              <motion.circle
                key={`${dot.cx}-${dot.cy}`}
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r}
                fill={index % 2 === 0 ? "#F2EEE3" : "#FF4438"}
                initial={reduce ? false : { opacity: 0, scale: 0.72 }}
                animate={{
                  opacity: contentVisible ? dot.opacity : 0,
                  scale: contentVisible ? 1 : 0.72,
                }}
                transition={{
                  duration: reduce ? 0 : 0.42,
                  ease: EASE_OUT,
                  delay: reduce ? 0 : 0.36 + index * 0.12,
                }}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
              />
            ))}
          </svg>

          <p
            className="relative z-10 font-display text-[clamp(5.6rem,28vw,16rem)] font-semibold leading-[0.82] tracking-normal text-foreground sm:text-[clamp(8rem,20vw,16rem)]"
            aria-label={`${IMPACT_STAT.value}${IMPACT_STAT.suffix} more output`}
          >
            <span>{displayValue}</span>
            <span className="text-accent">{IMPACT_STAT.suffix}</span>
          </p>
        </div>
      </motion.div>
    </section>
  );
}
