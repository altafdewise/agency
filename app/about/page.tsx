import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = {
  title: "About",
  description:
    "One studio — build, create, grow. The story, the philosophy, and a look at the work.",
};

// TODO: refine all copy below — placeholder voice, confident and quiet.
const METRICS = [
  { value: "12+", label: "apps shipped" },
  { value: "40+", label: "projects delivered" },
  { value: "6 yrs", label: "building" }, // TODO: confirm real number
  { value: "24h", label: "simple builds delivered" },
];

// TODO: replace with real project cards (image/video + title + link).
const WORK_SLOTS = [
  { title: "Project 01", tag: "Web" },
  { title: "Project 02", tag: "App" },
  { title: "Project 03", tag: "Brand" },
  { title: "Project 04", tag: "AI" },
  { title: "Project 05", tag: "Design" },
  { title: "Project 06", tag: "Content" },
];

export default function AboutPage() {
  return (
    <PageShell>
      {/* a) story */}
      <p className="eyebrow">About</p>
      <h1 className="headline-md mt-5 text-balance">
        one studio. build, create, grow.
      </h1>

      <div className="mt-8 space-y-5 text-base font-light leading-relaxed text-muted sm:text-lg">
        <p>
          maggie started as one stubborn idea: that a single, focused studio can
          take something from a rough thought to a real, launched product —
          without the hand-offs, the bloat, or the noise.
        </p>
        <p>
          We build websites, apps, AI features, brands and the content around
          them. Same team, same standard, start to finish. We&apos;d rather ship
          one thing you&apos;re proud of than ten you forget.
        </p>
        <p>
          Quietly obsessive about craft, allergic to fluff. You bring the idea —
          we bring the build, the taste, and the follow-through.
        </p>
      </div>

      {/* b) metrics */}
      <div className="mt-16 grid grid-cols-2 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
        {METRICS.map((m) => (
          <div key={m.label} className="flex flex-col">
            <span className="font-display text-4xl font-semibold leading-none tracking-tightest text-foreground sm:text-5xl">
              {m.value}
            </span>
            <span className="eyebrow mt-3">{m.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-light text-muted/60">
        {/* TODO: replace placeholder metrics with verified numbers */}
        Indicative figures while full case studies are in the works.
      </p>

      {/* c) proof / portfolio */}
      <section id="work" className="mt-20 scroll-mt-28">
        <p className="eyebrow">Selected work</p>
        <h2 className="headline-md mt-4 text-balance">proof, not promises.</h2>

        {/* TODO: replace with real project cards (image/video + title + link). */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORK_SLOTS.map((slot, i) => (
            <figure
              key={slot.title}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-foreground/[0.02]"
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
                  {slot.title}
                </span>
                <span className="eyebrow shrink-0">{slot.tag}</span>
              </figcaption>
              <span className="absolute left-5 top-5 font-mono text-[0.63rem] text-muted/50">
                {String(i + 1).padStart(2, "0")}
              </span>
            </figure>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
