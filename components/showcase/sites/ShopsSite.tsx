"use client";

import Image from "next/image";
import { MessageCircle, PackageCheck, Scissors, Truck, Video } from "lucide-react";
import { Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a handloom & ethnic-wear boutique. The shop is
   fictional; order buttons lead to Zev's page for local businesses. */

const ORDER = "/for/local-business?utm_source=showcase&utm_medium=shops";

const COLLECTIONS = [
  { name: "Pochampally ikat", note: "From the looms of Nalgonda", count: "120+ pieces", bg: "var(--s-tile-1)" },
  { name: "Kanchi silk", note: "Pure zari, temple borders", count: "80+ pieces", bg: "var(--s-tile-2)" },
  { name: "Gadwal & Narayanpet", note: "Telangana's own weaves", count: "60+ pieces", bg: "var(--s-tile-3)" },
  { name: "Lehengas", note: "Bridal and festive", count: "40+ pieces", bg: "var(--s-tile-4)" },
];

const SERVICES = [
  { icon: Video, title: "Shop on a video call", body: "We walk you through the store and drape anything you like." },
  { icon: Scissors, title: "Fall, pico & blouse", body: "Done in-house, free with every silk saree." },
  { icon: Truck, title: "Ships across India", body: "Insured delivery in 3–5 days, abroad in 7–10." },
  { icon: PackageCheck, title: "Silk Mark certified", body: "Every pure silk comes with its certificate." },
];

export function ShopsSite() {
  const { dynamic } = useShowcaseMode();

  return (
    <div className="font-[family-name:var(--font-body)]">
      <div className="bg-[var(--s-accent)] py-2 text-center text-[13px] tracking-wide text-[var(--s-on-accent)]">
        Free shipping across India on orders over ₹5,000
      </div>
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <span className="font-[family-name:var(--font-display)] text-2xl tracking-[0.06em]">NEELAMBARI</span>
        <nav className="hidden items-center gap-8 text-[14px] text-[var(--s-muted)] md:flex">
          <a href="#collections" className="hover:text-[var(--s-fg)]">Collections</a>
          <a href="#featured" className="hover:text-[var(--s-fg)]">New in</a>
          <a href="#visit" className="hover:text-[var(--s-fg)]">Visit the store</a>
        </nav>
        <a href={ORDER} className="inline-flex h-10 items-center gap-2 rounded-full bg-[var(--s-fg)] px-5 text-sm font-medium text-[var(--s-bg)] transition-opacity hover:opacity-90">
          <MessageCircle className="h-4 w-4" /> Shop on WhatsApp
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <Parallax className="aspect-[16/10] rounded-[20px] sm:aspect-[21/9]" distance={45}>
            <Image src="/showcase/shops/hero.jpg" alt="Inside the boutique: sarees and lehengas on brass rails" fill priority sizes="100vw" className="object-cover" />
          </Parallax>
        </Reveal>
        <div className="grid items-end gap-8 py-12 md:grid-cols-[1.3fr_1fr] md:py-16">
          <Reveal>
            <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.8rem,7vw,5.8rem)] leading-[0.98]">
              Handwoven in Telangana. Worn everywhere.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-[17px] leading-relaxed text-[var(--s-muted)]">
              Ikat, Kanchi, Gadwal and Narayanpet sarees, bought straight from the weavers and chosen one by one. In our
              Himayatnagar store and on a video call.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#collections" className="inline-flex h-12 items-center rounded-full bg-[var(--s-accent)] px-6 text-[15px] font-medium text-[var(--s-on-accent)] transition-all hover:brightness-110">
                Browse collections
              </a>
              <a href={ORDER} className="inline-flex h-12 items-center gap-2 rounded-full border border-[var(--s-line)] px-6 text-[15px] transition-colors hover:border-[var(--s-fg)]">
                <Video className="h-4 w-4" /> Book a video call
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Collections */}
      <section id="collections" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02]">Collections</h2>
          <a href={ORDER} className="text-[15px] text-[var(--s-accent-ink)] underline-offset-4 hover:underline">See everything →</a>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.07}>
              <a
                href={ORDER}
                className={`group flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-[18px] p-6 transition-transform duration-500 ${dynamic ? "hover:-translate-y-1.5" : ""}`}
                style={{ background: c.bg }}
              >
                <span className="text-[13px] uppercase tracking-[0.18em] opacity-75">{c.count}</span>
                <span>
                  <span className={`block font-[family-name:var(--font-display)] text-[2rem] leading-[1.05] transition-transform duration-500 ${dynamic ? "group-hover:translate-x-1" : ""}`}>{c.name}</span>
                  <span className="mt-2 block text-[15px] opacity-80">{c.note}</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section id="featured" className="bg-[var(--s-surface)] transition-colors duration-500">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[var(--s-soft)]">
              <Image
                src="/showcase/shops/saree.jpg"
                alt="Pochampally ikat silk saree in teal and rose with gold zari"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className={`object-cover transition-transform duration-700 ${dynamic ? "hover:scale-105" : ""}`}
              />
            </div>
          </Reveal>
          <div>
            <Reveal>
              <p className="text-[13px] uppercase tracking-[0.22em] text-[var(--s-accent-ink)]">New in · Pochampally</p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02]">Teal & rose double ikat, pure silk</h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-[var(--s-muted)]">
                Woven over 21 days by a master weaver in Koyalagudem. Both the warp and the weft are tie-dyed before
                weaving, so the pattern lives on both sides.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-8 grid grid-cols-3 border-y border-[var(--s-line)] text-center">
                {[
                  ["Length", "6.3 m"],
                  ["Blouse", "Included"],
                  ["Silk Mark", "Yes"],
                ].map(([k, v], i) => (
                  <div key={k} className={`py-4 ${i ? "border-l border-[var(--s-line)]" : ""}`}>
                    <dt className="text-xs uppercase tracking-[0.16em] text-[var(--s-muted)]">{k}</dt>
                    <dd className="mt-1 text-[16px] font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <span className="font-[family-name:var(--font-display)] text-4xl">₹24,500</span>
                <a href={ORDER} className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--s-accent)] px-6 text-[15px] font-medium text-[var(--s-on-accent)] transition-all hover:brightness-110">
                  <MessageCircle className="h-4 w-4" /> Order on WhatsApp
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.07}>
              <s.icon className="h-6 w-6 text-[var(--s-accent)]" strokeWidth={1.6} />
              <h3 className="mt-4 text-[17px] font-semibold">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--s-muted)]">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 md:pb-28">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-8 rounded-[24px] bg-[var(--s-accent)] p-8 text-[var(--s-on-accent)] sm:p-12 md:flex-row md:items-center">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02]">Come feel the silk.</h2>
              <p className="mt-3 max-w-md text-[16px] opacity-85">Street No. 6, Himayatnagar, Hyderabad. Open 10:30 am – 9 pm, every day.</p>
            </div>
            <a href={ORDER} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[var(--s-on-accent)] px-7 text-[15px] font-medium text-[var(--s-accent)] transition-opacity hover:opacity-90">
              Get directions
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-lg tracking-[0.06em] text-[var(--s-fg)]">NEELAMBARI</span>
          <span>A sample website by Zev&apos;s Agency. Neelambari is a fictional store.</span>
        </div>
      </footer>
    </div>
  );
}
