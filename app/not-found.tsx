import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";

// Set explicitly so it overrides the site-wide "index, follow".
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <PageShell>
      <p className="eyebrow">404</p>
      <h1 className="headline-md mt-5 text-balance">
        this page wandered off<span className="text-accent">.</span>
      </h1>
      <p className="body-muted mt-6 max-w-lg">
        The link might be old, or the address has a typo. Everything else is right where you left it.
      </p>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="group inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-7 text-sm font-medium text-background transition-[filter] duration-200 hover:brightness-110"
        >
          back to zev
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} />
        </Link>
        <Link
          href="/blog"
          className="inline-flex min-h-[48px] items-center rounded-full border border-foreground/25 px-7 text-sm font-medium text-foreground transition-colors duration-200 hover:border-foreground/45 hover:bg-foreground/[0.04]"
        >
          read the blog
        </Link>
      </div>
    </PageShell>
  );
}
