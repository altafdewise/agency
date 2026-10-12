import type { Metadata } from "next";
import { Figtree, Urbanist } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { RealEstateSite } from "@/components/showcase/sites/RealEstateSite";

const display = Urbanist({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const body = Figtree({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample real estate website",
  description: "A sample website for a residential project with interiors, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Stone, forest green and brass.
const light = {
  "--s-bg": "#F4F2ED",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#E8E5DC",
  "--s-fg": "#161A17",
  "--s-muted": "#5C625D",
  "--s-line": "#DFDBD1",
  "--s-accent": "#2E4A3A",
  "--s-accent-ink": "#2E4A3A",
  "--s-brass": "#9A7436",
  "--s-on-accent": "#F4F2ED",
  "--s-shadow": "rgba(22,26,23,0.35)",
};
const dark = {
  "--s-bg": "#0F1210",
  "--s-surface": "#161B18",
  "--s-soft": "#1C221E",
  "--s-fg": "#EEECE6",
  "--s-muted": "#A2A9A3",
  "--s-line": "#262D28",
  "--s-accent": "#C9A66B",
  "--s-accent-ink": "#D8B97F",
  "--s-brass": "#C9A66B",
  "--s-on-accent": "#0F1210",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function RealEstateShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/local-business?utm_source=showcase&utm_medium=realestate">
      <RealEstateSite />
    </ShowcaseShell>
  );
}
