"use client";

import { useState } from "react";
import { StepShell } from "@/components/ui/StepShell";
import { TextInput } from "@/components/ui/inputs";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Step6Contact() {
  const { brief, update, next } = usePath();
  const [name, setName] = useState(brief.contact?.name ?? "");
  const [email, setEmail] = useState(brief.contact?.email ?? "");
  const [touched, setTouched] = useState(false);

  const emailValid = EMAIL_RE.test(email.trim());

  const submit = () => {
    if (!emailValid) {
      setTouched(true);
      return;
    }
    update({
      contact: { email: email.trim(), name: name.trim() || undefined },
    });
    next();
  };

  const skip = () => {
    update({ contact: null });
    next();
  };

  return (
    <StepShell eyebrow="Optional" innerClassName="max-w-2xl">
      <Reveal blur y={24} duration={0.7}>
        <h2 className="headline-md text-balance">
          want your estimate sent to you too?
        </h2>
      </Reveal>
      <Reveal className="mt-5" duration={0.4} delay={0.2}>
        <p className="body-muted">No follow-up spam. Just your number, in your inbox.</p>
      </Reveal>

      <Reveal className="mt-12 flex flex-col gap-9" delay={0.35}>
        <div>
          <label htmlFor="c-name" className="eyebrow mb-3 block">
            Name <span className="lowercase tracking-normal text-muted/60">(optional)</span>
          </label>
          <TextInput
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="what should we call you?"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="c-email" className="eyebrow mb-3 block">
            Email
          </label>
          <TextInput
            id="c-email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            onBlur={() => setTouched(true)}
            placeholder="you@email.com"
            autoComplete="email"
            aria-invalid={touched && !emailValid}
          />
          {touched && email.length > 0 && !emailValid && (
            <p className="mt-3 text-sm font-light text-accent">
              That doesn&apos;t look like an email — mind checking it?
            </p>
          )}
        </div>
      </Reveal>

      <Reveal className="mt-12 flex items-center gap-8" delay={0.5}>
        <Button withArrow onClick={submit}>
          get my estimate
        </Button>
        <Button variant="link" onClick={skip}>
          skip →
        </Button>
      </Reveal>
    </StepShell>
  );
}
