"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Menu, X } from "lucide-react";
import { usePath } from "@/components/PathProvider";
import { mailtoHref } from "@/lib/contact";
import { tick } from "@/lib/haptics";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { label: "Work", href: "/about#work" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Legal", href: "/legal" },
];

/** Small static "7." mark (bone, via mask) used in the corner. */
function NavMark() {
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
        filter: "drop-shadow(0 0 8px rgba(242,238,227,0.25))",
      }}
    />
  );
}

export function SiteNav() {
  const { step, goTo, back } = usePath();
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const onHome = pathname === "/";
  const showBack = onHome && step > 0;

  // Close the overlay whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll + close on Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const goHome = () => {
    tick();
    setOpen(false);
    goTo(0); // logo acts as home / restart
    if (!onHome) router.push("/");
  };

  return (
    <>
      {/* top-left cluster: logo (home/restart) + optional back */}
      <div className="fixed left-4 top-4 z-50 flex items-center gap-1 sm:left-6 sm:top-6">
        <button
          type="button"
          onClick={goHome}
          aria-label="maggie — home"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-opacity duration-200 hover:opacity-80"
        >
          <NavMark />
        </button>
        {showBack && (
          <button
            type="button"
            onClick={() => {
              tick();
              back();
            }}
            aria-label="Go back a step"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-200 hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* top-right: minimal menu trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="fixed right-4 top-4 z-50 flex h-10 items-center gap-2 rounded-full px-2 text-muted transition-colors duration-200 hover:text-accent sm:right-6 sm:top-6"
      >
        <span className="hidden text-xs font-medium uppercase tracking-[0.25em] sm:inline">
          menu
        </span>
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* full-screen overlay (always mounted; toggled — avoids AnimatePresence) */}
      <motion.div
        initial={false}
        animate={
          open
            ? { opacity: 1, scale: 1 }
            : { opacity: 0, scale: reduce ? 1 : 1.03 }
        }
        transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed inset-0 z-[70] flex items-center justify-center",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        {/* backdrop */}
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 cursor-default bg-background/80 backdrop-blur-md"
        />

        {/* close */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          aria-label="Close menu"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:text-accent sm:right-6 sm:top-6"
        >
          <X className="h-6 w-6" strokeWidth={1.5} />
        </button>

        {/* links */}
        <nav className="relative flex flex-col items-center gap-3 sm:gap-5">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="font-display text-3xl font-semibold leading-none tracking-tightest text-foreground transition-colors duration-200 hover:text-accent sm:text-5xl"
            >
              {item.label}
            </Link>
          ))}
          <a
            href={mailtoHref("Hello maggie")}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            className="font-display text-3xl font-semibold leading-none tracking-tightest text-foreground transition-colors duration-200 hover:text-accent sm:text-5xl"
          >
            Contact
          </a>
        </nav>
      </motion.div>
    </>
  );
}
