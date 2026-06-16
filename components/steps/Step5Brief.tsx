"use client";

import { StepShell } from "@/components/ui/StepShell";
import { TextArea } from "@/components/ui/inputs";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";

export function Step5Brief() {
  const { brief, update, next } = usePath();
  const ready = brief.description.trim().length > 2;

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

      <Reveal className="mt-12 flex items-center gap-6" delay={0.35}>
        <Button withArrow onClick={next} disabled={!ready}>
          continue
        </Button>
        <span className="font-sans text-sm font-light text-muted">
          one field. no forms.
        </span>
      </Reveal>
    </StepShell>
  );
}
