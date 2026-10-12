import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { HealthSite } from "@/components/showcase/sites/HealthSite";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample clinic website",
  description: "A sample website for a family & dental clinic, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Sage green on warm white; deep green-black for dark.
const light = {
  "--s-bg": "#F7F8F4",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#E5EFE7",
  "--s-fg": "#13221B",
  "--s-muted": "#56665D",
  "--s-line": "#E1E6DF",
  "--s-accent": "#2E6E52",
  "--s-accent-ink": "#2E6E52",
  "--s-on-accent": "#F7F8F4",
  "--s-shadow": "rgba(19,34,27,0.35)",
};
const dark = {
  "--s-bg": "#0D1411",
  "--s-surface": "#131D19",
  "--s-soft": "#17251F",
  "--s-fg": "#E8F0EA",
  "--s-muted": "#98ABA1",
  "--s-line": "#22302A",
  "--s-accent": "#7FCFA6",
  "--s-accent-ink": "#7FCFA6",
  "--s-on-accent": "#0D1411",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function HealthShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/clinics?utm_source=showcase&utm_medium=health">
      <HealthSite />
    </ShowcaseShell>
  );
}
