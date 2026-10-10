"use client";

import { StepShell } from "@/components/ui/StepShell";
import { TextArea } from "@/components/ui/inputs";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";
import { BRIEF_PROMPTS, GENERAL_PROMPTS, isPricingKey } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/* A rough guide only: the estimator makes the real call on whether a brief is
   detailed enough for a precise range (see app/api/estimate/route.ts). */
const DETAIL_HINTS = [
  "a line or two gets you a starting price.",
  "a little more and we can be precise.",
  "that's the kind of detail we can price properly.",
];

/** The details that set the price for what they picked, as gentle prompts. */
function promptsFor(needs: string[]) {
  const keys = needs.filter(isPricingKey);
  const list = keys.length
    ? keys.flatMap((key) => BRIEF_PROMPTS[key].slice(0, keys.length > 1 ? 2 : 4))
    : GENERAL_PROMPTS;
  return Array.from(new Set(list)).slice(0, 4);
}

export function Step5Brief() {
  const { brief, update, next } = usePath();
  const ready = brief.description.trim().length > 2;
  const words = brief.description.trim().split(/\s+/).filter(Boolean).length;
  const level = words >= 25 ? 2 : words >= 12 ? 1 : 0;
  const prompts = promptsFor(brief.needs);

  return (
    <StepShell eyebrow="clarity first, everything else after." innerClassName="max-w-3xl">
      <Reveal blur y={24} duration={0.7}>
        <h2 className="headline-md text-balance">tell us what you&apos;re building.</h2>
      </Reveal>

      <Reveal className="mt-12" delay={0.2}>
        <TextArea
          value={brief.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="A few lines is plenty — what it is, who it's for, anything you already know…"
          aria-label="Your brief"
        />
      </Reveal>

      <Reveal className="mt-8" delay={0.28}>
        <p className="eyebrow">for a precise number, mention</p>
        <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {prompts.map((prompt) => (
            <li key={prompt} className="flex items-start gap-3 text-sm font-light leading-snug text-muted">
              <span aria-hidden className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full bg-accent/80" />
              {prompt}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-4" delay={0.35}>
        <Button withArrow onClick={next} disabled={!ready}>
          continue
        </Button>
        <span className="flex items-center gap-3 font-sans text-sm font-light text-muted">
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 w-5 rounded-full transition-colors duration-300",
                  words > 0 && i <= level
                    ? level === 2
                      ? "bg-accent"
                      : "bg-foreground/60"
                    : "bg-foreground/15"
                )}
              />
            ))}
          </span>
          <span aria-live="polite">{DETAIL_HINTS[level]}</span>
        </span>
      </Reveal>
    </StepShell>
  );
}
