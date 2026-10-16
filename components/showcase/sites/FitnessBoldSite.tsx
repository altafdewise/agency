"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, Clock, Flame, Users } from "lucide-react";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";
import { useScrollProgress } from "@/lib/use-scroll-progress";

/* A bold sample site for a hardcore strength & combat gym. The gym is
   fictional; join buttons lead to Zev's page for gyms.

   Dynamic mode:
   - Hero: the headline slams in, then splits and skews as you scroll while
     the photo pushes in and the red rises; HAVOC fills the screen.
   - Marquee: runs faster and leans harder the faster you scroll.
   - Programs: full-height cards pin and stack, each pushing the last back.
   - Numbers: slam in, one after another.
   Static: the same page, still. */

const JOIN = "/for/gyms?utm_source=showcase&utm_medium=fitness-bold";

const LINES = ["BREAK", "YOUR", "LIMITS."];
const display = "font-[family-name:var(--font-display)] uppercase";

export function FitnessBoldSite() {
  const { dynamic } = useShowcaseMode();

  return (
    <div className="font-[family-name:var(--font-body)]">
      <header className="fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-black/75 to-transparent">
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

      <Marquee dynamic={dynamic} />
      <Programs dynamic={dynamic} />
      <Numbers dynamic={dynamic} />

      <section id="coaches" className="flex min-h-[40svh] items-center justify-center border-t border-[var(--s-line)] px-6 text-center">
        <p className={`${display} text-[clamp(1.4rem,3vw,2.2rem)] text-[var(--s-muted)]`}>Coaches, schedule & pricing land in the next step.</p>
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

/* ── Marquee: speed and lean follow your scroll ──────────────────────────── */

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

function useScrollVelocityFactor() {
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  return useTransform(smooth, [-2500, 0, 2500], [-6, 0, 6], { clamp: false });
}

function MarqueeRow({
  text,
  baseSpeed,
  factor,
  outline = false,
}: {
  text: string;
  baseSpeed: number;
  factor: MotionValue<number> | null;
  outline?: boolean;
}) {
  const baseX = useMotionValue(0);
  const direction = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const skewX = useTransform(factor ?? baseX, (f) => (factor ? Math.max(-18, Math.min(18, f * -3)) : 0));

  useAnimationFrame((_, delta) => {
    if (!factor) return;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    const move = direction.current * baseSpeed * (delta / 1000) * (1 + Math.abs(f));
    baseX.set(baseX.get() + move);
  });

  const items = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="flex shrink-0 items-center gap-[0.35em] pr-[0.35em]">
      {text}
      <span className="inline-block h-[0.42em] w-[0.42em] -skew-x-[18deg] bg-[var(--s-accent)]" aria-hidden />
    </span>
  ));

  return (
    <div className="overflow-hidden">
      <motion.div
        className={`${display} flex w-max whitespace-nowrap text-[clamp(4rem,12vw,10rem)] leading-[0.95] ${outline ? "text-transparent [-webkit-text-stroke:2px_var(--s-fg)]" : "text-[var(--s-fg)]"}`}
        style={factor ? { x, skewX } : { x: "0%", skewX: 0 }}
      >
        {items}
        {items}
      </motion.div>
    </div>
  );
}

function Marquee({ dynamic }: { dynamic: boolean }) {
  const factor = useScrollVelocityFactor();
  return (
    <section aria-label="No excuses" className="border-y border-[var(--s-line)] bg-[var(--s-bg)] py-10 transition-colors duration-500 sm:py-14">
      <MarqueeRow text="No excuses" baseSpeed={-3.2} factor={dynamic ? factor : null} />
      <MarqueeRow text="No shortcuts" baseSpeed={3.2} factor={dynamic ? factor : null} outline />
    </section>
  );
}

/* ── Programs: cards that pin and stack ──────────────────────────────────── */

const PROGRAMS = [
  {
    n: "01",
    title: "Strength",
    img: "/showcase/fitness-bold/hero.jpg",
    body: "Barbell-first training on a floor built for heavy. Squat, bench, deadlift, and the accessories that make them move.",
    meta: [["Mon · Wed · Fri", Clock], ["6 per coach", Users], ["All levels", Flame]] as const,
  },
  {
    n: "02",
    title: "Combat",
    img: "/showcase/fitness-bold/fight.jpg",
    body: "Boxing, kickboxing and MMA fundamentals. Bag work, pads, technique and controlled sparring when you're ready.",
    meta: [["Daily, 7 am & 7 pm", Clock], ["Fight coaches", Users], ["Gloves provided", Flame]] as const,
  },
  {
    n: "03",
    title: "Conditioning",
    img: "/showcase/fitness-bold/ropes.jpg",
    body: "Ropes, sleds, bikes and carries. Forty-five minutes that build an engine you can actually use.",
    meta: [["Tue · Thu · Sat", Clock], ["12 per class", Users], ["Brutal, scaled", Flame]] as const,
  },
  {
    n: "04",
    title: "Hybrid",
    img: "/showcase/fitness-bold/sled.jpg",
    body: "Strength and conditioning in one plan, for people who want to be strong and fast. Built for HYROX-style races.",
    meta: [["4 days a week", Clock], ["Coached plan", Users], ["Race-ready", Flame]] as const,
  },
];

