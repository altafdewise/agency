"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Baby, Building2, Car, Dumbbell, Leaf, ShieldCheck, Sofa, Trees, Waves } from "lucide-react";
import { Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a residential project with an interiors arm. The
   developer is fictional; enquiry buttons lead to Zev's page for local businesses. */

const ENQUIRE = "/for/local-business?utm_source=showcase&utm_medium=realestate";

const UNITS = {
  "2 BHK": { area: "1,285 – 1,410 sq ft", price: 1.12, facing: "East & North", note: "Two balconies, a utility area and a study nook." },
  "3 BHK": { area: "1,720 – 1,960 sq ft", price: 1.58, facing: "East & West", note: "Three balconies, a puja room and a servant's room." },
  "4 BHK": { area: "2,640 sq ft", price: 2.35, facing: "Corner units", note: "Private lift lobby and a wraparound deck." },
} as const;
type Unit = keyof typeof UNITS;

const AMENITIES = [
  { icon: Waves, label: "Infinity pool" },
  { icon: Dumbbell, label: "Gym & yoga deck" },
  { icon: Trees, label: "2-acre central park" },
  { icon: Baby, label: "Kids' play zone" },
  { icon: Car, label: "EV-ready parking" },
  { icon: ShieldCheck, label: "3-tier security" },
  { icon: Leaf, label: "Rainwater harvesting" },
  { icon: Building2, label: "Clubhouse, 30,000 sq ft" },
];

const crore = (n: number) => `₹${n.toFixed(2)} Cr`;

export function RealEstateSite() {
  const { dynamic } = useShowcaseMode();
  const [unit, setUnit] = useState<Unit>("3 BHK");
  const [loan, setLoan] = useState(90); // lakhs
  const [years, setYears] = useState(20);
  const rate = 8.5;

  const emi = useMemo(() => {
    const p = loan * 100000;
    const r = rate / 12 / 100;
    const n = years * 12;
    return Math.round((p * r * (1 + r) ** n) / ((1 + r) ** n - 1));
  }, [loan, years]);

  return (
    <div className="font-[family-name:var(--font-body)]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
          Aaranya<span className="text-[var(--s-brass)]">.</span>
        </span>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--s-muted)] md:flex">
          <a href="#homes" className="hover:text-[var(--s-fg)]">Homes</a>
          <a href="#amenities" className="hover:text-[var(--s-fg)]">Amenities</a>
          <a href="#interiors" className="hover:text-[var(--s-fg)]">Interiors</a>
          <a href="#emi" className="hover:text-[var(--s-fg)]">EMI</a>
        </nav>
        <a href={ENQUIRE} className="inline-flex h-10 items-center rounded-full bg-[var(--s-accent)] px-5 text-sm font-semibold text-[var(--s-on-accent)] transition-all hover:brightness-110">Book a site visit</a>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-20 pt-6 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:pt-10">
        <div>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--s-brass)]">Tellapur · Possession Dec 2027</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.9rem,6.8vw,5.6rem)] font-semibold leading-[0.98] tracking-tight">
              Homes that breathe, ten minutes from work.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[var(--s-muted)]">
              2, 3 and 4 BHK residences across four towers, with 70% of the land left open and green. Twelve minutes to
              the Financial District.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-[var(--s-line)] pt-6">
            {[
              ["5.2", "acres"],
              ["70%", "open space"],
              ["412", "homes"],
            ].map(([v, l]) => (
              <div key={l}>
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">{v}</p>
                <p className="text-sm text-[var(--s-muted)]">{l}</p>
              </div>
            ))}
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <Parallax className="aspect-[4/5] rounded-[24px]" distance={40}>
            <Image src="/showcase/realestate/tower.jpg" alt="The residential tower at dusk" fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </Parallax>
        </Reveal>
      </section>

      {/* Homes */}
      <section id="homes" className="bg-[var(--s-surface)] transition-colors duration-500">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.8vw,3.8rem)] font-semibold leading-[1.02] tracking-tight">Choose your home</h2>
            <div role="tablist" aria-label="Home type" className="flex gap-1 rounded-full border border-[var(--s-line)] p-1">
              {(Object.keys(UNITS) as Unit[]).map((u) => (
                <button
                  key={u}
                  role="tab"
                  aria-selected={unit === u}
                  onClick={() => setUnit(u)}
                  className={`relative h-10 rounded-full px-5 text-sm font-semibold transition-colors ${unit === u ? "text-[var(--s-on-accent)]" : "text-[var(--s-muted)] hover:text-[var(--s-fg)]"}`}
                >
                  {unit === u && <motion.span layoutId={dynamic ? "unit-pill" : undefined} className="absolute inset-0 rounded-full bg-[var(--s-accent)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="relative">{u}</span>
                </button>
              ))}
            </div>
          </Reveal>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={unit}
              role="tabpanel"
              initial={dynamic ? { opacity: 0, y: 14 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={dynamic ? { opacity: 0, y: -14 } : { opacity: 1 }}
              transition={{ duration: dynamic ? 0.35 : 0 }}
              className="mt-10 grid gap-px overflow-hidden rounded-[20px] border border-[var(--s-line)] bg-[var(--s-line)] sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                ["Super built-up", UNITS[unit].area],
                ["Starting at", crore(UNITS[unit].price)],
                ["Facing", UNITS[unit].facing],
                ["Highlights", UNITS[unit].note],
              ].map(([k, v]) => (
                <div key={k} className="bg-[var(--s-bg)] p-6 transition-colors duration-500">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--s-muted)]">{k}</p>
                  <p className={`mt-3 ${k === "Highlights" ? "text-[15px] leading-relaxed" : "font-[family-name:var(--font-display)] text-2xl font-semibold"}`}>{v}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
          <Reveal className="mt-6">
            <a href={ENQUIRE} className="text-[15px] font-semibold text-[var(--s-accent-ink)] underline-offset-4 hover:underline">Download the {unit} floor plan →</a>
          </Reveal>
        </div>
      </section>

      {/* Amenities */}
      <section id="amenities" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal>
          <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.8vw,3.8rem)] font-semibold leading-[1.02] tracking-tight">Everything a weekend needs, downstairs.</h2>
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {AMENITIES.map((a, i) => (
            <Reveal key={a.label} as="li" delay={i * 0.05}>
              <span className={`flex h-full flex-col gap-4 rounded-[18px] border border-[var(--s-line)] p-5 transition-all duration-300 ${dynamic ? "hover:border-[var(--s-brass)]" : ""}`}>
                <a.icon className="h-6 w-6 text-[var(--s-brass)]" strokeWidth={1.6} />
                <span className="text-[15px] font-semibold">{a.label}</span>
              </span>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Interiors */}
      <section id="interiors" className="relative overflow-hidden">
        <Parallax className="aspect-[4/3] sm:aspect-[21/9]" distance={50}>
          <Image src="/showcase/realestate/interior.jpg" alt="A living room designed by Aaranya Interiors" fill sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" aria-hidden />
        <div className="absolute inset-0 mx-auto flex max-w-6xl items-center px-5 sm:px-8">
          <Reveal className="max-w-md text-white">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#D9B97E]"><Sofa className="h-4 w-4" /> Aaranya Interiors</p>
            <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.02] tracking-tight">Move in to a finished home.</h2>
            <p className="mt-4 hidden text-[16px] leading-relaxed text-white/80 sm:block">Modular kitchen, wardrobes and full interiors, designed with you and ready on handover day.</p>
          </Reveal>
        </div>
      </section>

      {/* EMI */}
      <section id="emi" className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.8vw,3.8rem)] font-semibold leading-[1.02] tracking-tight">What would it cost each month?</h2>
          <p className="mt-4 max-w-md text-[17px] text-[var(--s-muted)]">A quick estimate at {rate}% a year. Our team will help you compare bank offers on your visit.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="rounded-[24px] border border-[var(--s-line)] bg-[var(--s-surface)] p-7 transition-colors duration-500">
            <label htmlFor="loan" className="flex items-baseline justify-between text-sm font-semibold">
              Loan amount <span className="font-[family-name:var(--font-display)] text-xl">₹{loan} lakh</span>
            </label>
            <input id="loan" type="range" min={20} max={200} step={5} value={loan} onChange={(e) => setLoan(Number(e.target.value))} className="mt-3 w-full accent-[var(--s-accent)]" />
            <label htmlFor="years" className="mt-6 flex items-baseline justify-between text-sm font-semibold">
              Tenure <span className="font-[family-name:var(--font-display)] text-xl">{years} years</span>
            </label>
            <input id="years" type="range" min={5} max={30} step={1} value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-3 w-full accent-[var(--s-accent)]" />
            <div className="mt-8 border-t border-[var(--s-line)] pt-6">
              <p className="text-sm text-[var(--s-muted)]">Estimated EMI</p>
              <motion.p key={emi} initial={dynamic ? { opacity: 0.4, y: 6 } : false} animate={{ opacity: 1, y: 0 }} className="mt-1 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight">
                ₹{emi.toLocaleString("en-IN")}
                <span className="ml-1 text-base font-normal text-[var(--s-muted)]">/ month</span>
              </motion.p>
            </div>
            <a href={ENQUIRE} className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--s-accent)] text-[15px] font-semibold text-[var(--s-on-accent)] transition-all hover:brightness-110">
              Book a site visit
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--s-fg)]">Aaranya<span className="text-[var(--s-brass)]">.</span></span>
          <span>A sample website by Zev&apos;s Agency. Aaranya is a fictional project; figures are illustrative.</span>
        </div>
      </footer>
    </div>
  );
}
