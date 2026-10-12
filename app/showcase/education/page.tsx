import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { EducationSite } from "@/components/showcase/sites/EducationSite";

const display = Fredoka({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-display" });
const body = Nunito({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample play school website",
  description: "A sample website for a play school & learning centre, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Sky blue and sunshine yellow on warm white; navy for dark.
const light = {
  "--s-bg": "#FFFBF1",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#FFF0C4",
  "--s-soft-2": "#E3EDFF",
  "--s-fg": "#1F2340",
  "--s-muted": "#585D7C",
  "--s-line": "#EFE6CF",
  "--s-accent": "#2F6BDE",
  "--s-accent-ink": "#2A5FC7",
  "--s-accent-2": "#FFC93C",
  "--s-on-accent": "#FFFFFF",
  "--s-shadow": "rgba(31,35,64,0.35)",
};
const dark = {
  "--s-bg": "#11132A",
  "--s-surface": "#191C38",
  "--s-soft": "#2A2A3E",
  "--s-soft-2": "#1F2650",
  "--s-fg": "#F4F1E6",
  "--s-muted": "#A8ABCB",
  "--s-line": "#2A2F57",
  "--s-accent": "#7FA6FF",
  "--s-accent-ink": "#9DBBFF",
  "--s-accent-2": "#FFD45E",
  "--s-on-accent": "#11132A",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function EducationShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/coaching?utm_source=showcase&utm_medium=education">
      <EducationSite />
    </ShowcaseShell>
  );
}
