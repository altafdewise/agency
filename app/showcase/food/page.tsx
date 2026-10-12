import type { Metadata } from "next";
import { DM_Serif_Display, Outfit } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { FoodSite } from "@/components/showcase/sites/FoodSite";

const display = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Outfit({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample café website",
  description: "A sample website for a café & bakery, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Espresso, cream and burnt orange.
const light = {
  "--s-bg": "#FBF6EF",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#F3E5D4",
  "--s-fg": "#2B1B12",
  "--s-muted": "#6E5A4C",
  "--s-line": "#EADCCB",
  "--s-accent": "#B9472A",
  "--s-accent-ink": "#A63F24",
  "--s-on-accent": "#FFF7EF",
  "--s-shadow": "rgba(43,27,18,0.35)",
};
const dark = {
  "--s-bg": "#15100C",
  "--s-surface": "#1D1611",
  "--s-soft": "#281D15",
  "--s-fg": "#F5EBDF",
  "--s-muted": "#B8A291",
  "--s-line": "#33261D",
  "--s-accent": "#F08A5D",
  "--s-accent-ink": "#F2A07C",
  "--s-on-accent": "#15100C",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function FoodShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/cafes?utm_source=showcase&utm_medium=food">
      <FoodSite />
    </ShowcaseShell>
  );
}
