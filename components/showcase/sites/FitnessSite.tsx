"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";
import { useScrollProgress } from "@/lib/use-scroll-progress";

/* A sample site for a private strength & wellness club. The club is
   fictional; membership buttons lead to Zev's page for gyms.

   Dynamic mode is scroll-driven: the hero photo grows from a framed card to
   full screen while the headline parts, the manifesto lights up word by
   word, the disciplines slide sideways as you scroll down, the numbers count
   with the scroll and the membership cards glide in. Static mode shows the
   same page, composed and still. */

const JOIN = "/for/gyms?utm_source=showcase&utm_medium=fitness";

const DISCIPLINES = [
  { n: "01", img: "/showcase/fitness/strength.jpg", title: "Strength", body: "Coached barbell work on a floor that's never crowded." },
  { n: "02", img: "/showcase/fitness/pilates.jpg", title: "Reformer Pilates", body: "Classes of six, on hand-built wooden reformers." },
  { n: "03", img: "/showcase/fitness/mobility.jpg", title: "Mobility & yoga", body: "Slow mornings for joints that sit at a desk all day." },
  { n: "04", img: "/showcase/fitness/recovery.jpg", title: "Recovery", body: "Cold plunge, cedar sauna and sports massage." },
];

const NUMBERS = [
  { value: 180, label: "members, at most" },
  { value: 12, label: "certified coaches" },
  { value: 4200, label: "sq ft of quiet floor" },
  { value: 6, label: "people per class" },
];

const TIERS = [
  { name: "Foundation", price: "₹6,500", perks: ["Open floor, 6 am to 10 pm", "Recovery suite twice a month", "Assessment every quarter"] },
  { name: "Club", price: "₹12,000", perks: ["Everything in Foundation", "Unlimited classes", "A plan review every month"], featured: true },
  { name: "Private", price: "₹28,000", perks: ["Everything in Club", "12 private sessions a month", "Unlimited recovery & massage"] },
];

const MANIFESTO =
  "We built Élan for people who train with intention. No crowds, no noise, no queue for the rack. Just a quiet floor, coaches who know your name, and a plan that changes as you do.";

const eyebrow = "text-[12px] font-medium uppercase tracking-[0.32em] text-[var(--s-accent-ink)]";
const serif = "font-[family-name:var(--font-display)] font-normal";

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

