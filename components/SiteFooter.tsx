"use client";

import Link from "next/link";
import { CONTACT, mailtoHref } from "@/lib/contact";

const FOOTER_LINKS = [
  { label: "Work", href: "/about#work" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Legal", href: "/legal" },
];

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
      <div className="mx-auto w-full max-w-path border-t border-foreground/[0.08] pt-10">
        <div className="flex flex-col gap-9 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            aria-label="Maggie&rsquo;s Agency — home"
            className="inline-flex items-center text-foreground transition-opacity duration-200 hover:opacity-75"
          >
            <FooterMark />
          </Link>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-light text-muted transition-colors duration-200 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={mailtoHref("Hello maggie")}
              className="text-sm font-light text-muted transition-colors duration-200 hover:text-foreground"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 text-xs font-light text-muted/60 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Maggie&rsquo;s Agency — for brands ready to move.</p>
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
