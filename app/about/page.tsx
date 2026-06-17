import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = {
  title: "About",
  description:
    "One studio for websites, apps, AI features, brand, and launch support.",
};

const METRICS = [
  { label: "Projects shipped" },
  { label: "Apps and sites" },
  { label: "Years building" },
  { label: "Case studies" },
];

const WORK_AREAS = [
  "Web",
  "Apps",
  "AI",
  "Brand",
  "Design",
  "Content",
];

export default function AboutPage() {
  return (
    <PageShell>
      <p className="eyebrow">About</p>
      <h1 className="headline-md mt-5 text-balance">
        one studio. build, create, grow.
      </h1>

      <div className="mt-8 space-y-5 text-base font-light leading-relaxed text-muted sm:text-lg">
        <p>
          maggie is being shaped as a focused studio for the messy stretch
          between a rough idea and a launched product: websites, apps, AI
          features, brand systems, and the launch material around them.
        </p>
        <p>
          The public case studies and studio numbers are being finalized now.
          Until they are ready, this page stays intentionally quiet rather than
          pretending the proof is already published.
        </p>
      </div>

      <section className="mt-16 rounded-lg border border-border bg-foreground/[0.025] p-6">
        <p className="eyebrow">Studio proof</p>
        <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-muted">
          Verified metrics and selected work are coming soon. If you need
          examples before then, reach out and we will share the most relevant
          work directly.
        </p>
      </section>

      <div className="mt-12 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
        {METRICS.map((metric) => (
          <div key={metric.label} className="flex flex-col">
            <span className="font-display text-4xl font-semibold leading-none tracking-tightest text-muted/55 sm:text-5xl">
              -
            </span>
            <span className="eyebrow mt-3">{metric.label}</span>
            <span className="mt-2 text-xs font-light text-muted/60">
              coming soon
            </span>
          </div>
        ))}
      </div>

      <section id="work" className="mt-20 scroll-mt-28">
        <p className="eyebrow">Selected work</p>
        <h2 className="headline-md mt-4 text-balance">case studies soon.</h2>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_AREAS.map((area, index) => (
            <figure
              key={area}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-foreground/[0.02]"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 120% at 70% 10%, rgba(242,238,227,0.06), transparent 60%)",
                }}
                aria-hidden
              />
              <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-3 p-5">
                <span className="font-display text-lg text-foreground/80">
                  {area}
                </span>
                <span className="eyebrow shrink-0">coming soon</span>
              </figcaption>
              <span className="absolute left-5 top-5 font-mono text-[0.63rem] text-muted/50">
                {String(index + 1).padStart(2, "0")}
              </span>
            </figure>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
