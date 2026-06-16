"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/cn";

/* ── Geometry derived from public/Logo/logo.png by scripts/analyze-logo.mjs ──
   (the dot was removed from logo-mark.png; these place the animated dot exactly
   where the original sat, so at rest they're indistinguishable). */
const BOX_ASPECT = 0.8046; // width / height of logo-mark.png
const DOT_CX = 0.838; // dot centre, fraction of width
const DOT_CY = 0.8838; // dot centre, fraction of height
const DOT_R = 0.0946; // dot radius, fraction of width

const ORBIT_S = 3.5; // seconds for one trip around the 7
const HOLD_S = 2.0; // seconds resting + breathing
const CYCLE = ORBIT_S + HOLD_S;

const REST_SHADOW = "0 0 12px 2px rgba(242,238,227,0.28)";
const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

interface Orbit {
  cx: number;
  cy: number;
  restX: number;
  restY: number;
  a0: number;
  restRx: number;
  restRy: number;
  outerRx: number;
  outerRy: number;
}

function buildOrbit(w: number, h: number): Orbit {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const restX = w * DOT_CX;
  const restY = h * DOT_CY;
  const a0 = Math.atan2(restY - cy, restX - cx);
  return {
    cx,
    cy,
    restX,
    restY,
    a0,
    // radii that place the rest point at angle a0 (loop starts/ends there)
    restRx: (restX - cx) / Math.cos(a0),
    restRy: (restY - cy) / Math.sin(a0),
    // outer radii — comfortably outside the 7 so the dot travels around it
    outerRx: w * 0.66,
    outerRy: h * 0.62,
  };
}

/**
 * The mark = a bone "7" (CSS mask of the dot-less logo) + a separately animated
 * dot. The dot is driven imperatively with useAnimationFrame so its endless
 * orbit is NOT a declarative animation — that keeps it from ever stalling the
 * step transitions' AnimatePresence exit, while looking identical.
 */
export default function Logo({
  className,
  guideSource = false,
  guideReleased = false,
}: {
  className?: string;
  /** Marks the hero logo's dot as the source for the rail handoff. */
  guideSource?: boolean;
  /** Keeps the source measurable while visually handing it to the rail. */
  guideReleased?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const boxShadow = useMotionValue(REST_SHADOW);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const orbit = useMemo(
    () => (size.w > 0 ? buildOrbit(size.w, size.h) : null),
    [size.w, size.h]
  );

  useAnimationFrame((t) => {
    if (reduce || !orbit) return;
    const tt = (t / 1000) % CYCLE; // seconds into the current cycle

    let f = 0; // 0 during orbit; 0→1→0 breathing envelope during the hold
    if (tt < ORBIT_S) {
      const u = easeInOut(tt / ORBIT_S); // slow-in / slow-out over the trip
      const ang = orbit.a0 + 2 * Math.PI * u; // clockwise (screen coords)
      const env = Math.sin(Math.PI * u); // lift out, settle back
      const rx = orbit.restRx + (orbit.outerRx - orbit.restRx) * env;
      const ry = orbit.restRy + (orbit.outerRy - orbit.restRy) * env;
      x.set(orbit.cx + rx * Math.cos(ang) - orbit.restX);
      y.set(orbit.cy + ry * Math.sin(ang) - orbit.restY);
    } else {
      const hold = (tt - ORBIT_S) / HOLD_S;
      f = Math.sin(Math.PI * hold);
      x.set(0);
      y.set(0);
    }
    scale.set(1 + 0.08 * f); // barely-there breathing pulse
    boxShadow.set(
      `0 0 ${12 + 12 * f}px ${2 + 5 * f}px rgba(242,238,227,${0.28 + 0.22 * f})`
    );
  });

  const dotDiameter = `${DOT_R * 2 * 100}cqi`;

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      style={{
        aspectRatio: `${BOX_ASPECT}`,
        containerType: "inline-size",
        overflow: "visible",
      }}
      aria-label="maggie"
      role="img"
    >
      {/* The "7" — bone fill via an alpha mask of the dot-less mark, with glow. */}
      <div
        className="absolute inset-0 bg-foreground glow-soft"
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
        aria-hidden
      />

      {/* Zero-size anchor at the dot's rest centre; the dot centres on it via
          negative margins so the x/y transforms compose cleanly. */}
      <div
        className="absolute"
        style={{ left: `${DOT_CX * 100}%`, top: `${DOT_CY * 100}%` }}
        aria-hidden
      >
        <motion.div
          className="rounded-full bg-foreground"
          data-guiding-dot-source={guideSource ? true : undefined}
          style={{
            width: dotDiameter,
            height: dotDiameter,
            marginLeft: `-${DOT_R * 100}cqi`,
            marginTop: `-${DOT_R * 100}cqi`,
            x,
            y,
            scale,
            opacity: guideReleased ? 0 : 1,
            boxShadow: reduce ? REST_SHADOW : boxShadow,
          }}
        />
      </div>
    </div>
  );
}
