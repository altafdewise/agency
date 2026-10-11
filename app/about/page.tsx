import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = {
  title: "About",
  description:
    "One studio for websites, apps, AI features, brand, and launch support.",
};

export default function AboutPage() {
  return (
    <PageShell>
      <p className="eyebrow">About</p>
      <h1 className="headline-md mt-5 text-balance">
        one studio. build, create, grow.
      </h1>

      <p className="mt-8 max-w-2xl text-base font-light leading-relaxed text-muted sm:text-lg">
        Zev is a focused studio for the messy stretch between a rough idea and a
        launched product: websites, apps, AI features, brand systems, and the
        launch material around them.
      </p>
    </PageShell>
  );
}
