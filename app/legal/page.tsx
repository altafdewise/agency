import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/ui/PageShell";
import { CONTACT, mailtoHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Legal",
  description: "Legal information for maggie.agency.",
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  return (
    <PageShell>
      <p className="eyebrow">Legal</p>
      <h1 className="headline-md mt-5 text-balance">
        final terms are coming soon.
      </h1>

      <section className="mt-10 rounded-lg border border-border bg-foreground/[0.025] p-6">
        <p className="font-display text-2xl font-semibold tracking-tight text-foreground">
          We are finalizing this page.
        </p>
        <div className="mt-5 space-y-4 text-base font-light leading-relaxed text-muted">
          <p>
            The reviewed privacy and terms copy is not published yet. Until it
            is, we are keeping this page intentionally clear instead of filling
            it with placeholder legal text.
          </p>
          <p>
            If you have questions about how a brief, estimate, booking, or
            contact detail will be handled, email us and we will answer directly.
          </p>
        </div>

        <Link
          href={mailtoHref("Legal question for maggie", "Hi maggie - I have a legal/privacy question.")}
          className="mt-8 inline-flex min-h-[44px] items-center rounded-full border border-foreground/25 px-6 text-sm font-medium text-foreground transition-colors hover:border-accent/55 hover:text-accent"
        >
          {CONTACT.email}
        </Link>
      </section>
    </PageShell>
  );
}
