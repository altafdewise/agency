"use client";

import { motion, useReducedMotion } from "framer-motion";
import styles from "./Backdrop.module.css";

/* ------------------------------------------------------------------ *
 * Backdrop
 *
 * The stage behind the mark:
 *  — a slowly rotating hairline ring with a gold seam
 *  — two heavily-blurred aurora glows (champagne + cold violet)
 * Everything is slow (20–60s) and meditative. With reduced motion the
 * composition simply holds still.
 * ------------------------------------------------------------------ */

export default function Backdrop() {
  const reduce = useReducedMotion();

  return (
    <div className={styles.backdrop} aria-hidden>
      {/* Hairline orbit with a gold seam, rotating once a minute. */}
      <motion.div
        className={styles.ring}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Champagne glow — the primary light source. */}
      <motion.div
        className={`${styles.blob} ${styles.warm}`}
        animate={
          reduce
            ? undefined
            : { x: ["-12%", "10%", "-12%"], y: ["-8%", "8%", "-8%"], scale: [1, 1.18, 1] }
        }
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Cold violet depth in the opposite corner. */}
      <motion.div
        className={`${styles.blob} ${styles.cool}`}
        animate={
          reduce
            ? undefined
            : { x: ["10%", "-8%", "10%"], y: ["6%", "-10%", "6%"], scale: [1.1, 1, 1.1] }
        }
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Soft central breath that keeps the mark gently lit. */}
      <motion.div
        className={`${styles.blob} ${styles.center}`}
        animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
