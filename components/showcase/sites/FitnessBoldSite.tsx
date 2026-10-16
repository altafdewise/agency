"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useTransform } from "framer-motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";
import { useScrollProgress } from "@/lib/use-scroll-progress";

/* A bold sample site for a hardcore strength & combat gym. The gym is
   fictional; join buttons lead to Zev's page for gyms.

   Built in steps. Step 1: header and hero. Dynamic: the headline slams in,
   then splits and skews as you scroll while the photo pushes in and the
   red rises; HAVOC fills the screen at the end. Static: the same hero, still. */

const JOIN = "/for/gyms?utm_source=showcase&utm_medium=fitness-bold";

const LINES = ["BREAK", "YOUR", "LIMITS."];
const display = "font-[family-name:var(--font-display)] uppercase";

export function FitnessBoldSite() {
  const { dynamic } = useShowcaseMode();

  return (
    <div className="font-[family-name:var(--font-body)]">
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-5 sm:px-10">
          <a href="#top" className={`${display} flex items-center gap-2 text-[28px] leading-none tracking-wide text-white`}>
            HAVOC<span className="inline-block h-6 w-2 -skew-x-[18deg] bg-[var(--s-accent)]" aria-hidden />
          </a>
          <nav className="hidden items-center gap-8 text-[13px] font-bold uppercase tracking-[0.2em] text-white/75 md:flex">
            <a href="#programs" className="hover:text-white">Programs</a>
            <a href="#coaches" className="hover:text-white">Coaches</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <a
            href={JOIN}
            className="inline-flex h-11 -skew-x-[12deg] items-center bg-[var(--s-accent)] px-6 text-[13px] font-bold uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.04]"
          >
            <span className="skew-x-[12deg]">Join now</span>
          </a>
        </div>
      </header>

      {dynamic ? <HeroDynamic /> : <HeroStatic />}

      <section id="programs" className="flex min-h-[60svh] items-center justify-center border-t border-[var(--s-line)] px-6 text-center">
        <p className={`${display} text-[clamp(1.4rem,3vw,2.2rem)] text-[var(--s-muted)]`}>Programs, coaches & pricing land in the next steps.</p>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-10">
          <span className={`${display} text-2xl tracking-wide text-[var(--s-fg)]`}>HAVOC</span>
          <span>A sample website by Zev&apos;s Agency. HAVOC is a fictional gym.</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────── */

function HeroDynamic() {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, ["start start", "end end"]);

  const imgScale = useTransform(p, [0, 1], [1.05, 1.45]);
  const imgY = useTransform(p, [0, 1], ["0%", "8%"]);
  const red = useTransform(p, [0.1, 0.75], [0, 0.55]);
  const dark = useTransform(p, [0.55, 0.95], [0, 0.6]);

  // Each line tears off in its own direction, skewing as it goes.
  const x0 = useTransform(p, [0.05, 0.6], ["0vw", "-70vw"]);
  const x1 = useTransform(p, [0.05, 0.6], ["0vw", "75vw"]);
  const x2 = useTransform(p, [0.05, 0.6], ["0vw", "-80vw"]);
  const skew = useTransform(p, [0.05, 0.6], [0, -16]);
  const linesOpacity = useTransform(p, [0.35, 0.6], [1, 0]);

  // The slash that rips across, and the word that takes over.
  const slashX = useTransform(p, [0.3, 0.7], ["-120%", "120%"]);
  const brandScale = useTransform(p, [0.55, 0.95], [0.6, 1]);
  const brandOpacity = useTransform(p, [0.55, 0.75], [0, 1]);
  const tagOpacity = useTransform(p, [0, 0.12], [1, 0]);

  const xs = [x0, x1, x2];

  return (
    <section id="top" ref={ref} className="relative h-[260svh] bg-black">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: imgScale, y: imgY }}>
          <Image src="/showcase/fitness-bold/hero.jpg" alt="A lifter roaring through a heavy deadlift in red light" fill priority sizes="100vw" className="object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/80" aria-hidden />
        <motion.div className="absolute inset-0 bg-[#E10600] mix-blend-multiply" style={{ opacity: red }} aria-hidden />
        <motion.div className="absolute inset-0 bg-black" style={{ opacity: dark }} aria-hidden />

        {/* The rip */}
        <div aria-hidden className="absolute left-0 top-1/2 h-[18svh] w-full -translate-y-1/2 -skew-y-6">
          <motion.div className="h-full w-full bg-[var(--s-accent)]" style={{ x: slashX }} />
        </div>

        <h1 className={`${display} absolute inset-0 flex flex-col items-center justify-center text-center text-[clamp(5rem,19vw,17rem)] leading-[0.84] text-white`}>
          {LINES.map((line, i) => (
            <motion.span
              key={line}
              className={`block ${i === 2 ? "text-[var(--s-accent-ink)]" : ""}`}
              initial={{ opacity: 0, scale: 1.8, filter: "blur(18px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span className="block" style={{ x: xs[i], skewX: skew, opacity: linesOpacity }}>
                {line}
              </motion.span>
            </motion.span>
          ))}
        </h1>

        <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: brandOpacity, scale: brandScale }} aria-hidden>
          <span className={`${display} text-[clamp(6rem,30vw,28rem)] leading-none text-transparent [-webkit-text-stroke:2px_#fff]`}>HAVOC</span>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 bottom-[7svh] flex flex-col items-center gap-5 px-6 text-center"
          style={{ opacity: tagOpacity }}
        >
          <p className="text-[13px] font-bold uppercase tracking-[0.32em] text-white/80">Strength · Combat · Conditioning · Kondapur</p>
          <a href={JOIN} className="inline-flex h-12 -skew-x-[12deg] items-center bg-[var(--s-accent)] px-8 text-[14px] font-bold uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.05]">
            <span className="skew-x-[12deg]">Claim your free session</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function HeroStatic() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden bg-black">
      <Image src="/showcase/fitness-bold/hero.jpg" alt="A lifter roaring through a heavy deadlift in red light" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85" aria-hidden />
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pt-20 text-center">
        <h1 className={`${display} text-[clamp(5rem,19vw,17rem)] leading-[0.84] text-white`}>
          {LINES.map((line, i) => (
            <span key={line} className={`block ${i === 2 ? "text-[var(--s-accent-ink)]" : ""}`}>{line}</span>
          ))}
        </h1>
        <p className="mt-10 text-[13px] font-bold uppercase tracking-[0.32em] text-white/80">Strength · Combat · Conditioning · Kondapur</p>
        <a href={JOIN} className="mt-6 inline-flex h-12 -skew-x-[12deg] items-center bg-[var(--s-accent)] px-8 text-[14px] font-bold uppercase tracking-[0.2em] text-white">
          <span className="skew-x-[12deg]">Claim your free session</span>
        </a>
      </div>
    </section>
  );
}
