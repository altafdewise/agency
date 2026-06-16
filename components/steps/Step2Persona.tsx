"use client";

import { useState } from "react";
import { StepShell } from "@/components/ui/StepShell";
import { OptionCard } from "@/components/ui/OptionCard";
import { OtherInput } from "@/components/ui/OtherInput";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";
import { PERSONAS } from "@/lib/content";

export function Step2Persona() {
  const { update, next, goTo, brief } = usePath();
  const [showOther, setShowOther] = useState(brief.persona === "other");
  const [other, setOther] = useState(brief.customPersona ?? "");

  const choose = (key: string) => {
    if (key === "other") {
      setShowOther(true);
      update({ persona: "other" });
      return;
    }
    if (key === "looking") {
      update({ persona: key, customPersona: undefined, stage: "explore" });
      goTo(3);
      return;
    }
    update({ persona: key, customPersona: undefined, stage: "" });
    next();
  };

  const submitOther = () => {
    if (!other.trim()) return;
    update({ persona: "other", customPersona: other.trim() });
    next();
  };

  return (
    <StepShell eyebrow="A little context">
      <Reveal blur y={24} duration={0.7}>
        <h2 className="headline-md max-w-3xl text-balance">who&apos;s it for?</h2>
      </Reveal>

      <RevealGroup
        className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
        stagger={0.08}
        delay={0.3}
      >
        {PERSONAS.map((p) => (
          <Reveal key={p.key}>
            <OptionCard
              title={p.label}
              Icon={p.Icon}
              selected={brief.persona === p.key && !(p.key === "other" && !showOther)}
              onClick={() => choose(p.key)}
            />
          </Reveal>
        ))}
      </RevealGroup>

      {showOther && (
        <OtherInput
          value={other}
          onChange={setOther}
          onSubmit={submitOther}
          placeholder="who are you building this for?"
          label="Describe who it's for"
        />
      )}
    </StepShell>
  );
}
