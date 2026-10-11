import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";
import { LineReveal } from "@/components/ui/LineReveal";
import { ServiceExplorer } from "@/components/about/ServiceExplorer";
import { ProcessFlow } from "@/components/about/ProcessFlow";
import { loadPricingTable } from "@/lib/pricing-config";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Zev's Agency builds and how we work: websites, apps, AI, brand, content and security, with scopes, timelines and our process from brief to launch.",
};

// The rate card can be edited in admin; pick up changes within the hour.
export const revalidate = 3600;

const sectionHeading =
  "mt-5 font-display text-[clamp(2rem,4.4vw,3.5rem)] font-semibold leading-[1.04] tracking-tightest text-foreground";

export default async function AboutPage() {
  const table = await loadPricingTable();

  return (
    <PageShell className="max-w-5xl">
      <p className="eyebrow">About</p>
      <h1 className="headline-md mt-5 text-balance">
        one studio. build, create, grow.
      </h1>

      <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-muted sm:text-lg">
        Zev is a focused studio for the messy stretch between a rough idea and a
        launched product: websites, apps, AI features, brand systems, and the
        launch material around them.
      </p>

      <section aria-labelledby="what-we-do" className="mt-28 sm:mt-36">
        <p className="eyebrow">what we do</p>
        <LineReveal id="what-we-do" lines={["pick one. see what it takes"]} dot className={sectionHeading} />
        <ServiceExplorer table={table} />
      </section>

      <section aria-labelledby="how-we-work" className="mt-28 sm:mt-40">
        <p className="eyebrow">how we work</p>
        <LineReveal id="how-we-work" lines={["from brief to launch"]} dot className={sectionHeading} />
        <ProcessFlow />
      </section>
    </PageShell>
  );
}
