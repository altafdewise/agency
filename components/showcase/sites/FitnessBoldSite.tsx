"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  AnimatePresence,
  useInView,
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
   - Coaches: names slide across as you pass; portraits tear open.
   - Schedule: day tabs with the classes swapping in.
   - Pricing: plans kick up and straighten as they arrive.
   - Finale: the call to action zooms out of giant type as red floods in.
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

      <Coaches dynamic={dynamic} />
      <Schedule dynamic={dynamic} />
      <Pricing dynamic={dynamic} />
      <Finale dynamic={dynamic} />

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
  // One trigger for the whole band, so a fast scroll can't skip a number.
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const shown = { opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" };
  const hidden = { opacity: 0, scale: 2.2, rotate: -6, filter: "blur(12px)" };
  return (
    <section ref={ref} className="overflow-hidden border-y border-[var(--s-line)] bg-[var(--s-accent)] text-white">
      <dl className="mx-auto grid max-w-[1500px] grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map((n, i) => (
          <motion.div
            key={n.l}
            className={`px-5 py-12 sm:px-10 sm:py-16 ${i % 2 ? "border-l border-white/25" : ""} ${i > 1 ? "border-t border-white/25 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}
            initial={dynamic ? hidden : false}
            animate={!dynamic || inView ? shown : hidden}
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

/* ── Coaches ─────────────────────────────────────────────────────────────── */

const COACHES = [
  { img: "/showcase/fitness-bold/coach.jpg", name: "Vikram Rao", role: "Head of strength", note: "Former national powerlifter. 270 kg deadlift. Teaches the lift before the load." },
  { img: "/showcase/fitness-bold/fight.jpg", name: "Arjun Das", role: "Head of combat", note: "Pro MMA record 9–2. Runs the fight floor and every sparring session." },
  { img: "/showcase/fitness-bold/ropes.jpg", name: "Sana Qureshi", role: "Conditioning", note: "HYROX podium finisher. Builds engines that don't quit at minute forty." },
];

function CoachRow({ coach, index, dynamic }: { coach: (typeof COACHES)[number]; index: number; dynamic: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, ["start end", "end start"]);
  const dir = index % 2 ? 1 : -1;
  const nameX = useTransform(p, [0, 1], [`${-dir * 18}%`, `${dir * 18}%`]);
  const clip = useTransform(p, [0.05, 0.4], ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"]);
  const imgScale = useTransform(p, [0, 1], [1.25, 1]);

  return (
    <div ref={ref} className="relative overflow-hidden border-t border-[var(--s-line)] py-14 sm:py-20">
      <motion.p
        aria-hidden
        className={`${display} pointer-events-none whitespace-nowrap text-[clamp(5rem,16vw,15rem)] leading-none text-transparent [-webkit-text-stroke:2px_var(--s-line)]`}
        style={dynamic ? { x: nameX } : { x: "0%" }}
      >
        {coach.name} · {coach.name}
      </motion.p>
      <div className={`relative mx-auto -mt-[clamp(3rem,9vw,8rem)] grid max-w-[1400px] items-end gap-8 px-5 sm:px-10 md:grid-cols-[0.8fr_1fr] ${index % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
        <motion.div className="relative aspect-[4/5] max-w-[440px] overflow-hidden" style={{ clipPath: dynamic ? clip : "none" }}>
          <motion.div className="absolute inset-0" style={dynamic ? { scale: imgScale } : { scale: 1 }}>
            <Image src={coach.img} alt={coach.name} fill sizes="(min-width: 768px) 440px, 90vw" className="object-cover grayscale contrast-125" />
          </motion.div>
          <span className="absolute left-0 top-0 h-2 w-24 bg-[var(--s-accent)]" aria-hidden />
        </motion.div>
        <div className="pb-4">
          <p className="text-[13px] font-bold uppercase tracking-[0.24em] text-[var(--s-accent-ink)]">{coach.role}</p>
          <h3 className={`${display} mt-3 text-[clamp(3rem,6vw,5.5rem)] leading-[0.9] text-[var(--s-fg)]`}>{coach.name}</h3>
          <p className="mt-5 max-w-md text-[17px] font-medium leading-relaxed text-[var(--s-muted)]">{coach.note}</p>
        </div>
      </div>
    </div>
  );
}

function Coaches({ dynamic }: { dynamic: boolean }) {
  return (
    <section id="coaches" className="pt-24 sm:pt-32">
      <div className="mx-auto max-w-[1400px] px-5 pb-12 sm:px-10">
        <h2 className={`${display} text-[clamp(3.4rem,9vw,8.5rem)] leading-[0.86] text-[var(--s-fg)]`}>
          Coached by people<br /><span className="text-[var(--s-accent-ink)]">who&apos;ve done it.</span>
        </h2>
      </div>
      {COACHES.map((c, i) => (
        <CoachRow key={c.name} coach={c} index={i} dynamic={dynamic} />
      ))}
    </section>
  );
}

/* ── Schedule ────────────────────────────────────────────────────────────── */

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];
type Slot = { t: string; c: string; who: string; heat: 1 | 2 | 3 };
const STRENGTH: Slot = { t: "06:30", c: "Strength: heavy lower", who: "Vikram", heat: 3 };
const BOX_AM: Slot = { t: "07:00", c: "Boxing fundamentals", who: "Arjun", heat: 2 };
const COND: Slot = { t: "18:00", c: "Conditioning: engine", who: "Sana", heat: 3 };
const MMA: Slot = { t: "19:00", c: "MMA & sparring", who: "Arjun", heat: 3 };
const HYB: Slot = { t: "20:00", c: "Hybrid: race prep", who: "Sana", heat: 2 };
const MOB: Slot = { t: "08:00", c: "Mobility reset", who: "Vikram", heat: 1 };
const SCHEDULE: Record<Day, Slot[]> = {
  Mon: [STRENGTH, BOX_AM, COND, MMA],
  Tue: [BOX_AM, { ...STRENGTH, c: "Strength: heavy upper" }, HYB, MMA],
  Wed: [STRENGTH, BOX_AM, COND, MMA],
  Thu: [BOX_AM, { ...STRENGTH, c: "Strength: heavy upper" }, HYB, MMA],
  Fri: [STRENGTH, BOX_AM, COND, { ...MMA, c: "Fight night: open sparring" }],
  Sat: [{ ...COND, t: "08:00", c: "Saturday sled & rope" }, { ...HYB, t: "10:00" }, { ...MMA, t: "17:00", c: "Open mat" }],
  Sun: [MOB, { ...STRENGTH, t: "10:00", c: "Open floor: lift what you like", heat: 1 }],
};

function Heat({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex gap-1" aria-label={`Intensity ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`h-3 w-1.5 -skew-x-[18deg] ${n <= level ? "bg-[var(--s-accent)]" : "bg-[var(--s-line)]"}`} />
      ))}
    </span>
  );
}