export function FitnessSite() {
  const { dynamic } = useShowcaseMode();

  return (
    <div className="font-[family-name:var(--font-body)]">
      {/* Header: reads over ivory and over photos alike. */}
      <header className="fixed inset-x-0 top-0 z-40 text-white mix-blend-difference">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-10">
          <span className={`${serif} text-[22px] tracking-[0.42em]`}>ÉLAN</span>
          <nav className="hidden items-center gap-10 text-[12px] uppercase tracking-[0.28em] md:flex">
            <a href="#club" className="opacity-80 transition-opacity hover:opacity-100">Club</a>
            <a href="#disciplines" className="opacity-80 transition-opacity hover:opacity-100">Disciplines</a>
            <a href="#membership" className="opacity-80 transition-opacity hover:opacity-100">Membership</a>
          </nav>
          <a href={JOIN} className="border-b border-white/60 pb-0.5 text-[12px] uppercase tracking-[0.28em] transition-colors hover:border-white">
            Request a visit
          </a>
        </div>
      </header>

      {dynamic ? <HeroDynamic /> : <HeroStatic />}
      <Manifesto dynamic={dynamic} />
      {dynamic ? <DisciplinesDynamic /> : <DisciplinesStatic />}
      <Numbers dynamic={dynamic} />
      <Coaching />
      <Membership dynamic={dynamic} />
      <Closing dynamic={dynamic} />

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-10 text-sm text-[var(--s-muted)] sm:px-10">
          <span className={`${serif} text-lg tracking-[0.42em] text-[var(--s-fg)]`}>ÉLAN</span>
          <span>A sample website by Zev&apos;s Agency. Élan is a fictional club.</span>
        </div>
      </footer>
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────── */

function HeroDynamic() {
  const ref = useRef<HTMLElement>(null);
  const narrow = useIsNarrow();
  const p = useScrollProgress(ref, ["start start", "end end"]);

  const width = useTransform(p, [0, 0.7], [narrow ? "80vw" : "42vw", "100vw"]);
  const height = useTransform(p, [0, 0.7], [narrow ? "44svh" : "54svh", "100svh"]);
  const radius = useTransform(p, [0, 0.7], [narrow ? 18 : 26, 0]);
  const imgScale = useTransform(p, [0, 1], [1.25, 1]);
  const shade = useTransform(p, [0.45, 0.85], [0, 0.42]);

  const topX = useTransform(p, [0, 0.6], [narrow ? "-6vw" : "-14vw", narrow ? "-16vw" : "-30vw"]);
  const topY = useTransform(p, [0, 0.6], [narrow ? "-31svh" : "-35svh", "-52svh"]);
  const botX = useTransform(p, [0, 0.6], [narrow ? "6vw" : "14vw", narrow ? "16vw" : "30vw"]);
  const botY = useTransform(p, [0, 0.6], [narrow ? "31svh" : "35svh", "52svh"]);
  const wordsOpacity = useTransform(p, [0.18, 0.5], [1, 0]);
  const captionOpacity = useTransform(p, [0, 0.15], [1, 0]);
  const lateOpacity = useTransform(p, [0.72, 0.9], [0, 1]);
  const lateY = useTransform(p, [0.72, 0.95], [40, 0]);

  return (
    <section ref={ref} className="relative h-[240svh]">
      <div className="sticky top-0 flex h-[100svh] items-center justify-center overflow-hidden">
        <motion.div className="relative overflow-hidden" style={{ width, height, borderRadius: radius }}>
          <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
            <Image src="/showcase/fitness/club.jpg" alt="The club's strength floor in walnut and travertine" fill priority sizes="100vw" className="object-cover" />
          </motion.div>
          <motion.div className="absolute inset-0 bg-black" style={{ opacity: shade }} aria-hidden />
          <motion.p
            className={`${serif} absolute inset-x-6 bottom-[14svh] text-center text-[clamp(1.6rem,3.6vw,3.2rem)] leading-[1.15] text-white`}
            style={{ opacity: lateOpacity, y: lateY }}
          >
            By membership only.
            <br />
            Never more than 180 members.
          </motion.p>
        </motion.div>

        <h1 className={`${serif} pointer-events-none absolute inset-0 text-[clamp(3.2rem,10vw,8.5rem)] leading-[0.92] tracking-[-0.01em] text-[var(--s-fg)]`}>
          <span className="absolute inset-0 flex items-center justify-center">
            <motion.span className="block whitespace-nowrap" style={{ x: topX, y: topY, opacity: wordsOpacity }}>
              Strength,
            </motion.span>
          </span>
          <span className="absolute inset-0 flex items-center justify-center">
            <motion.span className="block whitespace-nowrap italic text-[var(--s-accent-ink)]" style={{ x: botX, y: botY, opacity: wordsOpacity }}>
              refined.
            </motion.span>
          </span>
        </h1>

        <motion.p
          className="absolute inset-x-0 bottom-[6svh] text-center text-[12px] uppercase tracking-[0.32em] text-[var(--s-muted)]"
          style={{ opacity: captionOpacity }}
        >
          A private strength & wellness club · Jubilee Hills
        </motion.p>
      </div>
    </section>
  );
}

function HeroStatic() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-32 sm:px-10 sm:pt-40">
      <p className={eyebrow}>A private strength & wellness club · Jubilee Hills</p>
      <h1 className={`${serif} mt-8 text-[clamp(3.6rem,11vw,10rem)] leading-[0.92] tracking-[-0.01em]`}>
        Strength, <span className="italic text-[var(--s-accent-ink)]">refined.</span>
      </h1>
      <div className="relative mt-12 aspect-[16/10] overflow-hidden rounded-[22px] sm:aspect-[21/9]">
        <Image src="/showcase/fitness/club.jpg" alt="The club's strength floor in walnut and travertine" fill priority sizes="100vw" className="object-cover" />
      </div>
      <p className={`${serif} mt-10 text-[clamp(1.5rem,3vw,2.4rem)] leading-snug`}>By membership only. Never more than 180 members.</p>
    </section>
  );
}

/* ── Manifesto: lights up word by word as it passes ──────────────────────── */

