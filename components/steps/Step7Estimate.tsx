"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle, Mail, CalendarClock } from "lucide-react";
import Logo from "@/components/Logo";
import { StepShell } from "@/components/ui/StepShell";
import { Button, LinkButton } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/inputs";
import { usePath } from "@/components/PathProvider";
import { whatsappHref, mailtoHref } from "@/lib/contact";
import { SERVICES } from "@/lib/content";
import type { Estimate } from "@/lib/brief";

const ESTIMATE_TIMEOUT_MS = 25000;
const SLOW_MESSAGE_MS = 6000;

const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const scopeLabel: Record<Estimate["tier"], string> = {
  simple: "Essential scope",
  medium: "Standard scope",
  complex: "Advanced scope",
};

function pricedFor(estimate: Estimate) {
  return (estimate.services ?? [])
    .map((key) => SERVICES.find((service) => service.key === key)?.title)
    .filter(Boolean)
    .join(" + ");
}

function isValidEstimate(data: unknown): data is Estimate {
  if (!data || typeof data !== "object") return false;
  const e = data as Record<string, unknown>;
  return (
    (e.kind === "range" || e.kind === "from") &&
    typeof e.priceLow === "number" &&
    typeof e.priceHigh === "number" &&
    typeof e.timeline === "string" &&
    Array.isArray(e.included)
  );
}

export function Step7Estimate() {
  const { brief, next, estimate, setEstimate, update } = usePath();
  const [error, setError] = useState(false);
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const [extra, setExtra] = useState("");
  // Snapshot the brief so the fetch body is stable across StrictMode remounts.
  const briefRef = useRef(brief);
  // The saved lead, so answering the follow-ups updates it instead of adding one.
  const leadIdRef = useRef(estimate?.leadId);
  const refiningRef = useRef(false);

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
          body: JSON.stringify({ ...briefRef.current, leadId: leadIdRef.current }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: unknown = await res.json();
        if (!isValidEstimate(data)) throw new Error("Unparseable estimate.");
        if (active) {
          leadIdRef.current = data.leadId ?? leadIdRef.current;
          refiningRef.current = false;
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

  // Answers to the follow-ups join the brief; clearing the estimate re-prices it.
  const refine = () => {
    const added = extra.trim();
    if (!added) return;
    const description = `${briefRef.current.description.trim()}\n\n${added}`;
    briefRef.current = { ...briefRef.current, description };
    refiningRef.current = true;
    setExtra("");
    setError(false);
    update({ description });
  };

  // ── loading ───────────────────────────────────────────────────────────────
  if (!estimate && !error) {
    return (
      <StepShell innerClassName="max-w-xl">
        <div className="flex flex-col items-center text-center">
          <div style={{ width: "clamp(96px, 14vw, 132px)" }}>
            <Logo />
          </div>
          <p className="eyebrow mt-12 animate-pulse">
            {refiningRef.current ? "sharpening your estimate…" : "pricing your project…"}
          </p>
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
      "Hi Zev — I just walked the path and would love an estimate." +
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
              href={mailtoHref("Project enquiry — via zev.world", note)}
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

  // ── a starting price: the brief was too thin to quote precisely ─────────────
  if (estimate.kind === "from") {
    return (
      <StepShell eyebrow="Your estimate" innerClassName="max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-sans text-sm font-light text-muted">
            {[pricedFor(estimate), "Starting price"].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-4 font-display font-semibold leading-[0.98] tracking-tightest text-accent [font-size:clamp(2.5rem,8vw,6rem)]">
            <span className="mr-[0.22em] align-baseline text-[0.42em] font-medium text-muted">from</span>
            <span className="whitespace-nowrap">{inr(estimate.priceLow)}</span>
          </div>

          <p className="mt-6 max-w-xl font-display text-xl text-foreground sm:text-2xl">
            {estimate.summary}
          </p>

          <div className="mt-12 border-t border-border pt-10">
            <h3 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              for a precise range, tell us:
            </h3>
            <ul className="mt-5 space-y-3">
              {(estimate.questions ?? []).map((question) => (
                <li key={question} className="flex items-start gap-3 text-base font-light text-foreground/90">
                  <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {question}
                </li>
              ))}
            </ul>

            <TextArea
              className="mt-8"
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              placeholder="A few words for each is plenty…"
              aria-label="More detail about your project"
            />

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Button withArrow onClick={refine} disabled={!extra.trim()}>
                Get my precise estimate
              </Button>
              <Button variant="link" onClick={next}>
                or book a call instead →
              </Button>
            </div>
          </div>

          <p className="mt-10 text-xs font-light text-muted/70">
            This is where projects like yours start. We confirm the final price
            with you on a short call before any work starts.
          </p>
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
          {[pricedFor(estimate), scopeLabel[estimate.tier]].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-4 font-display font-semibold leading-[0.98] tracking-tightest text-accent [font-size:clamp(2.5rem,8vw,6rem)]">
          <span className="whitespace-nowrap">{inr(estimate.priceLow)}</span>
          <span className="text-muted"> – </span>
          <span className="whitespace-nowrap">{inr(estimate.priceHigh)}</span>
        </div>

        <p className="mt-6 max-w-xl font-display text-xl text-foreground sm:text-2xl">
          {estimate.summary}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">Delivery</span>
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
          Based on our standard rates for this scope. We confirm the final
          price with you on a short call before any work starts.
        </p>

        <Button className="mt-10" withArrow onClick={next}>
          Book a call to confirm
        </Button>
      </motion.div>
    </StepShell>
  );
}
