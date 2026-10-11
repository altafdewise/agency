"use client";

import Link from "next/link";
import { CONTACT } from "@/lib/contact";
import { INSTAGRAM_URL } from "@/lib/site";

/** The "7." brand mark (bone, via mask) — same asset the nav uses. */
function FooterMark() {
  return (
    <span
      aria-hidden
      className="block bg-foreground"
      style={{
        height: 30,
        width: 24,
        WebkitMaskImage: "url(/Logo/logo-full.png)",
        maskImage: "url(/Logo/logo-full.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        filter: "drop-shadow(0 0 6px rgba(242,238,227,0.12))",
      }}
    />
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full px-6 pb-10 pt-16 sm:px-10 sm:pb-12">
      <div className="mx-auto flex w-full max-w-path flex-col items-center gap-6 border-t-0 border-foreground/[0.08] pt-10 text-center sm:border-t">
        <Link
          href="/"
          aria-label="Zev&rsquo;s Agency — home"
          className="inline-flex items-center text-foreground transition-opacity duration-200 hover:opacity-75"
        >
          <FooterMark />
        </Link>

        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-light text-muted">
          <Link href="/portfolio" className="transition-colors duration-200 hover:text-foreground">
            Story
          </Link>
          <Link href="/blog" className="transition-colors duration-200 hover:text-foreground">
            Blog
          </Link>
          {INSTAGRAM_URL && (
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer me"
              className="transition-colors duration-200 hover:text-foreground"
            >
              Instagram
            </a>
          )}
          <Link href="/privacy" className="transition-colors duration-200 hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors duration-200 hover:text-foreground">
            Terms
          </Link>
        </nav>

        <div className="flex flex-col items-center gap-1.5 text-xs font-light text-muted/60">
          <p>&copy; {year} Zev&rsquo;s Agency for brands ready to move.</p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="transition-colors duration-200 hover:text-foreground"
          >
            {CONTACT.email}
          </a>
        </div>
      </div>
    </footer>
  );
}
