"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Dynamic mode: rises out of a soft blur with a slight backward tilt, as if
 * stepping forward into focus. Static mode: simply there.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 40,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const { dynamic } = useShowcaseMode();
  const Tag = motion[as];
  if (!dynamic) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, scale: 0.97, rotateX: 8, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.05, ease: EASE, delay }}
      style={{ transformPerspective: 1000, transformOrigin: "50% 100%" }}
    >
      {children}
    </Tag>
  );
}

/**
 * An image frame. In Dynamic mode the frame unfolds from an inset crop to its
 * full size as it scrolls into view, while the picture inside drifts and
 * zooms. Full-bleed frames (positioned absolute) skip the unfold.
 */
export function Parallax({
  children,
  className,
  distance = 60,
}: {
  children: React.ReactNode;
  className?: string;
  distance?: number;
}) {
  const { dynamic } = useShowcaseMode();
  const ref = useRef<HTMLDivElement>(null);
  const fullBleed = className?.includes("absolute") ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance * 1.4, distance * 1.4]);
  const scale = useTransform(scrollYProgress, [0, 0.45, 1], [1.28, 1.08, 1.18]);
  const clipPath = useTransform(
    scrollYProgress,
    [0, 0.38],
    ["inset(14% 10% 14% 10% round 36px)", "inset(0% 0% 0% 0% round 0px)"]
  );

  return (
    <motion.div
      ref={ref}
      className={`${fullBleed ? "" : "relative "}overflow-hidden ${className ?? ""}`}
      style={dynamic && !fullBleed ? { clipPath } : undefined}
    >
      <motion.div className="absolute inset-[-10%]" style={dynamic ? { y, scale } : undefined}>
        {children}
      </motion.div>
    </motion.div>
  );
}

/** A gentle float, for small cards over images (Dynamic only). */
export function Float({ children, className }: { children: React.ReactNode; className?: string }) {
  const { dynamic } = useShowcaseMode();
  return (
    <motion.div
      className={className}
      animate={dynamic ? { y: [0, -10, 0], rotate: [0, -1.2, 0] } : { y: 0, rotate: 0 }}
      transition={dynamic ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
