import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mic, Scale, ScrollText } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";

export const metadata: Metadata = {
  title: "Legal Help",
  description:
    "For legal clarity, documents, and lawyer-ready next steps, visit deJure Book.",
};

const SUPPORT_POINTS = [
  {
    title: "Speak the problem",
    body: "Start with the issue in your own words. deJure Book is built around Awaaz, a voice-first legal companion.",
    Icon: Mic,
  },
  {
    title: "Get direction",
    body: "The flow is designed to turn legal stress into clearer next steps, not another confusing search rabbit hole.",
    Icon: Scale,
  },
  {
    title: "Move to the right help",
    body: "When the matter needs human expertise, deJure Book helps you move toward the right lawyer or useful legal template.",
    Icon: ScrollText,
  },
];

export default function LegalHelpPage() {
  return (
    <PageShell className="max-w-4xl">
      <p className="eyebrow">Legal Help</p>
      <h1 className="headline-md mt-5 max-w-3xl text-balance">
        need legal clarity? go through deJure Book.
      </h1>

      <div className="mt-8 max-w-2xl space-y-5 text-base font-light leading-relaxed text-muted sm:text-lg">
        <p>
          maggie is the studio for websites, apps, AI, brand, and launch work.
          If what you need is legal help, we route that to deJure Book, the
          legal-side team built to help people understand what to do next.
        </p>
        <p>
          deJure Book is built around Awaaz for your rights: speak your legal
          problem, get calmer direction, and move toward lawyer-ready next steps
          when the issue needs proper legal support.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="https://www.dejurebook.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-transform duration-200 hover:scale-[1.02] focus-visible:scale-[1.02] active:scale-[0.98] sm:w-auto"
        >
          Visit deJure Book
          <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} aria-hidden />
        </Link>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-full border border-border bg-foreground/[0.03] px-6 py-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-accent hover:text-accent sm:w-auto"
        >
          Back to maggie
        </Link>
      </div>

      <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUPPORT_POINTS.map(({ title, body, Icon }, index) => (
          <article
            key={title}
            className="relative overflow-hidden rounded-lg border border-border bg-foreground/[0.025] p-5"
          >
            <span className="font-mono text-[0.63rem] text-muted/50">
              {String(index + 1).padStart(2, "0")}
            </span>
            <Icon
              className="mt-6 h-5 w-5 text-accent"
              strokeWidth={1.5}
              aria-hidden
            />
            <h2 className="mt-5 font-display text-xl font-semibold tracking-tightest text-foreground">
              {title}
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-muted">
              {body}
            </p>
          </article>
        ))}
      </section>

      <p className="mt-10 max-w-2xl text-xs font-light leading-relaxed text-muted/70">
        This page is a referral path, not legal advice from maggie. For legal
        questions, use deJure Book and consult a qualified lawyer for your
        specific situation.
      </p>
    </PageShell>
  );
}
