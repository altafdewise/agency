"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Bike, Clock, Coffee, Croissant, MapPin, UtensilsCrossed, Users } from "lucide-react";
import { Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a café & bakery. The business is fictional; order and
   reserve buttons lead to Zev's page for cafés. */

const ORDER = "/for/cafes?utm_source=showcase&utm_medium=food";

const MENU = {
  Coffee: [
    { name: "Filter kaapi", note: "Chikmagalur beans, brass-tumbler strong", price: 90 },
    { name: "Iced jaggery latte", note: "Double shot, cold milk, palm jaggery", price: 180 },
    { name: "Cardamom cold brew", note: "Steeped 18 hours, a hint of elaichi", price: 200 },
    { name: "Hot chocolate", note: "70% dark, made thick", price: 190 },
  ],
  Bakes: [
    { name: "Butter croissant", note: "Laminated over three days", price: 160 },
    { name: "Cardamom bun", note: "Swedish knot, Indian spice", price: 140 },
    { name: "Sourdough loaf", note: "Baked every morning at 6", price: 260 },
    { name: "Osmania tiramisu", note: "Our city's biscuit, in an Italian classic", price: 240 },
  ],
  Plates: [
    { name: "Chicken 65 bao", note: "Two buns, curry leaf mayo", price: 320 },
    { name: "Podi avocado toast", note: "Sourdough, gunpowder, a soft egg", price: 290 },
    { name: "Paneer tikka sandwich", note: "Pressed, with mint chutney", price: 260 },
    { name: "Mango lassi", note: "Seasonal Banganapalli", price: 150 },
  ],
} as const;
type Tab = keyof typeof MENU;
const TAB_ICON = { Coffee, Bakes: Croissant, Plates: UtensilsCrossed } as const;

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-all duration-300";

export function FoodSite() {
  const { dynamic } = useShowcaseMode();
  const [tab, setTab] = useState<Tab>("Coffee");

  return (
    <div className="font-[family-name:var(--font-body)]">
      {/* Hero: full-bleed photo */}
      <section className="relative min-h-[88svh] overflow-hidden text-white">
        <Parallax className="absolute inset-0" distance={70}>
          <Image src="/showcase/food/hero.jpg" alt="Inside the café at golden hour" fill priority sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/70" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" aria-hidden />

        <header className="relative z-10 mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-2xl">Kaapi & Crumb</span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-white/80 md:flex">
            <a href="#menu" className="hover:text-white">Menu</a>
            <a href="#story" className="hover:text-white">Our story</a>
            <a href="#visit" className="hover:text-white">Visit</a>
          </nav>
          <a href={ORDER} className={`${btn} h-10 bg-white px-5 text-sm text-neutral-900 hover:bg-white/90`}>Order online</a>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(88svh-5rem)] max-w-6xl flex-col justify-end px-5 pb-16 sm:px-8 sm:pb-20">
          <Reveal>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">Café & bakery · Jubilee Hills</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,6.5rem)] leading-[0.98]">
              Strong kaapi. Warm bakes. Long afternoons.
            </h1>
          </Reveal>
          <Reveal delay={0.16} className="mt-8 flex flex-wrap gap-3">
            <a href={ORDER} className={`${btn} bg-[var(--s-accent)] text-[var(--s-on-accent)] hover:brightness-110`}>
              <Bike className="h-[18px] w-[18px]" strokeWidth={2} /> Order for delivery
            </a>
            <a href={ORDER} className={`${btn} border border-white/40 text-white hover:bg-white/10`}>
              <Users className="h-[18px] w-[18px]" strokeWidth={2} /> Reserve a table
            </a>
          </Reveal>
        </div>
      </section>

      {/* Ribbon */}
      <div className="overflow-hidden border-b border-[var(--s-line)] bg-[var(--s-soft)] py-4 transition-colors duration-500">
        <motion.div
          className="flex w-max gap-10 whitespace-nowrap font-[family-name:var(--font-display)] text-xl text-[var(--s-accent-ink)]"
          animate={dynamic ? { x: ["0%", "-50%"] } : { x: "0%" }}
          transition={dynamic ? { duration: 28, repeat: Infinity, ease: "linear" } : { duration: 0 }}
        >
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Fresh bakes from 7 am", "Filter kaapi all day", "Laptop-friendly tables", "Pet-friendly patio", "Custom cakes on order", "Weekend brunch"].map((t) => (
              <span key={`${k}-${t}`} className="flex items-center gap-10">
                {t} <span className="h-1.5 w-1.5 rounded-full bg-[var(--s-accent)]" aria-hidden />
              </span>
            ))
          )}
        </motion.div>
      </div>

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_1.1fr]">
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--s-accent-ink)]">The menu</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.3rem,4.8vw,3.8rem)] leading-[1.02]">
                Small menu. Everything made here.
              </h2>
            </Reveal>
            <Reveal delay={0.1} className="mt-8 grid grid-cols-2 gap-4">
              <div className="relative aspect-square overflow-hidden rounded-3xl">
                <Image src="/showcase/food/coffee.jpg" alt="Filter coffee, a croissant and cardamom cake" fill sizes="(min-width: 768px) 22vw, 50vw" className={`object-cover transition-transform duration-700 ${dynamic ? "hover:scale-105" : ""}`} />
              </div>
              <div className="relative mt-10 aspect-square overflow-hidden rounded-3xl">
                <Image src="/showcase/food/bao.jpg" alt="Chicken 65 bao buns and a mango lassi" fill sizes="(min-width: 768px) 22vw, 50vw" className={`object-cover transition-transform duration-700 ${dynamic ? "hover:scale-105" : ""}`} />
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.05}>
            <div role="tablist" aria-label="Menu sections" className="flex gap-2 rounded-full border border-[var(--s-line)] bg-[var(--s-surface)] p-1.5">
              {(Object.keys(MENU) as Tab[]).map((t) => {
                const Icon = TAB_ICON[t];
                const active = t === tab;
                return (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t)}
                    className={`relative flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors ${active ? "text-[var(--s-on-accent)]" : "text-[var(--s-muted)] hover:text-[var(--s-fg)]"}`}
                  >
                    {active && (
                      <motion.span
                        layoutId={dynamic ? "menu-pill" : undefined}
                        className="absolute inset-0 rounded-full bg-[var(--s-accent)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon className="relative h-4 w-4" strokeWidth={2} />
                    <span className="relative">{t}</span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.ul
                key={tab}
                role="tabpanel"
                className="mt-6 divide-y divide-[var(--s-line)]"
                initial={dynamic ? { opacity: 0, y: 12 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={dynamic ? { opacity: 0, y: -12 } : { opacity: 1 }}
                transition={{ duration: dynamic ? 0.3 : 0 }}
              >
                {MENU[tab].map((item) => (
                  <li key={item.name} className="flex items-baseline gap-4 py-5">
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold tracking-tight">{item.name}</span>
                      <span className="mt-1 block text-[15px] text-[var(--s-muted)]">{item.note}</span>
                    </span>
                    <span className="hidden flex-1 border-b border-dashed border-[var(--s-line)] sm:block" aria-hidden />
                    <span className="font-[family-name:var(--font-display)] text-xl text-[var(--s-accent-ink)]">₹{item.price}</span>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
            <a href={ORDER} className={`${btn} mt-8 w-full bg-[var(--s-fg)] text-[var(--s-bg)] hover:opacity-90`}>
              See the full menu & order
            </a>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="bg-[var(--s-surface)] transition-colors duration-500">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:py-28">
          <Reveal>
            <Parallax className="aspect-[4/5] rounded-[28px]" distance={35}>
              <Image src="/showcase/food/baker.jpg" alt="Our baker shaping sourdough loaves" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </Parallax>
          </Reveal>
          <div>
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--s-accent-ink)]">Our story</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.3rem,4.8vw,3.8rem)] leading-[1.02]">
                It started with one oven and a lot of kaapi.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--s-muted)]">
                Meera baked croissants from her home kitchen for two years before the neighbourhood asked for a table to
                eat them at. Today the oven runs from 5 am, the coffee comes from one estate in Chikmagalur, and the
                Osmania tiramisu sells out by four.
              </p>
            </Reveal>
            <Reveal delay={0.16} className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--s-line)] pt-8">
              {[
                ["5 am", "oven on"],
                ["1", "coffee estate"],
                ["32", "seats & a patio"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--s-accent-ink)]">{v}</p>
                  <p className="mt-1 text-sm text-[var(--s-muted)]">{l}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal className="text-center">
          <h2 className="mx-auto max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.3rem,5.4vw,4.4rem)] leading-[1.02]">
            Pull up a chair, or we&apos;ll bring it to you.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { icon: MapPin, title: "Find us", body: "Road No. 36, Jubilee Hills, Hyderabad. Above the bookshop." },
            { icon: Clock, title: "Open daily", body: "7:00 am – 11:00 pm. Brunch on weekends till 3 pm." },
            { icon: Bike, title: "Delivery", body: "On Swiggy and Zomato, or order direct for 10% less." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className={`h-full rounded-3xl border border-[var(--s-line)] bg-[var(--s-surface)] p-7 transition-all duration-300 ${dynamic ? "hover:-translate-y-1" : ""}`}>
                <c.icon className="h-6 w-6 text-[var(--s-accent)]" strokeWidth={1.8} />
                <h3 className="mt-5 text-lg font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[var(--s-muted)]">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={ORDER} className={`${btn} bg-[var(--s-accent)] text-[var(--s-on-accent)] hover:brightness-110`}>
            <Bike className="h-[18px] w-[18px]" strokeWidth={2} /> Order now
          </a>
          <a href={ORDER} className={`${btn} border border-[var(--s-line)] hover:border-[var(--s-muted)]`}>
            <Users className="h-[18px] w-[18px]" strokeWidth={2} /> Reserve a table
          </a>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-lg text-[var(--s-fg)]">Kaapi & Crumb</span>
          <span>A sample website by Zev&apos;s Agency. Kaapi & Crumb is a fictional café.</span>
        </div>
      </footer>
    </div>
  );
}
