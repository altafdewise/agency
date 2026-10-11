import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { CONTACT, mailtoHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Legal",
  description: "Privacy policy and terms of service for zev.world.",
  robots: { index: false, follow: true },
};

const DOCS = [
  {
    href: "/privacy",
    title: "Privacy Policy",
    blurb: "What we collect, why, and what you can ask us to do with it.",
  },
  {
    href: "/terms",
    title: "Terms of Service",
    blurb: "Estimates, how projects are agreed, and who owns the work.",
  },
];

export default function LegalPage() {
  return (
    <PageShell>
      <p className="eyebrow">Legal</p>
      <h1 className="headline-md mt-5 text-balance">the fine print, kept plain.</h1>

      <ul className="mt-14">
        {DOCS.map((doc, i) => (
          <li key={doc.href} className="border-t border-border last:border-b">
            <Link href={doc.href} className="group flex items-center gap-5 py-8 sm:gap-8">
              <span className="w-7 shrink-0 font-mono text-xs tabular-nums text-muted transition-colors duration-300 group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl font-semibold tracking-tight text-foreground transition-transform duration-500 ease-out-soft group-hover:translate-x-2 sm:text-3xl">
                  {doc.title}
                </span>
                <span className="mt-2 block text-sm font-light text-muted">{doc.blurb}</span>
              </span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-foreground/15 text-foreground transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-background">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm font-light text-muted">
        Questions about your data or these terms?{" "}
        <a
          href={mailtoHref("Legal question for Zev")}
          className="text-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          {CONTACT.email}
        </a>
      </p>
    </PageShell>
  );
}
