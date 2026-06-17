"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import { StepShell } from "@/components/ui/StepShell";
import { OptionCard } from "@/components/ui/OptionCard";
import { OtherInput } from "@/components/ui/OtherInput";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";
import { SERVICES } from "@/lib/content";

// WebGL hero orb — client-only (no SSR for the Three.js canvas).
const AyraOrb = dynamic(() => import("@/components/AyraOrb"), { ssr: false });

const SERVICE_CARD_LAYOUT: Record<
  string,
  { className: string; featured?: boolean }
> = {
  ai_integration: {
    className: "lg:col-span-2",
    featured: true,
  },
  website: {
    className: "lg:col-span-1",
  },
  app: {
    className: "lg:col-span-1",
  },
  design_prototype: {
    className: "lg:col-span-1",
  },
  brand_logo: {
    className: "lg:col-span-1",
  },
  content: {
    className: "lg:col-span-1",
  },
  security: {
    className: "lg:col-span-1",
  },
  other: {
    className: "lg:col-span-4",
  },
};

export function Step1Needs() {
  const { update, next, brief, step } = usePath();
  const reduce = useReducedMotion();
  const [showOther, setShowOther] = useState(brief.needs.includes("other"));
  const [other, setOther] = useState(brief.customNeed ?? "");

  const choose = (key: string) => {
    if (key === "other") {
      setShowOther(true);
      update({ needs: ["other"] });
      return;
    }
    update({ needs: [key], customNeed: undefined });
    next();
  };

  const submitOther = () => {
    if (!other.trim()) return;
    update({ needs: ["other"], customNeed: other.trim() });
    next();
  };

  const scrollToFunnel = () => {
    document.getElementById("tap-funnel")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <>
      <section
        className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
        aria-label="Ayra assistant"
      >
        <AyraOrb />
        <button
          type="button"
          onClick={scrollToFunnel}
          className="absolute bottom-7 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[13px] font-light text-foreground/70 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors duration-200 hover:border-white/18 hover:text-foreground focus-visible:text-foreground sm:bottom-9"
        >
          <span>or, tap to explore</span>
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
        </button>
      </section>

      <div id="tap-funnel">
        <StepShell>
          <RevealGroup
            className="relative z-10 flex flex-col items-center text-center"
            stagger={0.2}
          >
            <Reveal y={12} duration={0.6}>
              <div style={{ width: "clamp(116px, 17vw, 164px)" }}>
                <Logo guideSource guideReleased={step > 0} />
              </div>
            </Reveal>
            <Reveal className="mt-10" blur y={24} duration={0.7}>
              <h1 className="headline-md text-balance">
                one studio.
                <br />
                from idea to launch.
              </h1>
            </Reveal>
            <Reveal className="mt-5" duration={0.4}>
              <p className="body-muted">what brings you here?</p>
            </Reveal>
          </RevealGroup>

          <RevealGroup
            className="mt-14 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4"
            stagger={0.08}
            delay={0.45}
          >
            {SERVICES.map((s, index) => {
              const layout = SERVICE_CARD_LAYOUT[s.key];

              return (
                <Reveal key={s.key} className={layout?.className}>
                  <OptionCard
                    title={s.title}
                    blurb={s.blurb}
                    brief={s.brief}
                    Icon={s.Icon}
                    index={String(index + 1).padStart(2, "0")}
                    signal
                    featured={layout?.featured}
                    selected={s.key === "other" && showOther}
                    onClick={() => choose(s.key)}
                  />
                </Reveal>
              );
            })}
          </RevealGroup>

          {showOther && (
            <OtherInput
              value={other}
              onChange={setOther}
              onSubmit={submitOther}
            />
          )}
        </StepShell>
      </div>
    </>
  );
}
