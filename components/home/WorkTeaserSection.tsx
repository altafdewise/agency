"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import {
  WORK_TEASER_MEDIA,
  type WorkTeaserMediaItem,
} from "@/lib/work-teaser-media";
import { cn } from "@/lib/cn";

// More, narrower columns read like the reference (a dense field of slanted
// tiles) and keep tile sizes sensible across the wide, bleeding container.
// Columns 4–5 only appear as the viewport widens. Each column draws the full
// media list rotated by a different offset so every column is full and varied.
const COLUMN_CONFIG = [
  { offset: 0, direction: "down", duration: "38s", show: "" },
  { offset: 2, direction: "up", duration: "45s", show: "" },
  { offset: 4, direction: "down", duration: "41s", show: "" },
  { offset: 6, direction: "up", duration: "48s", show: "hidden sm:block" },
  { offset: 8, direction: "down", duration: "43s", show: "hidden lg:block" },
] as const;

function rotateList<T>(list: readonly T[], by: number): T[] {
  const n = list.length;
  const k = ((by % n) + n) % n;
  return [...list.slice(k), ...list.slice(0, k)];
}

function PlaceholderTile({ tile }: { tile: WorkTeaserMediaItem }) {
  const Icon = tile.type === "video" ? Play : ImageIcon;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full border border-foreground/[0.12] bg-foreground/[0.035] text-accent">
        <Icon className="h-4 w-4" strokeWidth={1.7} aria-hidden />
      </span>
      <span className="eyebrow text-[0.58rem] text-muted/70">
        {tile.type} slot
      </span>
      <span className="max-w-full break-all font-mono text-[0.62rem] font-light leading-relaxed text-muted/50">
        {tile.src}
      </span>
    </div>
  );
}

function MediaTile({
  tile,
  reduce,
  className,
}: {
  tile: WorkTeaserMediaItem;
  reduce: boolean;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "relative overflow-hidden rounded-2xl bg-foreground/[0.025] shadow-[0_28px_80px_-56px_rgba(0,0,0,0.95)]",
        className
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_65%_18%,rgb(var(--foreground)/0.09),transparent_64%)]"
      />

      {tile.ready && tile.type === "image" && (
        <Image
          src={tile.src}
          alt={tile.alt}
          fill
          sizes="(min-width: 1024px) 15vw, (min-width: 640px) 24vw, 29vw"
          className="object-cover"
        />
      )}

      {tile.ready && tile.type === "video" && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={tile.src}
          poster={tile.poster}
          muted
          loop={!reduce}
          autoPlay={!reduce}
          playsInline
          preload={reduce ? "metadata" : "auto"}
          aria-label={tile.alt}
        />
      )}

      {!tile.ready && <PlaceholderTile tile={tile} />}
    </figure>
  );
}

function MediaColumn({
  colKey,
  items,
  direction,
  duration,
  reduce,
  className,
}: {
  colKey: number;
  items: WorkTeaserMediaItem[];
  direction: "up" | "down";
  duration: string;
  reduce: boolean;
  className?: string;
}) {
  const loopTiles = reduce ? items : [...items, ...items];

  return (
    <div className={cn("min-w-0 overflow-hidden", className)}>
      <div
        className={cn(
          "flex flex-col gap-3 will-change-transform sm:gap-4",
          !reduce &&
            (direction === "up"
              ? "animate-work-teaser-up"
              : "animate-work-teaser-down")
        )}
        style={{ animationDuration: duration }}
        aria-hidden={!reduce}
      >
        {loopTiles.map((tile, index) => (
          <MediaTile
            key={`${colKey}-${tile.id}-${index}`}
            tile={tile}
            reduce={reduce}
            className="aspect-[9/16] w-full"
          />
        ))}
      </div>
    </div>
  );
}

// A horizontal auto-scrolling marquee row (mobile). Content is duplicated so
// the -50% translate loops seamlessly; each tile carries its own right margin
// so the two halves line up exactly.
function MarqueeRow({
  items,
  direction,
  duration,
  reduce,
}: {
  items: WorkTeaserMediaItem[];
  direction: "left" | "right";
  duration: string;
  reduce: boolean;
}) {
  const loopTiles = reduce ? items : [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          "flex w-max will-change-transform",
          !reduce &&
            (direction === "right"
              ? "animate-work-teaser-marquee-right"
              : "animate-work-teaser-marquee-left")
        )}
        style={{ animationDuration: duration }}
        aria-hidden={!reduce}
      >
        {loopTiles.map((tile, index) => (
          <MediaTile
            key={`${direction}-${tile.id}-${index}`}
            tile={tile}
            reduce={reduce}
            className="mr-3 aspect-[16/9] w-[58vw] max-w-[280px] shrink-0"
          />
        ))}
      </div>
    </div>
  );
}

