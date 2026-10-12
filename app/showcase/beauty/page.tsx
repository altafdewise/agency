import type { Metadata } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { BeautySite } from "@/components/showcase/sites/BeautySite";

const display = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display" });
const body = Jost({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample salon website",
  description: "A sample website for a salon & spa, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Blush and mocha; deep cocoa for dark.
const light = {
  "--s-bg": "#FBF5F2",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#F3E1DA",
  "--s-fg": "#2B1E1B",
  "--s-muted": "#6F5F5A",
  "--s-line": "#EADAD3",
  "--s-accent": "#9C5A4B",
  "--s-accent-ink": "#94513F",
  "--s-on-accent": "#FFFFFF",
  "--s-shadow": "rgba(43,30,27,0.35)",
};
const dark = {
  "--s-bg": "#150F0E",
  "--s-surface": "#1E1615",
  "--s-soft": "#2A1E1C",
  "--s-fg": "#F6ECE8",
  "--s-muted": "#BBA7A1",
  "--s-line": "#3A2B28",
  "--s-accent": "#E6A898",
  "--s-accent-ink": "#EDB6A7",
  "--s-on-accent": "#150F0E",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function BeautyShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/salons?utm_source=showcase&utm_medium=beauty">
      <BeautySite />
    </ShowcaseShell>
  );
}
