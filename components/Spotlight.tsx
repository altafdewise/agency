"use client";

import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { useEffect } from "react";
import styles from "./Spotlight.module.css";

/* ------------------------------------------------------------------ *
 * Spotlight
 *
 * A soft champagne light that trails the cursor with a lazy spring —
 * like moving a candle across the page. Pointer-only; it never renders
 * on touch devices and sits out entirely under reduced motion.
 * ------------------------------------------------------------------ */

export default function Spotlight() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(-600);
  const my = useMotionValue(-600);
  const x = useSpring(mx, { damping: 28, stiffness: 120, mass: 0.8 });
  const y = useSpring(my, { damping: 28, stiffness: 120, mass: 0.8 });

  const glow = useMotionTemplate`radial-gradient(520px circle at ${x}px ${y}px, rgba(214, 179, 106, 0.10), rgba(214, 179, 106, 0.04) 38%, transparent 68%)`;

  useEffect(() => {
    if (reduce) return;
    const fine = window.matchMedia("(pointer: fine)");
    if (!fine.matches) return;

    const move = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduce, mx, my]);

  if (reduce) return null;

  return (
    <motion.div className={styles.spotlight} style={{ background: glow }} aria-hidden />
  );
}