// The primary CTA — a refined accent pill with a soft glow, hover lift, and a
// sheen sweep. Shared between the desktop text column and the mobile layout.
function ExploreButton({ className }: { className?: string }) {
  return (
    <Link
      href="/about#work"
      className={cn(
        "group relative inline-flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-full bg-accent px-6 text-sm font-semibold tracking-tight text-background shadow-[0_16px_44px_-14px_rgb(var(--accent)/0.7)] ring-1 ring-inset ring-background/10 transition-[transform,box-shadow,filter] duration-300 ease-out-soft hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[0_22px_60px_-14px_rgb(var(--accent)/0.85)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/55 active:translate-y-0 active:scale-[0.98] sm:min-h-[56px] sm:gap-2.5 sm:px-9 sm:text-base",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-background/25 to-transparent transition-transform duration-700 ease-out-soft group-hover:translate-x-full"
      />
      <span className="relative">explore our work</span>
      <ArrowRight
        className="relative h-4 w-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1"
        strokeWidth={2}
        aria-hidden
      />
    </Link>
  );
}

export function WorkTeaserSection() {
  const reduce = Boolean(useReducedMotion());

  return (
    <section
      id="selected-work"
      aria-labelledby="selected-work-heading"
      className="relative w-full overflow-hidden py-20 sm:py-24 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-path grid-cols-1 gap-12 px-6 sm:px-10 lg:min-h-[720px] lg:grid-cols-[minmax(280px,0.75fr)_minmax(560px,1.25fr)] lg:items-center lg:gap-16 xl:gap-20">
        {/* Centered on mobile, left-aligned from the lg two-column layout.
            Title + subtitle sizing matches the funnel section for a consistent
            type scale across the page. */}
        <div className="max-w-xl text-center sm:text-left">
          <p className="eyebrow">Selected work</p>
          <h2
            id="selected-work-heading"
            className="mt-5 text-balance font-display text-[clamp(3.35rem,5.45vw,6.25rem)] font-semibold leading-[0.95] tracking-normal text-foreground"
          >
            explore our work.
          </h2>
          <p className="mx-auto mt-5 max-w-sm font-sans text-base font-light leading-relaxed text-foreground/48 sm:mx-0">
            Recent builds, brands, and launches.
          </p>
          {/* On mobile the CTA moves below the work samples (see below). */}
          <ExploreButton className="mt-9 hidden sm:inline-flex" />
        </div>

        {/* Mobile: portrait columns don't suit a narrow screen, so swap to two
            full-bleed rows of landscape tiles auto-scrolling in opposite
            directions, with the CTA after the samples. */}
        <div className="sm:hidden">
          <div className="-mx-6 flex flex-col gap-3">
            <MarqueeRow
              items={rotateList(WORK_TEASER_MEDIA, 0)}
              direction="right"
              duration="42s"
              reduce={reduce}
            />
            <MarqueeRow
              items={rotateList(WORK_TEASER_MEDIA, 4)}
              direction="left"
              duration="48s"
              reduce={reduce}
            />
          </div>
          <div className="mt-9 flex justify-center">
            <ExploreButton />
          </div>
        </div>

        <div
          className="relative -mr-[calc(50vw-50%)] hidden h-[560px] overflow-hidden sm:block sm:h-[640px] lg:h-[720px]"
          style={{
            // The box bleeds to (and past) the right viewport edge so the
            // columns run off the screen. overflow-hidden crops the slant; the
            // left is a clean diagonal start (no fade / no cut) and the mask
            // softens only the top & bottom.
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, #000 80px, #000 calc(100% - 80px), transparent)",
            maskImage:
              "linear-gradient(to bottom, transparent, #000 80px, #000 calc(100% - 80px), transparent)",
          }}
        >
          {/* Tilt layer pivots at its bottom-left corner and leans right, so
              nothing overflows past the left edge — the leftmost column simply
              starts on a diagonal (no left cut). It overhangs the top/right to
              keep the slant filled, with the right running off-screen and the
              top/bottom softened by the mask above. The auto-scroll lives on
              the inner columns, so tiles drift along this tilted axis. */}
          <div className="absolute -bottom-[6%] left-0 -right-[18%] -top-[45%] origin-bottom-left [transform:rotate(9deg)] lg:left-[9%] lg:-right-[28%] lg:[transform:rotate(11deg)]">
            <div className="grid h-full grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-5">
              {COLUMN_CONFIG.map((config, i) => (
                <MediaColumn
                  key={i}
                  colKey={i}
                  items={rotateList(WORK_TEASER_MEDIA, config.offset)}
                  direction={config.direction}
                  duration={config.duration}
                  reduce={reduce}
                  className={config.show}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
