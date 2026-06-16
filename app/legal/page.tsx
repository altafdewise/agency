import type { Metadata } from "next";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = {
  title: "Legal",
  description: "Privacy note and terms for maggie.agency.",
  robots: { index: false, follow: true },
};

/* TODO: replace with reviewed legal copy. The text below is plain-language
   placeholder only — NOT legal advice and not a substitute for real terms. */
export default function LegalPage() {
  return (
    <PageShell>
      <p className="eyebrow">Legal</p>
      <h1 className="headline-md mt-5 text-balance">the short version.</h1>
      <p className="mt-6 text-sm font-light text-muted/70">
        {/* TODO: replace with reviewed legal copy */}
        Plain-language placeholders below — to be replaced with reviewed terms.
      </p>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Privacy note
        </h2>
        <div className="mt-5 space-y-4 text-base font-light leading-relaxed text-muted">
          <p>
            When you walk the path or send a message, we collect only what you
            give us — your brief, and optionally your name, email or phone — so
            we can get back to you with an estimate and follow up.
          </p>
          <p>
            We don&apos;t sell or share your information with third parties for
            marketing. We don&apos;t spam. You can ask us to delete your details
            at any time.
          </p>
          <p>
            Anything you submit may be processed to generate your estimate
            (including via our AI estimator). We keep it to what&apos;s needed to
            quote and contact you.
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Terms
        </h2>
        <div className="mt-5 space-y-4 text-base font-light leading-relaxed text-muted">
          <p>
            Estimates shown here are indicative ranges, not fixed quotes. Final
            scope, price and timeline are confirmed in writing before any work
            begins.
          </p>
          <p>
            This site and its content are provided as-is. Sample numbers and
            placeholder work shown are for illustration while full case studies
            are prepared.
          </p>
          <p>
            By contacting us you agree we may reply using the details you
            provided. Nothing here creates a binding contract until we both
            confirm a project in writing.
          </p>
        </div>
      </section>

      <p className="mt-16 text-xs font-light text-muted/50">
        Questions about any of this? Reach out via the menu — we&apos;re happy to
        explain in plain terms.
      </p>
    </PageShell>
  );
}
