"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, Car, Check, ChefHat, Flower2, Snowflake, Users } from "lucide-react";
import { Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a function hall & lawns. The venue is fictional; enquiry
   buttons lead to Zev's page for local businesses. */

const ENQUIRE = "/for/local-business?utm_source=showcase&utm_medium=events";

const SPACES = [
  { name: "The Grand Hall", guests: "800", note: "Fully air-conditioned, stage, bridal suites" },
  { name: "Banyan Lawns", guests: "1,500", note: "Open-air, fairy lights, mandap-ready" },
  { name: "The Durbar Room", guests: "150", note: "For engagements, birthdays and poojas" },
];

const OCCASIONS = ["Weddings", "Receptions", "Mehendi & sangeet", "Engagements", "Birthdays", "Corporate dinners", "Naming ceremonies"];

const INCLUDED = [
  { icon: ChefHat, text: "In-house veg & non-veg catering" },
  { icon: Flower2, text: "Décor partners for every theme" },
  { icon: Snowflake, text: "Power backup and full AC" },
  { icon: Car, text: "Valet parking for 300 cars" },
];

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[14px] font-semibold uppercase tracking-[0.12em] transition-all duration-300";

/** A pretend availability check: weekends in the wedding season read as busy. */
function availability(date: string) {
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const busy = (d.getDay() === 0 || d.getDay() === 6) && [10, 11, 0, 1].includes(d.getMonth());
  return busy ? "Lawns booked, the Grand Hall is free" : "All three spaces are free";
}

export function EventsSite() {
  const { dynamic } = useShowcaseMode();
  const [date, setDate] = useState("");
  const result = date ? availability(date) : null;

  return (
    <div className="font-[family-name:var(--font-body)]">
      {/* Hero */}
      <section className="relative min-h-[92svh] overflow-hidden text-[#FBF3E6]">
        <Parallax className="absolute inset-0" distance={60}>
          <Image src="/showcase/events/hero.jpg" alt="The Grand Hall set for a reception" fill priority sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,8,10,0.35),rgba(20,8,10,0.85))]" aria-hidden />

        <header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-wide">Rajmahal <span className="italic opacity-80">Gardens</span></span>
          <a href={ENQUIRE} className={`${btn} h-10 border border-[#E2B65C]/60 px-5 text-[12px] text-[#F3D58F] hover:bg-[#E2B65C]/10`}>Enquire</a>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(92svh-5rem)] max-w-4xl flex-col items-center justify-center px-5 pb-16 text-center sm:px-8">
          <Reveal>
            <p className="text-[13px] uppercase tracking-[0.32em] text-[#F3D58F]">Function hall & lawns · Attapur</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(3.2rem,9vw,7.5rem)] font-medium leading-[0.95]">
              Where Hyderabad <span className="italic text-[#F3D58F]">celebrates.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#FBF3E6]/85">
              A grand hall, open lawns and an intimate durbar room, with catering and décor handled under one roof.
            </p>
          </Reveal>
          <Reveal delay={0.28} className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="#date" className={`${btn} bg-[#E2B65C] text-[#2A1418] hover:brightness-105`}>
              <CalendarHeart className="h-4 w-4" strokeWidth={2} /> Check a date
            </a>
            <a href="#spaces" className={`${btn} border border-[#FBF3E6]/40 hover:bg-white/10`}>See the spaces</a>
          </Reveal>
        </div>
      </section>

      {/* Occasions ribbon */}
      <div className="border-b border-[var(--s-line)] bg-[var(--s-soft)] py-5 transition-colors duration-500">
        <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-2 px-5 font-[family-name:var(--font-display)] text-xl italic text-[var(--s-accent-ink)] sm:px-8">
          {OCCASIONS.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </div>

      {/* Spaces */}
      <section id="spaces" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal className="text-center">
          <p className="text-[13px] uppercase tracking-[0.28em] text-[var(--s-gold)]">Three spaces</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.5rem,5.5vw,4.4rem)] font-medium leading-[1.02]">
            From a hundred guests to fifteen hundred.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {SPACES.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.1}>
              <article className={`group h-full rounded-[4px] border border-[var(--s-line)] bg-[var(--s-surface)] p-8 text-center transition-all duration-500 ${dynamic ? "hover:border-[var(--s-gold)]" : ""}`}>
                <p className="font-[family-name:var(--font-display)] text-[4.5rem] font-medium leading-none text-[var(--s-accent-ink)]">{s.guests}</p>
                <p className="mt-1 text-[12px] uppercase tracking-[0.24em] text-[var(--s-muted)]">guests</p>
                <div className="mx-auto my-6 h-px w-12 bg-[var(--s-gold)]" />
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-medium">{s.name}</h3>
                <p className="mt-2 text-[15px] text-[var(--s-muted)]">{s.note}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery + included */}
      <section className="bg-[var(--s-surface)] transition-colors duration-500">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <Reveal>
            <Parallax className="aspect-square rounded-[4px]" distance={35}>
              <Image src="/showcase/events/garden.jpg" alt="The lawns set for a mehendi evening" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
            </Parallax>
          </Reveal>
          <div>
            <Reveal>
              <p className="text-[13px] uppercase tracking-[0.28em] text-[var(--s-gold)]">Everything handled</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[1.02]">
                You enjoy the day. <span className="italic">We run it.</span>
              </h2>
            </Reveal>
            <ul className="mt-10 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
              {INCLUDED.map((x, i) => (
                <Reveal key={x.text} as="li" delay={i * 0.07} className="flex items-center gap-4 py-4 text-[17px]">
                  <x.icon className="h-5 w-5 shrink-0 text-[var(--s-gold)]" strokeWidth={1.6} />
                  {x.text}
                </Reveal>
              ))}
            </ul>
            <Reveal delay={0.1}>
              <p className="mt-8 text-[15px] text-[var(--s-muted)]">
                Packages from <span className="font-[family-name:var(--font-display)] text-2xl text-[var(--s-fg)]">₹1,250</span> a plate, hall included.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Date check */}
      <section id="date" className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 md:py-28">
        <Reveal>
          <CalendarHeart className="mx-auto h-8 w-8 text-[var(--s-gold)]" strokeWidth={1.4} />
          <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.5rem,5.5vw,4.4rem)] font-medium leading-[1.02]">Is your date free?</h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-[var(--s-muted)]">Pick a date to see which spaces are open, then hold it with a call.</p>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto mt-10 flex max-w-md flex-col items-stretch gap-3 sm:flex-row">
          <label htmlFor="event-date" className="sr-only">Event date</label>
          <input
            id="event-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 flex-1 rounded-full border border-[var(--s-line)] bg-[var(--s-surface)] px-5 text-[15px] text-[var(--s-fg)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-gold)]"
          />
          <a href={ENQUIRE} className={`${btn} bg-[var(--s-accent)] text-[var(--s-on-accent)] hover:brightness-110`}>
            <Users className="h-4 w-4" strokeWidth={2} /> Hold it
          </a>
        </Reveal>
        <div className="mt-6 min-h-[2.5rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            {result && (
              <motion.p
                key={result}
                initial={dynamic ? { opacity: 0, y: 8 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={dynamic ? { opacity: 0, y: -8 } : { opacity: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--s-soft)] px-5 py-2.5 text-[15px] font-medium text-[var(--s-accent-ink)]"
              >
                <Check className="h-4 w-4" strokeWidth={2.4} /> {result}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-xl text-[var(--s-fg)]">Rajmahal <span className="italic">Gardens</span></span>
          <span>A sample website by Zev&apos;s Agency. Rajmahal Gardens is a fictional venue.</span>
        </div>
      </footer>
    </div>
  );
}
