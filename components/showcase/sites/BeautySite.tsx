"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarHeart, MessageCircle, Minus, Plus } from "lucide-react";
import { Float, Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a salon & spa. The salon is fictional; booking buttons
   lead to Zev's page for salons. */

const BOOK = "/for/salons?utm_source=showcase&utm_medium=beauty";

const MENU = [
  {
    group: "Hair",
    items: [
      ["Cut & style", "from ₹900"],
      ["Global colour", "from ₹3,500"],
      ["Balayage", "from ₹6,500"],
      ["Keratin smoothening", "from ₹5,000"],
    ],
  },
  {
    group: "Skin",
    items: [
      ["Signature facial", "₹2,800"],
      ["Hydra glow", "₹4,200"],
      ["De-tan & clean-up", "₹1,200"],
    ],
  },
  {
    group: "Nails",
    items: [
      ["Gel manicure", "₹1,500"],
      ["Spa pedicure", "₹1,400"],
      ["Nail art, per set", "from ₹800"],
    ],
  },
  {
    group: "Bridal",
    items: [
      ["Bridal makeup & hair", "from ₹25,000"],
      ["Pre-bridal package, 4 sittings", "₹18,000"],
      ["Family makeup, per person", "₹4,500"],
    ],
  },
];

export function BeautySite() {
  const { dynamic } = useShowcaseMode();
  const [open, setOpen] = useState(0);

  return (
    <div className="font-[family-name:var(--font-body)]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <span className="font-[family-name:var(--font-display)] text-[26px] tracking-[0.04em]">Maison Noor</span>
        <nav className="hidden items-center gap-9 text-[13px] uppercase tracking-[0.18em] text-[var(--s-muted)] md:flex">
          <a href="#services" className="hover:text-[var(--s-fg)]">Services</a>
          <a href="#bridal" className="hover:text-[var(--s-fg)]">Bridal</a>
          <a href="#book" className="hover:text-[var(--s-fg)]">Visit</a>
        </nav>
        <a href={BOOK} className="inline-flex h-10 items-center rounded-full border border-[var(--s-fg)] px-5 text-[13px] uppercase tracking-[0.14em] transition-colors hover:bg-[var(--s-fg)] hover:text-[var(--s-bg)]">Book</a>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-end gap-10 px-5 pb-20 pt-8 sm:px-8 md:grid-cols-[1.15fr_0.85fr] md:pt-14">
        <div className="md:pb-10">
          <Reveal>
            <p className="text-[13px] uppercase tracking-[0.3em] text-[var(--s-accent-ink)]">Salon & spa · Banjara Hills</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(3.2rem,8vw,6.8rem)] leading-[0.95]">
              Hair, skin <br />& a little <span className="italic text-[var(--s-accent-ink)]">calm.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-[var(--s-muted)]">
              Stylists who listen, colours that suit you, and a cup of something warm while you wait. By appointment and
              walk-in.
            </p>
          </Reveal>
          <Reveal delay={0.26} className="mt-9 flex flex-wrap gap-3">
            <a href={BOOK} className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--s-accent)] px-7 text-[14px] font-medium uppercase tracking-[0.12em] text-[var(--s-on-accent)] transition-all hover:brightness-110">
              <CalendarHeart className="h-4 w-4" /> Book an appointment
            </a>
            <a href={BOOK} className="inline-flex h-12 items-center gap-2 rounded-full border border-[var(--s-line)] px-7 text-[14px] uppercase tracking-[0.12em] transition-colors hover:border-[var(--s-fg)]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="relative">
          <Parallax className="aspect-[4/5] rounded-t-[999px] rounded-b-[24px]" distance={35}>
            <Image src="/showcase/beauty/look.jpg" alt="A guest with freshly styled waves" fill priority sizes="(min-width: 768px) 38vw, 100vw" className="object-cover object-top" />
          </Parallax>
          <Float className="absolute -left-4 bottom-10 sm:-left-10">
            <span className="block rounded-2xl bg-[var(--s-surface)] px-5 py-4 shadow-[0_20px_50px_-24px_var(--s-shadow)]">
              <span className="block font-[family-name:var(--font-display)] text-2xl italic">Walk-ins</span>
              <span className="block text-xs uppercase tracking-[0.14em] text-[var(--s-muted)]">welcome, all day</span>
            </span>
          </Float>
        </Reveal>
      </section>

      {/* Space */}
      <Reveal>
        <Parallax className="mx-auto aspect-[21/9] max-w-6xl rounded-[24px] max-sm:mx-5 max-sm:aspect-[4/3] sm:mx-8 lg:mx-auto" distance={40}>
          <Image src="/showcase/beauty/hero.jpg" alt="The salon's calm, blush-toned interior" fill sizes="100vw" className="object-cover" />
        </Parallax>
      </Reveal>

      {/* Services */}
      <section id="services" className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:py-28">
        <Reveal>
          <p className="text-[13px] uppercase tracking-[0.3em] text-[var(--s-accent-ink)]">Services</p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.6rem,5.2vw,4.2rem)] leading-[1]">The menu, with prices.</h2>
          <p className="mt-5 max-w-sm text-[16px] text-[var(--s-muted)]">No surprises at the counter. Final prices depend on hair length, and we&apos;ll always tell you first.</p>
        </Reveal>
        <div className="border-t border-[var(--s-line)]">
          {MENU.map((m, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={m.group} delay={i * 0.05} className="border-b border-[var(--s-line)]">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between py-6 text-left font-[family-name:var(--font-display)] text-3xl"
                  >
                    {m.group}
                    {isOpen ? <Minus className="h-5 w-5 text-[var(--s-accent)]" /> : <Plus className="h-5 w-5 text-[var(--s-muted)]" />}
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.ul
                      initial={dynamic ? { height: 0, opacity: 0 } : false}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={dynamic ? { height: 0, opacity: 0 } : { opacity: 0 }}
                      transition={{ duration: dynamic ? 0.35 : 0 }}
                      className="overflow-hidden"
                    >
                      {m.items.map(([name, price]) => (
                        <li key={name} className="flex items-baseline justify-between gap-4 pb-4 text-[16px]">
                          <span>{name}</span>
                          <span className="whitespace-nowrap text-[var(--s-muted)]">{price}</span>
                        </li>
                      ))}
                      <li className="h-3" aria-hidden />
                    </motion.ul>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Bridal */}
      <section id="bridal" className="bg-[var(--s-soft)] transition-colors duration-500">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8 md:py-28">
          <Reveal>
            <p className="text-[13px] uppercase tracking-[0.3em] text-[var(--s-accent-ink)]">Bridal studio</p>
            <h2 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(2.8rem,6.4vw,5.4rem)] leading-[0.98]">
              Your day, your face, <span className="italic">only better.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--s-muted)]">
              A trial look a month before, four pre-bridal sittings, and our artists at your venue on the day. HD and
              airbrush, for every skin tone.
            </p>
            <a href={BOOK} className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-[var(--s-fg)] px-8 text-[14px] uppercase tracking-[0.12em] text-[var(--s-bg)] transition-opacity hover:opacity-90">
              Book a bridal trial
            </a>
          </Reveal>
        </div>
      </section>

      {/* Visit */}
      <section id="book" className="mx-auto grid max-w-6xl gap-6 px-5 py-20 sm:px-8 md:grid-cols-3 md:py-24">
        {[
          ["Find us", "Road No. 12, Banjara Hills, Hyderabad. Valet at the door."],
          ["Hours", "Tuesday – Sunday, 10 am – 8 pm. Closed Mondays."],
          ["Book", "Online any time, or WhatsApp us and we'll find you a slot."],
        ].map(([t, b], i) => (
          <Reveal key={t} delay={i * 0.08}>
            <div className="h-full border-t border-[var(--s-fg)] pt-6">
              <h3 className="font-[family-name:var(--font-display)] text-2xl">{t}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-[var(--s-muted)]">{b}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-xl text-[var(--s-fg)]">Maison Noor</span>
          <span>A sample website by Zev&apos;s Agency. Maison Noor is a fictional salon.</span>
        </div>
      </footer>
    </div>
  );
}
