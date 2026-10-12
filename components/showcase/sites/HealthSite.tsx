"use client";

import Image from "next/image";
import {
  Baby,
  CalendarCheck,
  Clock,
  HeartPulse,
  MapPin,
  MessageCircle,
  Microscope,
  Phone,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Float, Parallax, Reveal } from "@/components/showcase/motion";
import { useShowcaseMode } from "@/components/showcase/ShowcaseShell";

/* A sample site for a family & dental clinic. The business is fictional;
   every booking button leads to Zev's page for clinics. */

const BOOK = "/for/clinics?utm_source=showcase&utm_medium=health";

const SERVICES = [
  { icon: Smile, title: "Check-ups & cleaning", body: "A full check, a gentle clean and a clear plan, in about 40 minutes." },
  { icon: Sparkles, title: "Braces & aligners", body: "Metal, ceramic or clear aligners, with a 3D preview of your new smile." },
  { icon: ShieldCheck, title: "Painless root canal", body: "Single-sitting treatment under modern anaesthesia, most days." },
  { icon: Baby, title: "Kids' dentistry", body: "Patient, playful care that makes the first visit a good memory." },
  { icon: Stethoscope, title: "Family physician", body: "Fevers, BP, sugar and everyday care, without the hospital queue." },
  { icon: Microscope, title: "Lab tests & packages", body: "Home sample pickup and reports on WhatsApp the same evening." },
];

const STEPS = [
  { n: "01", title: "Book a slot", body: "Pick a time online or send us a WhatsApp. Walk-ins are welcome too." },
  { n: "02", title: "Meet your doctor", body: "We listen first, check properly, and explain every option and its cost." },
  { n: "03", title: "Leave with a plan", body: "A written plan, your prescription, and reminders for the next visit." },
];

const DOCTORS = [
  { img: "/showcase/health/doctor-1.jpg", name: "Dr. Ananya Rao", role: "Dentist & orthodontist", meta: "BDS, MDS · 12 years" },
  { img: "/showcase/health/doctor-2.jpg", name: "Dr. Karthik Menon", role: "Family physician", meta: "MBBS, MD · 15 years" },
];

const HOURS = [
  ["Monday – Saturday", "9:00 am – 9:00 pm"],
  ["Sunday", "10:00 am – 2:00 pm"],
  ["Emergencies", "Call any time"],
];

const btn =
  "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-all duration-300";

