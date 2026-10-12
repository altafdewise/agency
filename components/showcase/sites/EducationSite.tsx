"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Apple, BookOpen, Bus, Camera, GraduationCap, Music, Palette, Shapes, Sparkles, Star, Users } from "lucide-react";
import { Float, Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a play school & learning centre. The school is
   fictional; admission buttons lead to Zev's page for coaching centres. */

const ENQUIRE = "/for/coaching?utm_source=showcase&utm_medium=education";

const PROGRAMS = [
  { icon: Shapes, name: "Playgroup", age: "1.5 – 2.5 yrs", body: "Songs, sand, stories and first friends, three hours a day.", tint: "var(--s-soft)" },
  { icon: Palette, name: "Nursery", age: "2.5 – 3.5 yrs", body: "Montessori materials, colours, shapes and lots of talking.", tint: "var(--s-soft-2)" },
  { icon: BookOpen, name: "LKG & UKG", age: "3.5 – 5.5 yrs", body: "Phonics, numbers and confidence, ready for big school.", tint: "var(--s-soft)" },
  { icon: GraduationCap, name: "After-school", age: "6 – 12 yrs", body: "Homework help, maths and English, with a snack break.", tint: "var(--s-soft-2)" },
];

const DAY = [
  { time: "8:45", title: "Hello & circle time", icon: Users },
  { time: "9:30", title: "Montessori work", icon: Shapes },
  { time: "10:30", title: "Fruit break", icon: Apple },
  { time: "11:00", title: "Art, music or dance", icon: Music },
  { time: "12:00", title: "Story & goodbye", icon: BookOpen },
];

const SAFE = [
  { icon: Camera, text: "Live CCTV you can watch on your phone" },
  { icon: Users, text: "1 teacher for every 8 children" },
  { icon: Bus, text: "GPS-tracked van with a female attendant" },
  { icon: Apple, text: "Fresh fruit and a cook-made snack" },
];

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-bold transition-all duration-300";

export function EducationSite() {
  const { dynamic } = useShowcaseMode();
  const wobble = dynamic ? "hover:-rotate-1 hover:-translate-y-1" : "";

  return (
    <div className="font-[family-name:var(--font-body)]">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--s-accent-2)] text-[#1F2340]">
            <Sparkles className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold">Little Banyan</span>
        </a>
        <nav className="hidden items-center gap-8 text-[15px] font-semibold text-[var(--s-muted)] md:flex">
          <a href="#programs" className="hover:text-[var(--s-fg)]">Programs</a>
          <a href="#day" className="hover:text-[var(--s-fg)]">A day here</a>
          <a href="#admissions" className="hover:text-[var(--s-fg)]">Admissions</a>
        </nav>
        <a href={ENQUIRE} className={`${btn} h-10 bg-[var(--s-accent)] px-5 text-sm text-[var(--s-on-accent)] hover:brightness-110`}>Book a visit</a>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-6 sm:px-8 md:grid-cols-2 md:pt-12">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--s-soft)] px-4 py-1.5 text-sm font-bold text-[var(--s-accent-ink)]">
              <Star className="h-4 w-4 fill-current" /> Admissions open for 2027 · Manikonda
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2.9rem,6.6vw,5.2rem)] font-semibold leading-[1.0] tracking-tight">
              Where little ones grow{" "}
              <span className="relative inline-block">
                <span className="relative z-10">big</span>
                <span className="absolute inset-x-[-6%] bottom-[8%] z-0 h-[38%] rounded-full bg-[var(--s-accent-2)]" aria-hidden />
              </span>{" "}
              ideas.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-[var(--s-muted)]">
              A Montessori play school and learning centre for ages 1.5 to 12, with small classes, warm teachers and a
              lot of paint on the floor.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-wrap gap-3">
            <a href={ENQUIRE} className={`${btn} bg-[var(--s-accent)] text-[var(--s-on-accent)] hover:brightness-110`}>Book a school visit</a>
            <a href={ENQUIRE} className={`${btn} bg-[var(--s-accent-2)] text-[#1F2340] hover:brightness-105`}>Download brochure</a>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative">
          <Parallax className="aspect-[5/4] rounded-[40%_60%_55%_45%/50%_45%_55%_50%]" distance={30}>
            <Image src="/showcase/education/hero.jpg" alt="A bright, colourful classroom" fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </Parallax>
          <Float className="absolute -left-2 top-6 sm:-left-6">
            <span className="flex items-center gap-2 rounded-2xl bg-[var(--s-surface)] px-4 py-3 text-sm font-bold shadow-[0_16px_40px_-20px_var(--s-shadow)]">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--s-soft)] text-[var(--s-accent)]"><Users className="h-4 w-4" /></span>
              1 : 8 teacher ratio
            </span>
          </Float>
          <Float className="absolute -bottom-4 right-2 sm:right-6">
            <span className="flex items-center gap-2 rounded-2xl bg-[var(--s-accent-2)] px-4 py-3 text-sm font-bold text-[#1F2340] shadow-[0_16px_40px_-20px_var(--s-shadow)]">
              <Star className="h-4 w-4 fill-current" /> Montessori trained
            </span>
          </Float>
        </Reveal>
      </section>

      {/* Programs */}
      <section id="programs" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <Reveal className="text-center">
          <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.05]">A class for every age</h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-[var(--s-muted)]">From first steps to fifth grade, in one happy building.</p>
        </Reveal>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p, i) => (
            <Reveal key={p.name} as="li" delay={i * 0.07}>
              <div className={`h-full rounded-[28px] p-6 transition-transform duration-300 ${wobble}`} style={{ background: p.tint }}>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--s-surface)] text-[var(--s-accent)]">
                  <p.icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm font-bold text-[var(--s-accent-ink)]">{p.age}</p>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--s-muted)]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* A day */}
      <section id="day" className="bg-[var(--s-surface)] py-20 transition-colors duration-500 md:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.05]">A morning at Little Banyan</h2>
          </Reveal>
          <div className="relative mt-14">
            <div className="absolute left-5 right-5 top-6 hidden h-1 rounded-full bg-[var(--s-line)] md:block" aria-hidden />
            <motion.div
              className="absolute left-5 top-6 hidden h-1 origin-left rounded-full bg-[var(--s-accent-2)] md:block"
              style={{ right: "1.25rem" }}
              initial={dynamic ? { scaleX: 0 } : false}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: dynamic ? 1.6 : 0, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            <ol className="relative grid gap-6 md:grid-cols-5">
              {DAY.map((d, i) => (
                <Reveal key={d.time} as="li" delay={i * 0.18} className="flex items-center gap-4 md:flex-col md:items-start">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-4 border-[var(--s-surface)] bg-[var(--s-accent)] text-[var(--s-on-accent)] shadow-sm">
                    <d.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--s-accent-ink)]">{d.time}</span>
                    <span className="block text-[15px] font-semibold">{d.title}</span>
                  </span>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Safe & happy */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
        <Reveal>
          <Parallax className="aspect-square rounded-[36px]" distance={30}>
            <Image src="/showcase/education/play.jpg" alt="Children building with wooden blocks with their teacher" fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </Parallax>
        </Reveal>
        <div>
          <Reveal>
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.05]">Safe, seen and happy.</h2>
            <p className="mt-4 max-w-md text-lg text-[var(--s-muted)]">The things parents ask about first, sorted before you ask.</p>
          </Reveal>
          <ul className="mt-8 grid gap-3">
            {SAFE.map((s, i) => (
              <Reveal key={s.text} as="li" delay={i * 0.07}>
                <span className="flex items-center gap-4 rounded-2xl border border-[var(--s-line)] bg-[var(--s-surface)] p-4 text-[16px] font-semibold">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--s-soft-2)] text-[var(--s-accent)]"><s.icon className="h-5 w-5" /></span>
                  {s.text}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Admissions */}
      <section id="admissions" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 md:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[36px] bg-[var(--s-accent)] px-8 py-14 text-center text-[var(--s-on-accent)] sm:px-14">
            <motion.span
              className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[var(--s-accent-2)] opacity-90"
              animate={dynamic ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={dynamic ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
              aria-hidden
            />
            <motion.span
              className="absolute -bottom-12 -right-6 h-48 w-48 rounded-full bg-white/15"
              animate={dynamic ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={dynamic ? { duration: 7, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
              aria-hidden
            />
            <h2 className="relative font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.05]">Come see us on a school day.</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-lg opacity-90">Visits Monday to Saturday, 10 am to 1 pm. Bring your little one, they&apos;ll love the sand pit.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a href={ENQUIRE} className={`${btn} bg-[var(--s-accent-2)] text-[#1F2340] hover:brightness-105`}>Book a school visit</a>
              <a href={ENQUIRE} className={`${btn} bg-white/15 text-[var(--s-on-accent)] hover:bg-white/25`}>WhatsApp the office</a>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--s-fg)]">Little Banyan</span>
          <span>A sample website by Zev&apos;s Agency. Little Banyan is a fictional school.</span>
        </div>
      </footer>
    </div>
  );
}
