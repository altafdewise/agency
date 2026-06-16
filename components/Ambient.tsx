"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A very subtle, slow-drifting radial glow so the dark background feels alive
 * rather than flat. Barely perceptible; ~20s loop. Static under reduced motion.
 */
export function Ambient() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-[44%] h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(242,238,227,0.05), transparent 60%)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-[44%] h-[80vmax] w-[80vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(242,238,227,0.06), transparent 60%)",
        }}
        animate={{
          x: ["-4%", "5%", "-4%"],
          y: ["-3%", "4%", "-3%"],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
