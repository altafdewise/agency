import type { Metadata } from "next";
import { Anton, Barlow } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { FitnessBoldSite } from "@/components/showcase/sites/FitnessBoldSite";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample hardcore gym website",
  description: "A bold sample website for a strength & combat gym, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Pitch black and blood red; raw concrete for light.
const dark = {
  "--s-bg": "#0A0A0A",
  "--s-surface": "#121212",
  "--s-soft": "#1A1A1A",
  "--s-fg": "#F2F1EE",
  "--s-muted": "#8E8C88",
  "--s-line": "#262626",
  "--s-accent": "#E10600",
  "--s-accent-ink": "#FF2A1F",
  "--s-on-accent": "#FFFFFF",
  "--s-shadow": "rgba(0,0,0,0.8)",
};
const light = {
  "--s-bg": "#ECEAE6",
  "--s-surface": "#F6F5F2",
  "--s-soft": "#DFDCD6",
  "--s-fg": "#0A0A0A",
  "--s-muted": "#55524E",
  "--s-line": "#CFCBC4",
  "--s-accent": "#D00000",
  "--s-accent-ink": "#C00000",
  "--s-on-accent": "#FFFFFF",
  "--s-shadow": "rgba(0,0,0,0.35)",
};

export default function FitnessBoldShowcase() {
  return (
    <ShowcaseShell
      light={light}
      dark={dark}
      fontClass={`${display.variable} ${body.variable}`}
      zevHref="/for/gyms?utm_source=showcase&utm_medium=fitness-bold"
      defaultDark
    >
      <FitnessBoldSite />
    </ShowcaseShell>
  );
}
