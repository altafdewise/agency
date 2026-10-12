import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SHOWCASE } from "@/lib/showcase";

export const metadata: Metadata = {
  title: "Sample websites",
  description: "Sample websites by Zev's Agency for clinics, cafés, schools, gyms, salons and more. Each one flips between light and dark, static and dynamic.",
  robots: { index: false, follow: true },
};

/** Every sample site, for sharing with a prospect in one link. */
export default function ShowcaseIndex() {
  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-6xl px-5 pb-24 pt-16 sm:px-8 sm:pt-24">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-foreground">
        Zev&apos;s Agency
      </Link>
      <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.75rem)] font-semibold leading-[1.02] tracking-tightest text-foreground">
        sample websites<span className="text-accent">.</span>
      </h1>
      <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-muted sm:text-lg">
        One for each kind of business we build for. Open any of them and use the switch at the bottom to see it in
        light or dark, with or without motion.
      </p>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SHOWCASE.map((s) => (
          <li key={s.slug}>
            <Link
              href={`/showcase/${s.slug}`}
              className="group block overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] transition-colors duration-300 hover:border-foreground/25"
            >
              <span className="relative block aspect-[16/10] overflow-hidden">
                <Image src={s.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </span>
              <span className="flex items-start justify-between gap-4 p-5">
                <span>
                  <span className="block font-mono text-[11px] uppercase tracking-[0.16em] text-accent">{s.industry}</span>
                  <span className="mt-2 block text-lg font-semibold tracking-tight text-foreground">{s.business}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted">{s.blurb}</span>
                </span>
                <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-colors group-hover:text-foreground" strokeWidth={1.75} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