function ProgramCard({ prog, index, progress, dynamic }: { prog: (typeof PROGRAMS)[number]; index: number; progress: MotionValue<number>; dynamic: boolean }) {
  const n = PROGRAMS.length;
  // Each card shrinks and dims as the ones after it pile on top.
  const scale = useTransform(progress, [index / n, 1], [1, 1 - (n - 1 - index) * 0.06]);
  const dim = useTransform(progress, [index / n, 1], [0, (n - 1 - index) * 0.18]);

  return (
    <div className={dynamic ? "sticky h-[100svh]" : ""} style={dynamic ? { top: `calc(5.5rem + ${index * 22}px)` } : undefined}>
      <motion.article
        className="relative mx-auto grid h-[min(80svh,680px)] max-w-[1400px] grid-rows-[26svh_1fr] md:grid-rows-1 origin-top overflow-hidden border border-[var(--s-line)] bg-[var(--s-surface)] md:grid-cols-[1.05fr_1fr]"
        style={dynamic ? { scale } : { scale: 1 }}
      >
        <div className="relative">
          <Image src={prog.img} alt={prog.title} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" aria-hidden />
          <span className={`${display} absolute left-5 top-4 text-[clamp(4rem,9vw,8rem)] leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.85)]`}>{prog.n}</span>
        </div>
        <div className="flex flex-col justify-center gap-4 p-5 sm:gap-6 sm:p-10 lg:p-14">
          <div className="h-1.5 w-16 -skew-x-[18deg] bg-[var(--s-accent)]" aria-hidden />
          <h3 className={`${display} text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.9] text-[var(--s-fg)]`}>{prog.title}</h3>
          <p className="max-w-md text-[15px] font-medium leading-relaxed text-[var(--s-muted)] sm:text-[17px]">{prog.body}</p>
          <ul className="flex flex-wrap gap-2">
            {prog.meta.map(([label, Icon]) => (
              <li key={label} className="flex items-center gap-2 border border-[var(--s-line)] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--s-fg)] sm:px-3 sm:py-2 sm:text-[13px] sm:tracking-[0.12em]">
                <Icon className="h-4 w-4 text-[var(--s-accent-ink)]" strokeWidth={2.4} /> {label}
              </li>
            ))}
          </ul>
          <a href={JOIN} className="inline-flex h-12 w-fit -skew-x-[12deg] items-center gap-2 bg-[var(--s-fg)] px-7 text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--s-bg)] transition-colors hover:bg-[var(--s-accent)] hover:text-white">
            <span className="flex skew-x-[12deg] items-center gap-2">Book a trial <ArrowUpRight className="h-4 w-4" strokeWidth={2.4} /></span>
          </a>
        </div>
        <motion.div className="pointer-events-none absolute inset-0 bg-black" style={{ opacity: dynamic ? dim : 0 }} aria-hidden />
      </motion.article>
    </div>
  );
}

function Programs({ dynamic }: { dynamic: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, ["start start", "end end"]);
  return (
    <section id="programs" className="px-3 pb-10 pt-24 sm:px-8 sm:pt-32">
      <div className="mx-auto mb-10 flex max-w-[1400px] flex-wrap items-end justify-between gap-6 sm:mb-14">
        <h2 className={`${display} text-[clamp(3.4rem,9vw,8.5rem)] leading-[0.86] text-[var(--s-fg)]`}>
          Pick your<br /><span className="text-[var(--s-accent-ink)]">weapon.</span>
        </h2>
        <p className="max-w-sm text-[17px] font-medium text-[var(--s-muted)]">Four programs. One membership. Train all of them or go all-in on one.</p>
      </div>
      <div ref={ref} className={dynamic ? "" : "flex flex-col gap-6"}>
        {PROGRAMS.map((prog, i) => (
          <ProgramCard key={prog.n} prog={prog} index={i} progress={p} dynamic={dynamic} />
        ))}
      </div>
    </section>
  );
}

/* ── Numbers: slam in ────────────────────────────────────────────────────── */

const NUMBERS = [
  { v: "24/7", l: "Open, every day" },
  { v: "40+", l: "Classes a week" },
  { v: "12", l: "Fight & strength coaches" },
  { v: "0", l: "Excuses accepted" },
];

function Numbers({ dynamic }: { dynamic: boolean }) {
  return (
    <section className="overflow-hidden border-y border-[var(--s-line)] bg-[var(--s-accent)] text-white">
      <dl className="mx-auto grid max-w-[1500px] grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map((n, i) => (
          <motion.div
            key={n.l}
            className={`px-5 py-12 sm:px-10 sm:py-16 ${i % 2 ? "border-l border-white/25" : ""} ${i > 1 ? "border-t border-white/25 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
            initial={dynamic ? { opacity: 0, scale: 2.2, rotate: -6, filter: "blur(12px)" } : false}
            whileInView={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.6 }}
            transition={dynamic ? { duration: 0.45, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
          >
            <dd className={`${display} text-[clamp(3.6rem,8vw,7rem)] leading-none`}>{n.v}</dd>
            <dt className="mt-3 text-[13px] font-bold uppercase tracking-[0.2em] text-white/85">{n.l}</dt>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
