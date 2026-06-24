"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Logo from "@/components/Logo";
import { StepShell } from "@/components/ui/StepShell";
import { OtherInput } from "@/components/ui/OtherInput";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";
import { ServiceList } from "./ServiceList";
import { TestimonialsSection } from "@/components/testimonials/TestimonialsSection";
import { ImpactStatSection } from "@/components/impact/ImpactStatSection";
import { WorkTeaserSection } from "@/components/home/WorkTeaserSection";
import { ProcessArcSection } from "@/components/home/ProcessArcSection";
import { ClosingCtaSection } from "@/components/home/ClosingCtaSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { AnonymousFeedbackSection } from "@/components/feedback/AnonymousFeedbackSection";
import { SiteFooter } from "@/components/SiteFooter";

// WebGL hero orb — client-only (no SSR for the Three.js canvas).
const AyraOrb = dynamic(() => import("@/components/AyraOrb"), { ssr: false });

export function Step1Needs() {
  const router = useRouter();
  const { update, next, brief, step } = usePath();
  const reduce = useReducedMotion();
  const [showOther, setShowOther] = useState(brief.needs.includes("other"));
  const [other, setOther] = useState(brief.customNeed ?? "");

  const choose = (key: string) => {
    if (key === "legal_help") {
      router.push("/legal-help");
      return;
    }
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
        <StepShell className="lg:hidden">
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
                no fluff.
                <br />
                just build.
              </h1>
            </Reveal>
            <Reveal className="mt-5" duration={0.4}>
              <p className="body-muted">what brings you here?</p>
            </Reveal>
          </RevealGroup>

          <ServiceList onChoose={choose} showOther={showOther} />

          {showOther && (
            <OtherInput
              value={other}
              onChange={setOther}
              onSubmit={submitOther}
            />
          )}
        </StepShell>

        <section
          className="relative hidden w-full px-10 lg:block"
          aria-label="What brings you here?"
        >
          <div className="mx-auto grid min-h-[200dvh] w-full max-w-path grid-cols-[minmax(300px,0.86fr)_minmax(430px,1fr)] gap-14 xl:gap-20">
            <div className="sticky top-0 flex h-[100dvh] items-center">
              <RevealGroup
                className="relative z-10 max-w-[620px] text-left"
                stagger={0.18}
              >
                <Reveal y={10} duration={0.55}>
                  <div style={{ width: "clamp(86px, 8vw, 124px)" }}>
                    <Logo guideSource guideReleased={step > 0} />
                  </div>
                </Reveal>
                <Reveal className="mt-9" blur y={22} duration={0.65}>
                  <h1 className="text-balance font-display text-[clamp(3.35rem,5.45vw,6.25rem)] font-semibold leading-[0.95] tracking-normal text-foreground">
                    no fluff.
                    <br />
                    just build.
                  </h1>
                </Reveal>
                <Reveal className="mt-5" duration={0.4}>
                  <p className="font-sans text-base font-light leading-relaxed text-foreground/48">
                    what brings you here?
                  </p>
                </Reveal>
              </RevealGroup>
            </div>

            <div className="flex min-h-[200dvh] flex-col justify-center py-[36dvh]">
              <ServiceList
                onChoose={choose}
                showOther={showOther}
                className="mt-0"
                listClassName="mx-0 max-w-[640px] gap-10 xl:gap-12"
                forceScrollFocus
              />

              {showOther && (
                <div className="w-full max-w-[640px] [&>div]:mx-0">
                  <OtherInput
                    value={other}
                    onChange={setOther}
                    onSubmit={submitOther}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Section 3 — client testimonials (stacked-card carousel). */}
      <TestimonialsSection />

      {/* Section 4 — impact stat. */}
      <ImpactStatSection />

      <WorkTeaserSection />

      {/* Process / how it works — scroll-driven curved arc. */}
      <ProcessArcSection />

      {/* FAQ — numbered single-open accordion. */}
      <FaqSection />

      {/* Section 5 — anonymous issue / feedback drop. */}
      <AnonymousFeedbackSection />

      {/* Closing CTA — sends visitors back up to the funnel (#tap-funnel). */}
      <ClosingCtaSection onStart={scrollToFunnel} />

      <SiteFooter />
    </>
  );
}
