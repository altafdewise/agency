"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useScrollProgress } from "@/lib/use-scroll-progress";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";

const STORY =
  "I never really picked one thing. I just kept getting curious, so I kept building. Somewhere along the way, it became Zev.";

/** One word that inks in as the scroll passes its slot. */
function InkWord({
  word,
  index,
  total,
  progress,
}: {
  word: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 1.6 / total], [0.13, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{" "}
    </>
  );
}

/**
 * "How it started" — a short version of the /portfolio story. The sentence
 * inks in word by word as you read down, then hands off to the full story.
 */
export function StorySection() {
  const reduce = useSafeReducedMotion();
  const textRef = useRef<HTMLParagraphElement>(null);
  const scrollYProgress = useScrollProgress(textRef, ["start 0.82", "end 0.5"]);
  const words = STORY.split(" ");

  return (
    <section
      aria-labelledby="story-heading"
      className="relative w-full px-6 py-[clamp(7rem,18vh,12rem)] sm:px-10"
    >
      <div className="mx-auto w-full max-w-[1040px]">
        <h2 id="story-heading" className="eyebrow">
          how it started
        </h2>

        <p
          ref={textRef}
          className="mt-8 font-display text-[clamp(2rem,4.6vw,4rem)] font-semibold leading-[1.1] tracking-tightest text-foreground"
        >
          {reduce ? (
            STORY
          ) : (
            <>
              <span className="sr-only">{STORY}</span>
              <span aria-hidden>
                {words.map((word, i) => (
                  <InkWord
                    key={i}
                    word={word}
                    index={i}
                    total={words.length}
                    progress={scrollYProgress}
                  />
                ))}
              </span>
            </>
          )}
        </p>

        <div className="mt-[clamp(3.5rem,9vh,6rem)] flex flex-col gap-8 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="relative h-14 w-14 overflow-hidden rounded-full bg-foreground/5">
              <Image
                src="/portrait.jpeg"
                alt="Mohammad Altaf"
                fill
                sizes="56px"
                className="object-cover grayscale"
              />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                Mohammad Altaf
              </span>
              <span className="text-sm font-light text-muted">founder, Zev</span>
            </span>
          </div>

          <Link
            href="/portfolio"
            className="group inline-flex items-center gap-3 self-start rounded-full border border-foreground/15 py-2 pl-5 pr-2 text-sm font-medium text-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background sm:self-auto"
          >
            read the full story
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-colors duration-300 group-hover:bg-accent">
              <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
