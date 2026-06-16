"use client";

import { createContext, useContext } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/* Calm, premium ease-out (no overshoot/bounce). */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** True when a <Reveal> is inside a <RevealGroup> (so the group times it). */
const InGroup = createContext(false);

/**
 * Orchestrates a staggered cascade of its <Reveal> children when it mounts.
 * `stagger` = seconds between each child; `delay` = before the first one.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  const group: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  return (
    <InGroup.Provider value={true}>
      <motion.div
        className={className}
        variants={group}
        initial="hidden"
        animate="show"
      >
        {children}
      </motion.div>
    </InGroup.Provider>
  );
}

/**
 * A single item: fades + drifts up. `blur` adds a blur-to-sharp focus pull
 * (headlines). Works standalone (self-triggers, honouring `delay`) or inside a
 * <RevealGroup> (the group staggers it).
 */
export function Reveal({
  children,
  className,
  y = 30,
  duration = 0.5,
  blur = false,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  blur?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const inGroup = useContext(InGroup);
  if (reduce) return <div className={className}>{children}</div>;

  const item: Variants = {
    hidden: { opacity: 0, y, ...(blur ? { filter: "blur(8px)" } : {}) },
    show: {
      opacity: 1,
      y: 0,
      ...(blur ? { filter: "blur(0px)" } : {}),
      transition: { duration, ease: EASE_OUT, delay: inGroup ? 0 : delay },
    },
  };

  // In a group: inherit the group's hidden→show trigger. Standalone: self-run.
  return inGroup ? (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  ) : (
    <motion.div
      className={className}
      variants={item}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}
