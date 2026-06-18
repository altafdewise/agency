"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";
import { SERVICES } from "@/lib/content";

interface ServiceListProps {
  onChoose: (key: string) => void;
  showOther: boolean;
}

/**
 * The "what brings you here?" services as a box-less editorial list — no card
 * fills, borders, or rounded boxes; rows sit directly on the near-black page.
 * Each row is `[number] [icon] [title]` with the subtitle hidden until the row
 * is focused.
 *
 * Focus model (reused from the previous card version):
 *  • Desktop (pointer: fine) — the row nearest the cursor is focused.
 *  • Touch / no cursor — the row closest to the viewport's vertical centre is
 *    focused, shifting as you scroll.
 *  • Cursor off the section (desktop) — neutral, equal resting state.
 *
 * The focused row brightens + scales slightly, its number/icon turn accent,
 * and its subtitle fades in; all other rows dim. Only transform/opacity (and
 * colour) animate. Honours prefers-reduced-motion (static, equal, every
 * subtitle shown).
 */
export function ServiceList({ onChoose, showOther }: ServiceListProps) {
  const reduce = useReducedMotion() ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const rowEls = useRef<(HTMLButtonElement | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const moveRaf = useRef<number | null>(null);
  const scrollRaf = useRef<number | null>(null);
  const inView = useRef(false);

  const [isFine, setIsFine] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);
  const [scrollIndex, setScrollIndex] = useState<number | null>(null);

  // Detect a real (fine) pointer; drives the cursor-vs-scroll priority.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const m = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setIsFine(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);

  // Scroll-center focus (baseline; primary feel on touch).
  useEffect(() => {
    if (reduce) return;

    const compute = () => {
      if (!inView.current) return;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestD = Infinity;
      rowEls.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setScrollIndex((prev) => (prev === best ? prev : best));
    };

    const onScroll = () => {
      if (scrollRaf.current != null) return;
      scrollRaf.current = requestAnimationFrame(() => {
        scrollRaf.current = null;
        compute();
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting;
        if (entry.isIntersecting) compute();
      },
      { threshold: 0 }
    );
    if (containerRef.current) io.observe(containerRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    compute();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current);
    };
  }, [reduce]);

  // Cursor focus — nearest row (fine pointer only).
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || !isFine || e.pointerType !== "mouse") return;
    pointer.current = { x: e.clientX, y: e.clientY };
    if (!pointerActive) setPointerActive(true);

    if (moveRaf.current != null) return;
    moveRaf.current = requestAnimationFrame(() => {
      moveRaf.current = null;
      const { x, y } = pointer.current;
      let best = 0;
      let bestD = Infinity;
      rowEls.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = x - (r.left + r.width / 2);
        const dy = y - (r.top + r.height / 2);
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      setCursorIndex((prev) => (prev === best ? prev : best));
    });
  };

  const handlePointerLeave = () => {
    setPointerActive(false);
    setCursorIndex(null);
  };

  // Priority: cursor over list (desktop) → cursor focus; touch → scroll focus;
  // desktop with cursor away → neutral (no row focused).
  const focusDriver = reduce
    ? null
    : isFine
      ? pointerActive
        ? cursorIndex
        : null
      : scrollIndex;

  const groupVariants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.06,
        delayChildren: reduce ? 0 : 0.08,
      },
    },
  };
  const itemVariants: Variants = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative mt-16"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.ul
        className="mx-auto flex w-full max-w-xl flex-col gap-7 sm:gap-9"
        variants={groupVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >
        {SERVICES.map((s, index) => {
          const focused = focusDriver === index;
          const dimmed = focusDriver != null && !focused;
          const selected = s.key === "other" && showOther;
          const accent = focused || selected;
          const subtitle = s.brief ?? s.blurb;
          // Subtitle is reserved in the layout (always rendered) so toggling its
          // opacity never shifts the rows; under reduced motion every subtitle
          // simply stays visible.
          const showSubtitle = reduce ? true : focused;
          const Icon = s.Icon;

          return (
            <motion.li key={s.key} variants={itemVariants}>
              <motion.button
                ref={(el) => {
                  rowEls.current[index] = el;
                }}
                type="button"
                onClick={() => onChoose(s.key)}
                aria-pressed={selected}
                animate={
                  reduce
                    ? undefined
                    : { opacity: dimmed ? 0.42 : 1, scale: focused ? 1.02 : 1 }
                }
                transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left center" }}
                className="group flex w-full cursor-pointer items-start gap-4 text-left sm:gap-6"
              >
                <span
                  className={cn(
                    "mt-[3px] shrink-0 font-mono text-xs tabular-nums transition-colors duration-200",
                    accent ? "text-accent" : "text-muted/70"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {Icon && (
                  <Icon
                    className={cn(
                      "mt-px h-5 w-5 shrink-0 transition-colors duration-200",
                      accent ? "text-accent" : "text-muted"
                    )}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                )}

                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-sans text-lg font-medium leading-snug text-foreground sm:text-xl">
                    {s.title}
                  </span>
                  {subtitle && (
                    <motion.span
                      initial={false}
                      animate={
                        reduce
                          ? undefined
                          : { opacity: showSubtitle ? 1 : 0, y: showSubtitle ? 0 : -2 }
                      }
                      transition={{
                        duration: reduce ? 0 : 0.25,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="font-sans text-sm font-light leading-snug text-foreground/60"
                    >
                      {subtitle}
                    </motion.span>
                  )}
                </span>
              </motion.button>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
