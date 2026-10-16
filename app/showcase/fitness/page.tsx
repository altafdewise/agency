import type { Metadata } from "next";
import { Gilda_Display, Hanken_Grotesk } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { FitnessSite } from "@/components/showcase/sites/FitnessSite";

const display = Gilda_Display({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample fitness club website",
  description: "A sample website for a private strength & wellness club, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Ivory, ink and bronze; warm charcoal and champagne for dark.
const light = {
  "--s-bg": "#F4F0E8",
  "--s-surface": "#FAF7F1",
  "--s-soft": "#E9E2D5",
  "--s-fg": "#1A1714",
  "--s-muted": "#6A6258",
  "--s-line": "#DCD3C4",
  "--s-accent": "#8A6A45",
  "--s-accent-ink": "#7A5C3A",
  "--s-on-accent": "#F4F0E8",
  "--s-shadow": "rgba(26,23,20,0.3)",
};
const dark = {
  "--s-bg": "#12100E",
  "--s-surface": "#191613",
  "--s-soft": "#221E1A",
  "--s-fg": "#EEE8DE",
  "--s-muted": "#A2998D",
  "--s-line": "#2D2823",
  "--s-accent": "#C9A57C",
  "--s-accent-ink": "#D4B38D",
  "--s-on-accent": "#12100E",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function FitnessShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/gyms?utm_source=showcase&utm_medium=fitness">
      <FitnessSite />
    </ShowcaseShell>
  );
}
