"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface OptionCardProps {
  title: string;
  blurb?: string;
  brief?: string;
  Icon?: LucideIcon;
  index?: string;
  signal?: boolean;
  featured?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const CARD_OPEN_EVENT = "maggie:card-open";

/**
 * Selectable card. The subtitle is no longer in the static body:
 *  • pointer/hover devices → a small tooltip follows the cursor on hover.
 *  • touch devices → first tap reveals the subtitle (accordion), second tap
 *    selects; only one card stays open at a time.
 * The subtitle is always in the DOM (sr-only + aria-describedby) for SR users.
 * The card's own glow / border / lift treatment is unchanged.
 */
export function OptionCard({
  title,
  blurb,
  brief,
  Icon,
  index,
  signal = false,
  selected,
  onClick,
  className,
}: OptionCardProps) {
  const reduce = useReducedMotion();
  const descId = useId();
  const subtitle = brief ?? blurb;
  const hasSubtitle = Boolean(subtitle);

  const [mounted, setMounted] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Cursor-following tooltip position (spring-trailed on pointer devices).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 30 });
  const sy = useSpring(my, { stiffness: 300, damping: 30 });
  const posX = reduce ? mx : sx;
  const posY = reduce ? my : sy;

  useEffect(() => {
    setMounted(true);
    setIsTouch(
      typeof window !== "undefined" &&
        window.matchMedia("(hover: none), (pointer: coarse)").matches
    );
  }, []);

  // Only one card open at a time (touch accordion).
  useEffect(() => {
    if (!isTouch) return;
    const onOpen = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== descId) setExpanded(false);
    };
    document.addEventListener(CARD_OPEN_EVENT, onOpen);
    return () => document.removeEventListener(CARD_OPEN_EVENT, onOpen);
  }, [isTouch, descId]);

  const handleEnter = (e: React.PointerEvent) => {
    if (isTouch || !hasSubtitle) return;
    if (reduce) {
      const r = e.currentTarget.getBoundingClientRect();
      mx.set(r.right - 8);
      my.set(r.top + 6);
    } else {
      const x = e.clientX + 16;
      const y = e.clientY + 16;
      mx.set(x);
      my.set(y);
      sx.jump(x);
      sy.jump(y);
    }
    setHovered(true);
  };

  const handleMove = (e: React.PointerEvent) => {
    if (isTouch || reduce || !hasSubtitle) return;
    mx.set(e.clientX + 16);
    my.set(e.clientY + 16);
  };

  const handleLeave = () => {
    if (!isTouch) setHovered(false);
  };

  const handleClick = () => {
    if (isTouch && hasSubtitle && !expanded) {
      setExpanded(true);
      document.dispatchEvent(
        new CustomEvent(CARD_OPEN_EVENT, { detail: descId })
      );
      return; // first tap reveals; second tap selects
    }
    onClick?.();
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handleClick}
        onPointerEnter={handleEnter}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        aria-pressed={selected}
        aria-describedby={hasSubtitle ? descId : undefined}
        data-option-card={signal ? "signal" : "default"}
        whileHover={reduce ? undefined : { y: -4 }}
        layout={isTouch ? true : undefined}
        transition={{
          duration: 0.2,
          ease: [0.22, 1, 0.36, 1],
          layout: { duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] },
        }}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col items-start gap-3.5 overflow-hidden rounded-lg border p-5 text-left transition-colors duration-200 ease-out sm:p-6",
          "border-border bg-foreground/[0.015] hover:border-accent/50 hover:bg-foreground/[0.04] focus-visible:border-accent/60",
          signal && "min-h-[140px]",
          selected && "border-accent bg-foreground/[0.05]",
          className
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100",
            signal && "blur-xl"
          )}
          style={{
            background:
              "radial-gradient(70% 70% at 18% 12%, rgba(255,68,56,0.12), transparent 72%)",
          }}
        />

        {signal && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,68,56,0.08), transparent 42%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-accent/70 to-transparent opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </>
        )}

        {/* Number — plain muted text, top-right; accent only on hover/active. */}
        {index && (
          <span
            className={cn(
              "absolute right-5 top-5 z-10 font-mono text-[0.63rem] leading-none transition-colors duration-200 group-hover:text-accent group-focus-visible:text-accent sm:right-6 sm:top-6",
              selected ? "text-accent" : "text-muted/60"
            )}
          >
            {index}
          </span>
        )}

        {Icon && (
          <Icon
            className={cn(
              "relative z-10 h-6 w-6 shrink-0 origin-center transition-all duration-200 ease-out group-hover:scale-[1.08] group-focus-visible:scale-[1.08]",
              selected
                ? "text-accent"
                : "text-muted group-hover:text-accent group-focus-visible:text-accent"
            )}
            strokeWidth={1.5}
            aria-hidden
          />
        )}

        <div className="relative z-10 flex w-full flex-col gap-2">
          <span className="font-sans text-base font-medium leading-snug text-foreground sm:text-lg">
            {title}
          </span>

          {/* Subtitle kept in the DOM for screen readers at all times. */}
          {hasSubtitle && (
            <span id={descId} className="sr-only">
              {subtitle}
            </span>
          )}

          {/* Touch: tap-to-reveal subtitle + "tap again to continue" hint. */}
          {isTouch && hasSubtitle && expanded && (
            <motion.div
              aria-hidden
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduce ? 0 : 0.25,
                ease: [0.22, 1, 0.36, 1],
                delay: reduce ? 0 : 0.04,
              }}
              className="flex flex-col gap-2"
            >
              <span className="font-sans text-sm font-light leading-snug text-foreground/70">
                {subtitle}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.15em] text-accent">
                tap again to continue
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            </motion.div>
          )}
        </div>

        {!signal && (
          <span
            className={cn(
              "absolute bottom-5 right-5 z-10 h-2 w-2 rounded-full bg-accent transition-all duration-300",
              selected ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
            aria-hidden
          />
        )}
      </motion.button>

      {/* Cursor-following tooltip (pointer devices) — portaled out so the card's
          overflow/transform never clips it. */}
      {mounted &&
        !isTouch &&
        hasSubtitle &&
        createPortal(
          <motion.div
            className="pointer-events-none fixed left-0 top-0 z-[60]"
            style={{ x: posX, y: posY }}
          >
            <motion.div
              animate={
                hovered
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: reduce ? 1 : 0.95 }
              }
              transition={{
                duration: reduce ? 0 : hovered ? 0.15 : 0.1,
                ease: hovered ? [0.22, 1, 0.36, 1] : [0.64, 0, 0.78, 0],
              }}
              className="whitespace-nowrap rounded-md border border-border bg-foreground/10 px-3 py-1.5 text-[13px] font-light leading-none text-foreground shadow-[0_8px_24px_-8px_rgba(0,0,0,0.65)] backdrop-blur-sm"
            >
              {subtitle}
            </motion.div>
          </motion.div>,
          document.body
        )}
    </>
  );
}
