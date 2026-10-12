"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fades and rises into place in Dynamic mode; simply there in Static mode. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
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
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

/** An image frame whose picture drifts and settles as it scrolls by (Dynamic only). */
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.06, 1.12]);

  return (
    <div ref={ref} className={`${className?.includes("absolute") ? "" : "relative "}overflow-hidden ${className ?? ""}`}>
      <motion.div className="absolute inset-[-8%]" style={dynamic ? { y, scale } : undefined}>
        {children}
      </motion.div>
    </div>
  );
}

/** A gentle float, for small cards over images (Dynamic only). */
export function Float({ children, className }: { children: React.ReactNode; className?: string }) {
  const { dynamic } = useShowcaseMode();
  return (
    <motion.div
      className={className}
      animate={dynamic ? { y: [0, -8, 0] } : { y: 0 }}
      transition={dynamic ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
    >
      {children}
    </motion.div>
  );
}
