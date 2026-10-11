"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { EstimateTier } from "@/lib/brief";
import { SERVICES } from "@/lib/content";
import { SCOPE_INCLUDES, TIMELINES, type PricingKey, type PricingTable } from "@/lib/pricing";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import { cn } from "@/lib/cn";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const TIERS: { key: EstimateTier; label: string }[] = [
  { key: "simple", label: "Essential" },
  { key: "medium", label: "Standard" },
  { key: "complex", label: "Advanced" },
];

/** The services with a rate card (legal help and "something else" have none). */
const PRICED = SERVICES.flatMap((service) =>
  service.pricingKey ? [{ ...service, pricingKey: service.pricingKey as PricingKey }] : []
);
type PricedService = (typeof PRICED)[number];

const trim = (v: number) => String(Math.round(v * 10) / 10);
/** ₹15k, ₹1.2L, ₹25L, ₹1Cr. */
function inrShort(n: number) {
  if (n >= 1e7) return `₹${trim(n / 1e7)}Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)}L`;
  return `₹${trim(n / 1e3)}k`;
}

/* Bands span orders of magnitude (an essential app vs an advanced one), so the
   shared axis is logarithmic, with plainly labelled ticks. */
const TICKS = [1e4, 3e4, 1e5, 3e5, 1e6, 3e6, 1e7];
function logScale(min: number, max: number) {
  const lo = Math.log10(min * 0.7);
  const hi = Math.log10(max * 1.3);
  return (v: number) => (Math.log10(v) - lo) / (hi - lo);
}

function ServicePanel({
  service,
  table,
  tier,
  onTier,
}: {
  service: PricedService;
  table: PricingTable;
  tier: EstimateTier;
  onTier: (tier: EstimateTier) => void;
}) {
  const reduce = useSafeReducedMotion();
  const bands = table[service.pricingKey];
  const x = logScale(bands.simple[0], bands.complex[1]);
  const ticks = TICKS.filter((v) => x(v) > 0.04 && x(v) < 0.96);
  const active = TIERS.find((t) => t.key === tier) ?? TIERS[1];

  return (
    <motion.div
      key={service.key}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE_OUT }}
    >
      <p className="max-w-lg text-base font-light leading-relaxed text-muted">{service.brief}</p>

      <p className="eyebrow mt-9">three scopes · tap one</p>
      <div className="mt-3" role="group" aria-label={`${service.title}: scopes, prices and timelines`}>
        {TIERS.map((t, i) => {
          const [low, high] = bands[t.key];
          const on = t.key === tier;
          const left = x(low) * 100;
          const width = Math.max(1.5, (x(high) - x(low)) * 100);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onTier(t.key)}
              aria-pressed={on}
              className="group grid w-full grid-cols-[5.25rem_1fr] items-center gap-4 rounded-lg py-3 text-left sm:grid-cols-[6.25rem_1fr]"
            >
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  on ? "text-foreground" : "text-muted group-hover:text-foreground/80"
                )}
              >
                {t.label}
              </span>
              <span className="flex flex-col gap-2">
                <span className="relative block h-2 rounded-full bg-foreground/[0.06]">
                  <motion.span
                    className={cn(
                      "absolute inset-y-0 rounded-full transition-colors duration-300",
                      on ? "bg-accent" : "bg-foreground/30 group-hover:bg-foreground/45"
                    )}
                    style={{ left: `${left}%` }}
                    initial={{ width: reduce ? `${width}%` : "0%" }}
                    whileInView={{ width: `${width}%` }}
                    viewport={{ once: true }}
                    transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE_OUT, delay: 0.1 + i * 0.12 }}
                  />
                </span>
                <span className="text-xs font-light text-muted">
                  <span className="text-foreground/85">
                    {inrShort(low)} – {inrShort(high)}
                  </span>{" "}
                  · {TIMELINES[service.pricingKey][t.key].label}
                </span>
              </span>
            </button>
          );
        })}

        <div aria-hidden className="grid grid-cols-[5.25rem_1fr] gap-4 sm:grid-cols-[6.25rem_1fr]">
          <span />
          <span className="relative block h-6 border-t border-foreground/10">
            {ticks.map((v) => (
              <span
                key={v}
                className="absolute top-1.5 -translate-x-1/2 font-mono text-[0.65rem] text-muted/70"
                style={{ left: `${x(v) * 100}%` }}
              >
                {inrShort(v)}
              </span>
            ))}
          </span>
        </div>
      </div>

      <motion.div
        key={`${service.key}-${tier}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.4, ease: EASE_OUT }}
        className="mt-8"
      >
        <p className="eyebrow">{active.label} includes</p>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {SCOPE_INCLUDES[service.pricingKey][tier].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm font-light leading-snug text-foreground/90">
              <span aria-hidden className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      <Link
        href="/"
        className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
      >
        get a price for your project
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
      </Link>
    </motion.div>
  );
}

/**
 * "What we do": the services, and for the one you tap, its three scopes on a
 * shared price axis with the usual timeline. Tap a scope to see what it
 * includes. Desktop shows the detail beside the list; phones open it in place.
 */
export function ServiceExplorer({ table }: { table: PricingTable }) {
  const [active, setActive] = useState<PricingKey>("website");
  const [tier, setTier] = useState<EstimateTier>("medium");
  const current = PRICED.find((s) => s.pricingKey === active) ?? PRICED[0];

  const choose = (key: PricingKey) => {
    setActive(key);
    setTier("medium");
  };

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(240px,0.75fr)_1.25fr] lg:gap-16">
      <ul>
        {PRICED.map((service, i) => {
          const on = service.pricingKey === active;
          return (
            <li key={service.key} className="border-t border-border last:border-b">
              <button
                type="button"
                onClick={() => choose(service.pricingKey)}
                aria-expanded={on}
                className="group flex w-full items-center gap-4 py-5 text-left"
              >
                <span
                  className={cn(
                    "w-6 shrink-0 font-mono text-xs tabular-nums transition-colors duration-300",
                    on ? "text-accent" : "text-muted"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "flex-1 font-display text-xl font-semibold tracking-tight transition-colors duration-300 sm:text-2xl",
                    on ? "text-foreground" : "text-foreground/45 group-hover:text-foreground/80"
                  )}
                >
                  {service.title}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full bg-accent transition-transform duration-300 ease-out-soft",
                    on ? "scale-100" : "scale-0"
                  )}
                />
              </button>

              {/* Phones: the explanation opens right under the service you tapped. */}
              {on && (
                <div className="pb-8 lg:hidden">
                  <ServicePanel service={current} table={table} tier={tier} onTier={setTier} />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="hidden lg:block">
        <div className="sticky top-28">
          <ServicePanel service={current} table={table} tier={tier} onTier={setTier} />
        </div>
      </div>
    </div>
  );
}
