"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import styles from "./portfolio.module.css";

function StoryBeat({
  children,
  index,
  count,
  progress,
}: {
  children: ReactNode;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, (value) => {
    const distance = Math.abs(value * (count - 1) - index);
    return Math.max(0, Math.min(1, (0.52 - distance) / 0.2));
  });
  const y = useTransform(progress, (value) => {
    const distance = Math.max(-1, Math.min(1, value * (count - 1) - index));
    return distance * -32;
  });

  return (
    <motion.h2
      className={styles.mobileStoryBeat}
      style={{ opacity, y }}
    >
      {children}
    </motion.h2>
  );
}

/** A short, native-scroll-driven scene before the chapter's flowing mobile content. */
export function MobileStorySequence({ beats }: { beats: ReactNode[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={trackRef}
      className={styles.mobileStoryTrack}
      data-beats={beats.length}
    >
      <div className={styles.mobileStoryStage}>
        {beats.map((beat, index) => (
          <StoryBeat
            key={index}
            index={index}
            count={beats.length}
            progress={scrollYProgress}
          >
            {beat}
          </StoryBeat>
        ))}
      </div>
    </div>
  );
}