function Manifesto({ dynamic }: { dynamic: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(ref, ["start 0.85", "end 0.45"]);
  const words = MANIFESTO.split(" ");

  return (
    <section id="club" className="mx-auto max-w-6xl px-5 py-28 sm:px-10 md:py-44">
      <p className={eyebrow}>The club</p>
      <div ref={ref} className={`${serif} mt-10 text-[clamp(1.9rem,4.6vw,4.1rem)] leading-[1.16]`}>
        <span className="sr-only">{MANIFESTO}</span>
        <span aria-hidden>
          {words.map((w, i) =>
            dynamic ? (
              <Word key={i} progress={p} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>
            ) : (
              <span key={i}>{w} </span>
            )
          )}
        </span>
      </div>
    </section>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}

/* ── Disciplines: slide sideways as you scroll down ──────────────────────── */

function DisciplineCard({ d, className = "" }: { d: (typeof DISCIPLINES)[number]; className?: string }) {
  return (
    <article className={`group relative overflow-hidden rounded-[20px] ${className}`}>
      <Image src={d.img} alt={d.title} fill sizes="(min-width: 768px) 420px, 80vw" className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 p-7 text-white">
        <p className="text-[12px] tracking-[0.3em] text-white/70">{d.n}</p>
        <h3 className={`${serif} mt-3 text-[2.1rem] leading-none`}>{d.title}</h3>
        <p className="mt-3 max-w-[28ch] text-[15px] leading-relaxed text-white/80">{d.body}</p>
      </div>
    </article>
  );
}

function DisciplinesIntro() {
  return (
    <div className="max-w-[24rem]">
      <p className={eyebrow}>Disciplines</p>
      <h2 className={`${serif} mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.02]`}>
        Four disciplines. <span className="italic">One membership.</span>
      </h2>
      <p className="mt-6 text-[16px] leading-relaxed text-[var(--s-muted)]">Move between them as your week asks. Your coach keeps them in one plan.</p>
    </div>
  );
}

function DisciplinesDynamic() {
  const ref = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const distRef = useRef(0);
  const [dist, setDist] = useState(0);

  useEffect(() => {
    const measure = () => {
      const row = rowRef.current;
      if (!row) return;
      distRef.current = Math.max(0, row.scrollWidth - window.innerWidth);
      setDist(distRef.current);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const p = useScrollProgress(ref, ["start start", "end end"]);
  const x = useTransform(p, (v) => -distRef.current * Math.min(1, Math.max(0, (v - 0.04) / 0.92)));
  const bar = useTransform(p, [0.04, 0.96], [0, 1]);

  return (
    <section id="disciplines" ref={ref} className="relative" style={{ height: `calc(100svh + ${dist}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.div ref={rowRef} className="flex w-max items-center gap-6 px-5 sm:gap-8 sm:px-10" style={{ x }}>
          <div className="w-[78vw] shrink-0 sm:w-[30rem]">
            <DisciplinesIntro />
          </div>
          {DISCIPLINES.map((d) => (
            <DisciplineCard key={d.n} d={d} className="aspect-[4/5] w-[76vw] shrink-0 sm:w-[25rem]" />
          ))}
        </motion.div>
        <div className="mx-5 mt-10 h-px bg-[var(--s-line)] sm:mx-10">
          <motion.div className="h-px origin-left bg-[var(--s-fg)]" style={{ scaleX: bar }} />
        </div>
      </div>
    </section>
  );
}

function DisciplinesStatic() {
  return (
    <section id="disciplines" className="mx-auto max-w-7xl px-5 py-24 sm:px-10">
      <DisciplinesIntro />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {DISCIPLINES.map((d) => (
          <DisciplineCard key={d.n} d={d} className="aspect-[4/5]" />
        ))}
      </div>
    </section>
  );
}

/* ── Numbers: count with the scroll ──────────────────────────────────────── */

function Numbers({ dynamic }: { dynamic: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, ["start 0.9", "center 0.5"]);
  return (
    <section ref={ref} className="border-y border-[var(--s-line)] bg-[var(--s-surface)] transition-colors duration-500">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {NUMBERS.map((n, i) => (
          <div key={n.label} className={`px-5 py-14 sm:px-10 sm:py-20 ${i ? "lg:border-l" : ""} ${i % 2 ? "border-l lg:border-l" : ""} ${i > 1 ? "border-t lg:border-t-0" : ""} border-[var(--s-line)]`}>
            <dd className={`${serif} text-[clamp(3rem,6vw,5.4rem)] leading-none`}>
              {dynamic ? <Count to={n.value} progress={p} /> : n.value.toLocaleString("en-IN")}
            </dd>
            <dt className="mt-4 text-[13px] uppercase tracking-[0.24em] text-[var(--s-muted)]">{n.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Count({ to, progress }: { to: number; progress: MotionValue<number> }) {
  const text = useTransform(progress, (v) => Math.round(Math.min(1, Math.max(0, v)) * to).toLocaleString("en-IN"));
  return <motion.span>{text}</motion.span>;
}

/* ── Coaching ────────────────────────────────────────────────────────────── */

function Coaching() {
  return (
    <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-28 sm:px-10 md:grid-cols-[1fr_1fr] md:py-40">
      <div>
        <Reveal>
          <p className={eyebrow}>Coaching</p>
          <h2 className={`${serif} mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.02]`}>
            Coached, <span className="italic">never just supervised.</span>
          </h2>
        </Reveal>
        <ol className="mt-12 border-t border-[var(--s-line)]">
          {["A full assessment on your first day", "A written plan, reviewed every four weeks", "The same coach, session after session"].map((t, i) => (
            <Reveal key={t} as="li" delay={i * 0.08} className="flex items-baseline gap-6 border-b border-[var(--s-line)] py-6">
              <span className="text-[12px] tracking-[0.3em] text-[var(--s-accent-ink)]">0{i + 1}</span>
              <span className={`${serif} text-[clamp(1.3rem,2.2vw,1.8rem)]`}>{t}</span>
            </Reveal>
          ))}
        </ol>
      </div>
      <Reveal>
        <Parallax className="aspect-[4/5] rounded-[22px]" distance={50}>
          <Image src="/showcase/fitness/strength.jpg" alt="A member squatting under a coach's eye" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        </Parallax>
      </Reveal>
    </section>
  );
}

/* ── Membership: cards glide in with the scroll ──────────────────────────── */

function Membership({ dynamic }: { dynamic: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, ["start end", "center 0.55"]);
  return (
    <section id="membership" ref={ref} className="bg-[var(--s-surface)] transition-colors duration-500">
      <div className="mx-auto max-w-7xl px-5 py-28 sm:px-10 md:py-40">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={eyebrow}>Membership</p>
            <h2 className={`${serif} mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1.02]`}>Three ways to belong.</h2>
          </div>
          <p className="max-w-sm text-[16px] leading-relaxed text-[var(--s-muted)]">By application. Every membership begins with a visit and a conversation.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <TierCard key={t.name} tier={t} index={i} progress={p} dynamic={dynamic} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TierCard({ tier, index, progress, dynamic }: { tier: (typeof TIERS)[number]; index: number; progress: MotionValue<number>; dynamic: boolean }) {
  const y = useTransform(progress, [0, 1], [140 + index * 90, 0]);
  const opacity = useTransform(progress, [0, 0.7], [0, 1]);
  return (
    <motion.div
      style={dynamic ? { y, opacity } : { y: 0, opacity: 1 }}
      className={`flex h-full flex-col rounded-[22px] border p-9 ${tier.featured ? "border-[var(--s-fg)] bg-[var(--s-bg)]" : "border-[var(--s-line)]"}`}
    >
      <div className="flex items-baseline justify-between">
        <h3 className={`${serif} text-[2rem]`}>{tier.name}</h3>
        {tier.featured && <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--s-accent-ink)]">Most chosen</span>}
      </div>
      <p className="mt-8 flex items-baseline gap-2">
        <span className={`${serif} text-[3.2rem] leading-none`}>{tier.price}</span>
        <span className="text-sm text-[var(--s-muted)]">a month</span>
      </p>
      <ul className="mt-8 flex flex-1 flex-col border-t border-[var(--s-line)]">
        {tier.perks.map((perk) => (
          <li key={perk} className="border-b border-[var(--s-line)] py-4 text-[15px]">{perk}</li>
        ))}
      </ul>
      <a href={JOIN} className={`mt-9 inline-flex h-12 items-center justify-center gap-2 rounded-full text-[13px] uppercase tracking-[0.22em] transition-colors ${tier.featured ? "bg-[var(--s-fg)] text-[var(--s-bg)] hover:opacity-90" : "border border-[var(--s-fg)] hover:bg-[var(--s-fg)] hover:text-[var(--s-bg)]"}`}>
        Apply <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
      </a>
    </motion.div>
  );
}

/* ── Closing ─────────────────────────────────────────────────────────────── */

function Closing({ dynamic }: { dynamic: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const p = useScrollProgress(ref, ["start end", "end end"]);
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  const opacity = useTransform(p, [0.2, 0.8], [0, 1]);
  return (
    <section ref={ref} className="relative min-h-[90svh] overflow-hidden text-white">
      <Parallax className="absolute inset-0" distance={60}>
        <Image src="/showcase/fitness/recovery.jpg" alt="The recovery suite: cold plunge and cedar sauna" fill sizes="100vw" className="object-cover" />
      </Parallax>
      <div className="absolute inset-0 bg-black/45" aria-hidden />
      <motion.div className="relative z-10 flex min-h-[90svh] flex-col items-center justify-center px-6 text-center" style={dynamic ? { scale, opacity } : { scale: 1, opacity: 1 }}>
        <p className="text-[12px] uppercase tracking-[0.32em] text-white/75">Visits Monday to Saturday</p>
        <h2 className={`${serif} mt-6 text-[clamp(3rem,8vw,7rem)] leading-[0.98]`}>
          Begin with <span className="italic">a visit.</span>
        </h2>
        <a href={JOIN} className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-white px-8 text-[13px] uppercase tracking-[0.22em] text-neutral-900 transition-opacity hover:opacity-90">
          Request a visit <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
        </a>
      </motion.div>
    </section>
  );
}
