"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Moon, Sparkles, Sun, Pause } from "lucide-react";

/**
 * The frame every showcase site sits in: its palette for light and dark,
 * and a sticky switch so a prospect can flip between light/dark and
 * static/dynamic (motion on or off) while they look around. A small tag
 * makes clear it's a sample by Zev's Agency.
 */

export type Palette = Record<string, string>;
type Mode = { dark: boolean; dynamic: boolean };

const ModeContext = createContext<Mode>({ dark: false, dynamic: true });
export const useShowcaseMode = () => useContext(ModeContext);

const KEY = "zev_showcase_mode";

export function ShowcaseShell({
  light,
  dark,
  fontClass,
  zevHref,
  children,
}: {
  light: Palette;
  dark: Palette;
  fontClass: string;
  /** Where "Get a site like this" goes (the landing page for this kind of business). */
  zevHref: string;
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<Mode>({ dark: false, dynamic: true });

  // Restore the visitor's last choice; start static for reduced-motion users.
  useEffect(() => {
    let saved: Partial<Mode> = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      /* private mode */
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode({ dark: saved.dark ?? false, dynamic: saved.dynamic ?? !reduce });
  }, []);

  const update = (patch: Partial<Mode>) =>
    setMode((m) => {
      const next = { ...m, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* private mode */
      }
      return next;
    });

  const palette = mode.dark ? dark : light;

  // Overscroll and the area behind the page match the site, not the agency's dark body.
  useEffect(() => {
    document.body.classList.add("showcase-theme");
    document.body.style.background = palette["--s-bg"];
    document.documentElement.style.colorScheme = mode.dark ? "dark" : "light";
    return () => {
      document.body.classList.remove("showcase-theme");
      document.body.style.background = "";
      document.documentElement.style.colorScheme = "";
    };
  }, [palette, mode.dark]);

  return (
    <ModeContext.Provider value={mode}>
      <div
        className={`showcase min-h-[100dvh] bg-[var(--s-bg)] text-[var(--s-fg)] transition-colors duration-500 ${fontClass}`}
        style={palette as React.CSSProperties}
        data-dynamic={mode.dynamic}
      >
        {children}
        {mode.dynamic && <ScrollProgress />}
        <div className="h-24" aria-hidden />
        <ModeSwitch mode={mode} onChange={update} zevHref={zevHref} />
      </div>
    </ModeContext.Provider>
  );
}

function ModeSwitch({
  mode,
  onChange,
  zevHref,
}: {
  mode: Mode;
  onChange: (p: Partial<Mode>) => void;
  zevHref: string;
}) {
  const seg =
    "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors duration-200";
  const on = "bg-white text-neutral-950 shadow-sm";
  const off = "text-white/70 hover:text-white";

  return (
    <div className="fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center px-3">
      <div
        role="toolbar"
        aria-label="Preview options"
        className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-neutral-950/85 p-1 font-sans text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-md [scrollbar-width:none]"
      >
        <div className="flex rounded-full bg-white/10 p-0.5" role="group" aria-label="Theme">
          <button type="button" className={`${seg} ${!mode.dark ? on : off}`} aria-label="Light theme" aria-pressed={!mode.dark} onClick={() => onChange({ dark: false })}>
            <Sun className="h-3.5 w-3.5" strokeWidth={2} /> <span className="hidden sm:inline">Light</span>
          </button>
          <button type="button" className={`${seg} ${mode.dark ? on : off}`} aria-label="Dark theme" aria-pressed={mode.dark} onClick={() => onChange({ dark: true })}>
            <Moon className="h-3.5 w-3.5" strokeWidth={2} /> <span className="hidden sm:inline">Dark</span>
          </button>
        </div>
        <div className="flex rounded-full bg-white/10 p-0.5" role="group" aria-label="Motion">
          <button type="button" className={`${seg} ${!mode.dynamic ? on : off}`} aria-label="Static, no motion" aria-pressed={!mode.dynamic} onClick={() => onChange({ dynamic: false })}>
            <Pause className="h-3.5 w-3.5" strokeWidth={2} /> <span className="hidden sm:inline">Static</span>
          </button>
          <button type="button" className={`${seg} ${mode.dynamic ? on : off}`} aria-label="Dynamic, with motion" aria-pressed={mode.dynamic} onClick={() => onChange({ dynamic: true })}>
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} /> <span className="hidden sm:inline">Dynamic</span>
          </button>
        </div>
        <a
          href={zevHref}
          className="ml-1 inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-white/80 transition-colors hover:text-white"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF4438]" aria-hidden />
          <span className="hidden sm:inline">Sample by Zev · get yours</span>
          <span className="sm:hidden">Get this site</span>
        </a>
      </div>
    </div>
  );
}

/** Dynamic only: a thin bar in the site's accent that fills as you scroll. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-[var(--s-accent)]"
      style={{ scaleX }}
    />
  );
}
