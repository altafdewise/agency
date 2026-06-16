"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Logo from "@/components/Logo";
import { StepShell } from "@/components/ui/StepShell";
import { Button } from "@/components/ui/Button";
import { usePath } from "@/components/PathProvider";
import type { Estimate } from "@/lib/brief";

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const tierLabel: Record<Estimate["tier"], string> = {
  simple: "a simple build",
  medium: "a medium build",
  complex: "a complex build",
};

export function Step7Estimate() {
  const { brief, next, estimate, setEstimate } = usePath();
  const [error, setError] = useState(false);
  // Snapshot the brief so the fetch body is stable across StrictMode remounts.
  const briefRef = useRef(brief);

  useEffect(() => {
    if (estimate) return; // already have it (e.g. navigated back & forth)
    const ctrl = new AbortController();
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(briefRef.current),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Estimate;
        if (active) setError(false);
        setEstimate(data);
      } catch (err) {
        if (active && (err as Error).name !== "AbortError") setError(true);
      }
    })();

    // StrictMode-safe: the first run is aborted on cleanup, the remount re-fetches.
    return () => {
      active = false;
      ctrl.abort();
    };
  }, [estimate, setEstimate]);

  if (!estimate && !error) {
    return (
      <StepShell innerClassName="max-w-xl">
        <div className="flex flex-col items-center text-center">
          <div style={{ width: "clamp(96px, 14vw, 132px)" }}>
            <Logo />
          </div>
          <p className="eyebrow mt-12 animate-pulse">pricing your project…</p>
          <p className="body-muted mt-4">
            Reading your brief and working out a fair range.
          </p>
        </div>
      </StepShell>
    );
  }

  if (!estimate) {
    return (
      <StepShell eyebrow="Hmm" innerClassName="max-w-2xl">
        <h2 className="headline-md text-balance">
          our estimator took a breather.
        </h2>
        <p className="body-muted mt-6 max-w-xl">
          No problem — the fastest way to a number is a quick chat. Tell us the
          shape of it and we&apos;ll come back with a figure the same day.
        </p>
        <Button className="mt-10" withArrow onClick={next}>
          let&apos;s just talk
        </Button>
      </StepShell>
    );
  }

  return (
    <StepShell eyebrow="Your estimate" innerClassName="max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="font-sans text-sm font-light text-muted">
          Looks like {tierLabel[estimate.tier]}.
        </p>

        <div className="mt-4 font-display font-semibold leading-[0.98] tracking-tightest text-accent [font-size:clamp(2.5rem,8vw,6rem)]">
          {inr(estimate.priceLow)}
          <span className="text-muted"> – </span>
          {inr(estimate.priceHigh)}
        </div>

        <p className="mt-6 max-w-xl font-display text-xl text-foreground sm:text-2xl">
          {estimate.summary}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">Timeline</span>
          <span className="font-sans text-base font-light text-foreground">
            {estimate.timeline}
          </span>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {estimate.included.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2} />
              <span className="font-sans text-base font-light text-foreground/90">
                {item}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-xs font-light text-muted/70">
          An indicative range, grounded in our standard rates. Final scope is
          confirmed on a quick call.
        </p>

        <Button className="mt-10" withArrow onClick={next}>
          what&apos;s next
        </Button>
      </motion.div>
    </StepShell>
  );
}