export function HealthSite() {
  const { dynamic } = useShowcaseMode();
  const lift = dynamic ? "hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_var(--s-shadow)]" : "";

  return (
    <div className="font-[family-name:var(--font-body)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--s-line)] bg-[color-mix(in_srgb,var(--s-bg)_85%,transparent)] backdrop-blur-md transition-colors duration-500">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--s-accent)] text-[var(--s-on-accent)]">
              <HeartPulse className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-bold tracking-tight">Sahana</span>
              <span className="block text-[11px] text-[var(--s-muted)]">Family & Dental Clinic</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[var(--s-muted)] md:flex">
            <a href="#care" className="hover:text-[var(--s-fg)]">Care</a>
            <a href="#doctors" className="hover:text-[var(--s-fg)]">Doctors</a>
            <a href="#visit" className="hover:text-[var(--s-fg)]">Visit</a>
          </nav>
          <a href={BOOK} className={`${btn} h-10 bg-[var(--s-accent)] px-5 text-sm text-[var(--s-on-accent)] hover:brightness-110`}>
            <CalendarCheck className="h-4 w-4" strokeWidth={2} /> Book a visit
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 md:grid-cols-[1.05fr_1fr] md:gap-14 md:pb-24 md:pt-20">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--s-soft)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--s-accent-ink)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--s-accent)]" /> Family medicine & dental care · Kondapur
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2.75rem,6.4vw,5rem)] leading-[1.02] tracking-[-0.01em]">
              Gentle care for every smile in the family.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-[var(--s-muted)]">
              Two doctors, one calm clinic. Dental treatment and everyday medicine for kids, parents and grandparents,
              explained in plain words.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-wrap gap-3">
            <a href={BOOK} className={`${btn} bg-[var(--s-accent)] text-[var(--s-on-accent)] hover:brightness-110`}>
              <CalendarCheck className="h-[18px] w-[18px]" strokeWidth={2} /> Book a visit
            </a>
            <a href={BOOK} className={`${btn} border border-[var(--s-line)] hover:border-[var(--s-muted)]`}>
              <MessageCircle className="h-[18px] w-[18px]" strokeWidth={2} /> WhatsApp us
            </a>
          </Reveal>
          <Reveal delay={0.3}>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--s-muted)]">
              <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-[var(--s-accent)]" /> Open today till 9 pm</li>
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--s-accent)]" /> Sterilised, single-use kits</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--s-accent)]" /> Free parking</li>
            </ul>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="relative">
          <Parallax className="aspect-[4/5] rounded-[28px] md:aspect-[5/6]" distance={40}>
            <Image src="/showcase/health/hero.jpg" alt="The clinic's bright reception" fill priority sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          </Parallax>
          <Float className="absolute -bottom-5 left-4 sm:-left-6">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--s-line)] bg-[var(--s-surface)] px-4 py-3 shadow-[0_20px_50px_-24px_var(--s-shadow)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--s-soft)] text-[var(--s-accent)]">
                <CalendarCheck className="h-5 w-5" strokeWidth={2} />
              </span>
              <span className="leading-tight">
                <span className="block text-xs text-[var(--s-muted)]">Next free slot</span>
                <span className="block text-sm font-semibold">Today, 4:30 pm</span>
              </span>
            </div>
          </Float>
        </Reveal>
      </section>

      {/* Services */}
      <section id="care" className="border-y border-[var(--s-line)] bg-[var(--s-surface)] py-20 transition-colors duration-500 md:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--s-accent-ink)]">What we do</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.05]">
              Everything your family needs, under one roof.
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 0.06}>
                <div className={`h-full rounded-3xl border border-[var(--s-line)] bg-[var(--s-bg)] p-6 transition-all duration-300 ${lift}`}>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--s-soft)] text-[var(--s-accent)]">
                    <s.icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--s-muted)]">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* First visit */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-8 md:grid-cols-2 md:py-28">
        <Reveal>
          <Parallax className="aspect-[4/3] rounded-[28px]" distance={30}>
            <Image src="/showcase/health/care.jpg" alt="A dentist showing a young patient her teeth in a mirror" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </Parallax>
        </Reveal>
        <div>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--s-accent-ink)]">Your first visit</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.05]">
              No surprises, no rush.
            </h2>
          </Reveal>
          <ol className="mt-8 flex flex-col gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} as="li" delay={i * 0.08} className="flex gap-5">
                <span className="font-[family-name:var(--font-display)] text-3xl leading-none text-[var(--s-accent)]">{s.n}</span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight">{s.title}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-[var(--s-muted)]">{s.body}</span>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="bg-[var(--s-soft)] py-20 transition-colors duration-500 md:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--s-accent-ink)]">Your doctors</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.05]">
                People you&apos;ll be happy to see again.
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {DOCTORS.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.1}>
                <article className={`group overflow-hidden rounded-[28px] bg-[var(--s-surface)] transition-all duration-300 ${lift}`}>
                  <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[5/4]">
                    <Image
                      src={d.img}
                      alt={`${d.name}, ${d.role}`}
                      fill
                      sizes="(min-width: 640px) 45vw, 100vw"
                      className={`object-cover object-top transition-transform duration-700 ${dynamic ? "group-hover:scale-[1.04]" : ""}`}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 p-6">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{d.name}</h3>
                      <p className="mt-1 text-[15px] text-[var(--s-muted)]">{d.role}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-[var(--s-line)] px-3 py-1 text-xs text-[var(--s-muted)]">{d.meta}</span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <Reveal>
          <div className="grid overflow-hidden rounded-[32px] bg-[var(--s-accent)] text-[var(--s-on-accent)] md:grid-cols-[1.2fr_1fr]">
            <div className="p-8 sm:p-12">
              <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.05]">
                Come say hello.
              </h2>
              <p className="mt-4 max-w-md text-[16px] leading-relaxed opacity-85">
                Road No. 2, Kondapur, Hyderabad. Two minutes from the main road, with parking right outside.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={BOOK} className={`${btn} bg-[var(--s-on-accent)] text-[var(--s-accent)] hover:opacity-90`}>
                  <CalendarCheck className="h-[18px] w-[18px]" strokeWidth={2} /> Book a visit
                </a>
                <a href={BOOK} className={`${btn} border border-[color-mix(in_srgb,var(--s-on-accent)_35%,transparent)] hover:bg-[color-mix(in_srgb,var(--s-on-accent)_10%,transparent)]`}>
                  <Phone className="h-[18px] w-[18px]" strokeWidth={2} /> Call the clinic
                </a>
              </div>
            </div>
            <div className="border-t border-[color-mix(in_srgb,var(--s-on-accent)_18%,transparent)] p-8 sm:p-12 md:border-l md:border-t-0">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-75">Timings</p>
              <dl className="mt-5 flex flex-col divide-y divide-[color-mix(in_srgb,var(--s-on-accent)_18%,transparent)]">
                {HOURS.map(([d, h]) => (
                  <div key={d} className="flex items-center justify-between gap-4 py-3.5 text-[15px]">
                    <dt className="opacity-85">{d}</dt>
                    <dd className="font-semibold">{h}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--s-line)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-[var(--s-muted)] sm:px-8">
          <span>© Sahana Family & Dental Clinic</span>
          <span>A sample website by Zev&apos;s Agency. Sahana is a fictional clinic.</span>
        </div>
      </footer>
    </div>
  );
}
