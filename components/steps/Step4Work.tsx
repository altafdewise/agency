"use client";

import { ImageIcon } from "lucide-react";
import { StepShell } from "@/components/ui/StepShell";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";
import { getWorkSamples, type WorkSample } from "@/lib/content";
import { cn } from "@/lib/cn";

const ratioClass: Record<WorkSample["ratio"], string> = {
  tall: "aspect-[3/4]",
  wide: "aspect-[4/3]",
  square: "aspect-square",
};

export function Step4Work() {
  const { brief, next } = usePath();
  const samples = getWorkSamples(brief.needs);

  return (
    <StepShell eyebrow="A little proof" innerClassName="max-w-5xl">
      <Reveal blur y={24} duration={0.7}>
        <h2 className="headline-md max-w-3xl text-balance">proof, not promises.</h2>
      </Reveal>
      <Reveal className="mt-5" duration={0.4} delay={0.2}>
        <p className="body-muted max-w-xl">
          A taste of work in the space you&apos;re after.
        </p>
      </Reveal>

      {/* Masonry via CSS columns â€” varied heights, fully responsive. */}
      <RevealGroup
        className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3"
        stagger={0.08}
        delay={0.4}
      >
        {samples.map((s) => (
          <Reveal key={s.title} className="mb-4 break-inside-avoid">
            <WorkCard sample={s} />
          </Reveal>
        ))}
      </RevealGroup>

      <Reveal className="mt-14" delay={0.5}>
        <Button withArrow onClick={next}>
          keep going
        </Button>
      </Reveal>
    </StepShell>
  );
}

function WorkCard({ sample }: { sample: WorkSample }) {
  return (
    <figure
      className={cn(
        "group relative w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-foreground/[0.02] transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:border-accent/60 hover:shadow-card-hover",
        ratioClass[sample.ratio]
      )}
    >
      {/* Placeholder texture, shown until a real image is dropped at sample.src */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 120% at 70% 10%, rgba(242,238,227,0.06), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center transition-transform duration-500 ease-out-soft group-hover:scale-[1.02]"
        role="img"
        aria-label={`${sample.title} - ${sample.tag}. Case study coming soon.`}
      >
        <ImageIcon className="h-8 w-8 text-muted/45" strokeWidth={1.4} />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted/65">
          case study coming soon
        </span>
      </div>
      {/* Bottom scrim + label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent p-5 pt-12">
        <figcaption className="flex items-baseline justify-between gap-3">
          <span className="font-display text-lg text-foreground">{sample.title}</span>
          <span className="eyebrow shrink-0">{sample.tag}</span>
        </figcaption>
      </div>
    </figure>
  );
}