function Schedule({ dynamic }: { dynamic: boolean }) {
  const [day, setDay] = useState<Day>("Mon");
  return (
    <section className="border-t border-[var(--s-line)] bg-[var(--s-surface)] transition-colors duration-500">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-10 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${display} text-[clamp(3.4rem,8vw,7rem)] leading-[0.86] text-[var(--s-fg)]`}>This week</h2>
          <div role="tablist" aria-label="Day" className="flex flex-wrap gap-1">
            {DAYS.map((d) => (
              <button
                key={d}
                role="tab"
                aria-selected={day === d}
                onClick={() => setDay(d)}
                className={`relative h-11 min-w-[3.25rem] -skew-x-[12deg] px-3 text-[13px] font-bold uppercase tracking-[0.14em] transition-colors ${day === d ? "text-white" : "text-[var(--s-muted)] hover:text-[var(--s-fg)]"}`}
              >
                {day === d && <motion.span layoutId={dynamic ? "day-pill" : undefined} className="absolute inset-0 bg-[var(--s-accent)]" transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
                <span className="relative inline-block skew-x-[12deg]">{d}</span>
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={day}
            role="tabpanel"
            className="mt-12 border-t border-[var(--s-line)]"
            initial={dynamic ? { opacity: 0, x: 40 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={dynamic ? { opacity: 0, x: -40 } : { opacity: 1 }}
            transition={{ duration: dynamic ? 0.25 : 0, ease: [0.16, 1, 0.3, 1] }}
          >
            {SCHEDULE[day].map((slot) => (
              <li key={slot.t + slot.c} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 border-b border-[var(--s-line)] py-5 sm:grid-cols-[7rem_1fr_10rem_auto] sm:gap-8">
                <span className={`${display} text-[clamp(1.6rem,3vw,2.4rem)] leading-none text-[var(--s-accent-ink)]`}>{slot.t}</span>
                <span className={`${display} text-[clamp(1.3rem,2.6vw,2.2rem)] leading-tight text-[var(--s-fg)]`}>{slot.c}</span>
                <span className="hidden text-[14px] font-bold uppercase tracking-[0.16em] text-[var(--s-muted)] sm:block">{slot.who}</span>
                <Heat level={slot.heat} />
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ── Pricing ─────────────────────────────────────────────────────────────── */

const PLANS = [
  { name: "Open gym", price: "₹2,999", perks: ["Floor access, 24/7", "Locker & showers", "Day-one assessment"] },
  { name: "Unlimited", price: "₹4,999", perks: ["Everything in Open gym", "Every class, every day", "Monthly progress check"], featured: true },
  { name: "Fight camp", price: "₹7,999", perks: ["Everything in Unlimited", "8 private fight sessions", "Sparring & fight-night entry"] },
];

function PlanCard({ plan, index, progress, dynamic }: { plan: (typeof PLANS)[number]; index: number; progress: MotionValue<number>; dynamic: boolean }) {
  const y = useTransform(progress, [0, 1], [180 + index * 70, 0]);
  const rotate = useTransform(progress, [0, 1], [index === 1 ? -6 : index === 0 ? -10 : 10, 0]);
  return (
    <motion.div
      style={dynamic ? { y, rotate } : { y: 0, rotate: 0 }}
      className={`relative flex flex-col p-8 sm:p-10 ${plan.featured ? "bg-[var(--s-accent)] text-white" : "border border-[var(--s-line)] bg-[var(--s-bg)] text-[var(--s-fg)]"}`}
    >
      {plan.featured && (
        <span className="absolute -top-4 left-8 -skew-x-[12deg] bg-[var(--s-fg)] px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.2em] text-[var(--s-bg)]">
          <span className="inline-block skew-x-[12deg]">Most picked</span>
        </span>
      )}
      <h3 className={`${display} text-[2.4rem] leading-none`}>{plan.name}</h3>
      <p className="mt-6 flex items-baseline gap-2">
        <span className={`${display} text-[clamp(3.6rem,6vw,5rem)] leading-none`}>{plan.price}</span>
        <span className={`text-sm font-bold uppercase tracking-[0.14em] ${plan.featured ? "text-white/80" : "text-[var(--s-muted)]"}`}>/ month</span>
      </p>
      <ul className={`mt-8 flex flex-1 flex-col border-t ${plan.featured ? "border-white/30" : "border-[var(--s-line)]"}`}>
        {plan.perks.map((perk) => (
          <li key={perk} className={`border-b py-4 text-[15px] font-semibold ${plan.featured ? "border-white/30" : "border-[var(--s-line)]"}`}>{perk}</li>
        ))}
      </ul>
      <a
        href={JOIN}
        className={`mt-8 inline-flex h-12 -skew-x-[12deg] items-center justify-center text-[13px] font-bold uppercase tracking-[0.2em] transition-colors ${plan.featured ? "bg-white text-[#0A0A0A] hover:bg-black hover:text-white" : "bg-[var(--s-fg)] text-[var(--s-bg)] hover:bg-[var(--s-accent)] hover:text-white"}`}
      >
        <span className="skew-x-[12deg]">Start {plan.name}</span>
      </a>
    </motion.div>
  );
}

function Pricing({ dynamic }: { dynamic: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, ["start end", "center 0.6"]);
  return (
    <section id="pricing" className="overflow-hidden border-t border-[var(--s-line)]">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-10 sm:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className={`${display} text-[clamp(3.4rem,8vw,7rem)] leading-[0.86] text-[var(--s-fg)]`}>
            No contracts.<br /><span className="text-[var(--s-accent-ink)]">No mercy.</span>
          </h2>
          <p className="max-w-sm text-[17px] font-medium text-[var(--s-muted)]">Monthly plans. Cancel any time. Your first session is free.</p>
        </div>
        <div ref={ref} className="mt-16 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} progress={p} dynamic={dynamic} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Finale ──────────────────────────────────────────────────────────────── */

function Finale({ dynamic }: { dynamic: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, ["start start", "end end"]);
  const scale = useTransform(p, [0, 0.6], [4.5, 1]);
  const flood = useTransform(p, [0.35, 0.75], ["0%", "100%"]);
  const ctaOpacity = useTransform(p, [0.65, 0.85], [0, 1]);
  const ctaY = useTransform(p, [0.65, 0.85], [30, 0]);

  if (!dynamic) {
    return (
      <section ref={ref} className="flex min-h-[80svh] flex-col items-center justify-center bg-[var(--s-accent)] px-6 py-24 text-center text-white">
        <h2 className={`${display} text-[clamp(4rem,13vw,12rem)] leading-[0.86]`}>No excuses.<br />Start Monday.</h2>
        <a href={JOIN} className="mt-10 inline-flex h-14 -skew-x-[12deg] items-center bg-white px-10 text-[14px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]">
          <span className="skew-x-[12deg]">Claim your free session</span>
        </a>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[220svh] bg-black">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-x-0 bottom-0 bg-[var(--s-accent)]" style={{ height: flood }} aria-hidden />
        <div className="relative flex flex-col items-center px-6 text-center text-white">
          <motion.h2 className={`${display} text-[clamp(4rem,13vw,12rem)] leading-[0.86]`} style={{ scale }}>
            No excuses.<br />Start Monday.
          </motion.h2>
          <motion.a
            href={JOIN}
            className="mt-10 inline-flex h-14 -skew-x-[12deg] items-center bg-white px-10 text-[14px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A] transition-colors hover:bg-black hover:text-white"
            style={{ opacity: ctaOpacity, y: ctaY }}
          >
            <span className="skew-x-[12deg]">Claim your free session</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
