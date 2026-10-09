"use client";

import type { RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "framer-motion";

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Scroll progress through `target` as a plain MotionValue.
 *
 * framer-motion 12 hands `useScroll` → `useTransform` → opacity chains to the
 * browser's native ViewTimeline, which maps our offsets wrongly (elements stay
 * visible outside their range). Copying the value into an ordinary
 * MotionValue keeps every derived transform on the JS path, where the maths
 * is exactly what we wrote.
 */
export function useScrollProgress(
  target: RefObject<HTMLElement | null>,
  offset: ScrollOffset
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target, offset });
  const progress = useMotionValue(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => progress.set(v));
  return progress;
}
