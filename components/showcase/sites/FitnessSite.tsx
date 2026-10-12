"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Dumbbell, Flame, HeartPulse, StretchHorizontal, Timer, Trophy } from "lucide-react";
import { Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a gym. The gym is fictional; join and trial buttons lead
   to Zev's page for gyms. */

const JOIN = "/for/gyms?utm_source=showcase&utm_medium=fitness";

const PROGRAMS = [
  { icon: Dumbbell, name: "Strength", body: "Barbells, racks and a coach who fixes your form." },
  { icon: Flame, name: "HIIT & cardio", body: "45 minutes, every muscle, no mirrors needed." },
  { icon: Trophy, name: "Personal training", body: "Your plan, your pace, weekly check-ins." },
  { icon: StretchHorizontal, name: "Yoga & mobility", body: "Undo the desk job. Three batches a day." },
];

const PERIODS = { Monthly: 1, Quarterly: 3, Yearly: 12 } as const;
type Period = keyof typeof PERIODS;
const PLANS = [
  { name: "Floor", perMonth: { Monthly: 2499, Quarterly: 2199, Yearly: 1799 }, perks: ["Full gym floor", "Locker & shower", "Fitness assessment"] },
  { name: "Floor + Classes", perMonth: { Monthly: 3499, Quarterly: 2999, Yearly: 2499 }, perks: ["Everything in Floor", "All group classes", "Diet consult every month"], featured: true },
  { name: "Personal", perMonth: { Monthly: 7999, Quarterly: 6999, Yearly: 5999 }, perks: ["Everything in Classes", "12 PT sessions a month", "Progress tracking"] },
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function FitnessSite() {
  const { dynamic } = useShowcaseMode();
  const [period, setPeriod] = useState<Period>("Quarterly");

  return (
    <div className="font-[family-name:var(--font-body)]">
      {/* Hero */}
      <section className="relative min-h-[90svh] overflow-hidden bg-[#0B0B0B] text-white">
        <Parallax className="absolute inset-0" distance={60}>
          <Image src="/showcase/fitness/hero.jpg" alt="A member deadlifting on the gym floor" fill priority sizes="100vw" className="object-cover opacity-80" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30" aria-hidden />

        <header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-3xl tracking-wide">FORGE<span className="text-[var(--s-accent)]">.</span></span>
          <nav className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-wider text-white/75 md:flex">
            <a href="#programs" className="hover:text-white">Programs</a>
            <a href="#plans" className="hover:text-white">Plans</a>
            <a href="#trial" className="hover:text-white">Free trial</a>
          </nav>
          <a href={JOIN} className="inline-flex h-10 items-center rounded-md bg-[var(--s-accent)] px-5 text-sm font-bold uppercase tracking-wider text-black hover:brightness-110">Join now</a>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(90svh-5rem)] max-w-6xl flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20">
          <Reveal>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--s-accent)]">Strength & conditioning · Kondapur</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(4.2rem,13vw,11rem)] leading-[0.86] tracking-tight">
              STRONGER<br />EVERY WEEK.
            </h1>
          </Reveal>
          <Reveal delay={0.16} className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#trial" className="inline-flex h-12 items-center rounded-md bg-[var(--s-accent)] px-7 text-[15px] font-bold uppercase tracking-wider text-black hover:brightness-110">Claim a free day</a>
            <span className="text-sm text-white/70">Open 5 am – 11 pm · 7 days</span>
          </Reveal>
        </div>
      </section>

      {/* Stats band */}
      <div className="overflow-hidden bg-[var(--s-accent)] py-3 text-black">
        <motion.div
          className="flex w-max gap-12 whitespace-nowrap font-[family-name:var(--font-display)] text-2xl tracking-wide"
          animate={dynamic ? { x: ["0%", "-50%"] } : { x: "0%" }}
          transition={dynamic ? { duration: 22, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        >
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["8,000 sq ft floor", "12 certified coaches", "40+ classes a week", "Steam & recovery", "Free parking", "Women-only hours"].map((t) => (
              <span key={`${k}-${t}`} className="flex items-center gap-12">{t.toUpperCase()} <Flame className="h-5 w-5" /></span>
            ))
          )}
        </motion.div>
      </div>

      {/* Programs */}
      <section id="programs" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] tracking-tight">PICK YOUR<br />FIGHT.</h2>
          <p className="max-w-sm text-[17px] text-[var(--s-muted)]">Four ways to train, one membership. Switch between them whenever you like.</p>
        </Reveal>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-[var(--s-line)] bg-[var(--s-line)] sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06}>
              <div className={`group h-full bg-[var(--s-surface)] p-7 transition-colors duration-300 ${dynamic ? "hover:bg-[var(--s-accent)] hover:text-black" : ""}`}>
                <p.icon className={`h-8 w-8 text-[var(--s-accent)] transition-colors ${dynamic ? "group-hover:text-black" : ""}`} strokeWidth={1.8} />
                <h3 className="mt-8 font-[family-name:var(--font-display)] text-3xl tracking-wide">{p.name.toUpperCase()}</h3>
                <p className={`mt-2 text-[15px] text-[var(--s-muted)] transition-colors ${dynamic ? "group-hover:text-black/75" : ""}`}>{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Coach */}
      <section className="bg-[var(--s-surface)] transition-colors duration-500">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <Reveal>
            <Parallax className="aspect-[4/5] rounded-xl" distance={35}>
              <Image src="/showcase/fitness/coach.jpg" alt="A coach guiding a member through kettlebell swings" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </Parallax>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(3rem,6vw,5rem)] leading-[0.9] tracking-tight">COACHED,<br />NOT JUST<br />CHECKED IN.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[var(--s-muted)]">
                Every member gets an assessment on day one and a coach who knows their name. Your plan updates every four
                weeks, based on what you actually lifted.
              </p>
            </Reveal>
            <Reveal delay={0.16} className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Timer, v: "4 wk", l: "plan cycles" },
                { icon: HeartPulse, v: "Day 1", l: "body assessment" },
                { icon: Trophy, v: "12", l: "certified coaches" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-[var(--s-line)] p-4">
                  <s.icon className="h-5 w-5 text-[var(--s-accent)]" />
                  <p className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-wide">{s.v}</p>
                  <p className="text-xs text-[var(--s-muted)]">{s.l}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal className="text-center">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,5.5rem)] leading-[0.9] tracking-tight">MEMBERSHIP</h2>
          <div role="tablist" aria-label="Billing period" className="mx-auto mt-8 inline-flex rounded-lg border border-[var(--s-line)] bg-[var(--s-surface)] p-1">
            {(Object.keys(PERIODS) as Period[]).map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={`relative h-10 rounded-md px-5 text-sm font-bold uppercase tracking-wider transition-colors ${period === p ? "text-black" : "text-[var(--s-muted)] hover:text-[var(--s-fg)]"}`}
              >
                {period === p && (
                  <motion.span layoutId={dynamic ? "period-pill" : undefined} className="absolute inset-0 rounded-md bg-[var(--s-accent)]" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                )}
                <span className="relative">{p}</span>
              </button>
            ))}
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <div className={`relative flex h-full flex-col rounded-xl border p-7 ${plan.featured ? "border-[var(--s-accent)] bg-[var(--s-surface)]" : "border-[var(--s-line)]"}`}>
                {plan.featured && <span className="absolute -top-3 left-7 rounded bg-[var(--s-accent)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-black">Most picked</span>}
                <h3 className="font-[family-name:var(--font-display)] text-3xl tracking-wide">{plan.name.toUpperCase()}</h3>
                <p className="mt-6 flex items-baseline gap-1.5">
                  <motion.span
                    key={`${plan.name}-${period}`}
                    initial={dynamic ? { opacity: 0, y: 10 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-[family-name:var(--font-display)] text-6xl tracking-wide"
                  >
                    {inr(plan.perMonth[period])}
                  </motion.span>
                  <span className="text-sm text-[var(--s-muted)]">/ month</span>
                </p>
                <p className="mt-1 text-xs text-[var(--s-muted)]">
                  {period === "Monthly" ? "Billed monthly" : `${inr(plan.perMonth[period] * PERIODS[period])} billed every ${PERIODS[period]} months`}
                </p>
                <ul className="mt-6 flex flex-1 flex-col gap-3">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-3 text-[15px]">
                      <Check className="h-4 w-4 shrink-0 text-[var(--s-accent)]" strokeWidth={3} /> {perk}
                    </li>
                  ))}
                </ul>
                <a href={JOIN} className={`mt-8 inline-flex h-12 items-center justify-center rounded-md text-sm font-bold uppercase tracking-wider transition-all ${plan.featured ? "bg-[var(--s-accent)] text-black hover:brightness-110" : "border border-[var(--s-line)] hover:border-[var(--s-fg)]"}`}>
                  Join {plan.name}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trial */}
      <section id="trial" className="bg-[#0B0B0B] px-5 py-20 text-center text-white sm:px-8 md:py-28">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(3.4rem,9vw,7.5rem)] leading-[0.88] tracking-tight">
            YOUR FIRST DAY<br /><span className="text-[var(--s-accent)]">IS ON US.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[17px] text-white/70">Walk in, meet a coach, train a full session. No card, no pressure.</p>
          <a href={JOIN} className="mt-8 inline-flex h-12 items-center rounded-md bg-[var(--s-accent)] px-8 text-[15px] font-bold uppercase tracking-wider text-black hover:brightness-110">Book my free day</a>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-wide text-[var(--s-fg)]">FORGE<span className="text-[var(--s-accent)]">.</span></span>
          <span>A sample website by Zev&apos;s Agency. Forge is a fictional gym.</span>
        </div>
      </footer>
    </div>
  );
}
