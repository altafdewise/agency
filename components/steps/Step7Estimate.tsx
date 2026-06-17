"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, Mail, CalendarClock } from "lucide-react";
import Logo from "@/components/Logo";
import { StepShell } from "@/components/ui/StepShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { usePath } from "@/components/PathProvider";
import { whatsappHref, mailtoHref } from "@/lib/contact";
import type { Estimate } from "@/lib/brief";

const ESTIMATE_TIMEOUT_MS = 25000;
const SLOW_MESSAGE_MS = 6000;

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

function isValidEstimate(data: unknown): data is Estimate {
  if (!data || typeof data !== "object") return false;
  const e = data as Record<string, unknown>;
  return (
    typeof e.priceLow === "number" &&
    typeof e.priceHigh === "number" &&
    typeof e.timeline === "string" &&
    Array.isArray(e.included)
  );
}

export function Step7Estimate() {
  const { brief, next, estimate, setEstimate } = usePath();
  const [error, setError] = useState(false);
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  // Snapshot the brief so the fetch body is stable across StrictMode remounts.
  const briefRef = useRef(brief);

  useEffect(() => {
    if (estimate) return; // already have it (e.g. navigated back & forth)

    const ctrl = new AbortController();
    let active = true;
    let timedOut = false;
    setShowSlowMessage(false);
    const slowTimer = setTimeout(() => {
      if (active) setShowSlowMessage(true);
    }, SLOW_MESSAGE_MS);
    const timer = setTimeout(() => {
      timedOut = true;
      ctrl.abort();
    }, ESTIMATE_TIMEOUT_MS);

    (async () => {
      try {
        const res = await fetch("/api/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(briefRef.current),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (!isValidEstimate(data)) throw new Error("Unparseable estimate.");
        if (active) {
          setError(false);
          setShowSlowMessage(false);
          setEstimate(data);
        }
      } catch (err) {
        const isAbort = (err as Error).name === "AbortError";
        // StrictMode cleanup aborts are ignored; a real timeout still falls back.
        if (active && (!isAbort || timedOut)) {
          // Never surface raw errors to the user.
          console.error("[estimate] showing fallback:", err);
          setError(true);
        }
      } finally {
        clearTimeout(slowTimer);
        clearTimeout(timer);
      }
    })();

    return () => {
      active = false;
      clearTimeout(slowTimer);
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [estimate, setEstimate]);

  // ── loading ───────────────────────────────────────────────────────────────
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
          {showSlowMessage && (
            <p className="mt-4 text-sm font-light text-muted/70">
              Still thinking it through...
            </p>
          )}
        </div>
      </StepShell>
    );
  }

  // ── graceful fallback (timeout / network / invalid) — feels intentional ─────
  if (!estimate) {
    const note =
      "Hi maggie — I just walked the path and would love an estimate." +
      (briefRef.current.description
        ? ` Here's what I'm building: ${briefRef.current.description}`
        : "");
    return (
      <StepShell eyebrow="Your estimate" innerClassName="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="headline-md text-balance">
            let&apos;s just talk it through.
          </h2>
          <p className="body-muted mt-6 max-w-xl">
            every project&apos;s different — tell us more and we&apos;ll get back
            to you with a number, fast.
          </p>

          <div className="mt-10 flex flex-col flex-wrap gap-4 sm:flex-row sm:items-center">
            <LinkButton
              href={whatsappHref(note)}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
              variant="primary"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              WhatsApp us
            </LinkButton>
            <LinkButton
              href={mailtoHref("Project enquiry — via maggie.agency", note)}
              size="lg"
              variant="ghost"
            >
              <Mail className="h-5 w-5" strokeWidth={1.75} />
              Message us
            </LinkButton>
            <Button size="lg" variant="ghost" onClick={next}>
              <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
              Schedule a call
            </Button>
          </div>
        </motion.div>
      </StepShell>
    );
  }

  // ── the estimate ────────────────────────────────────────────────────────────
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
