import type { Metadata } from "next";
import { Archivo, Bebas_Neue } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { FitnessSite } from "@/components/showcase/sites/FitnessSite";

const display = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Archivo({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample gym website",
  description: "A sample website for a gym, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Concrete and signal orange.
const light = {
  "--s-bg": "#F4F3F1",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#ECEAE6",
  "--s-fg": "#111111",
  "--s-muted": "#5E5C58",
  "--s-line": "#DEDBD5",
  "--s-accent": "#FF6A1A",
  "--s-accent-ink": "#D9520A",
  "--s-on-accent": "#111111",
  "--s-shadow": "rgba(0,0,0,0.35)",
};
const dark = {
  "--s-bg": "#0E0E0E",
  "--s-surface": "#171717",
  "--s-soft": "#1F1F1F",
  "--s-fg": "#F4F3F1",
  "--s-muted": "#A3A09A",
  "--s-line": "#2A2A2A",
  "--s-accent": "#FF7A2E",
  "--s-accent-ink": "#FF8A45",
  "--s-on-accent": "#111111",
  "--s-shadow": "rgba(0,0,0,0.8)",
};

export default function FitnessShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/gyms?utm_source=showcase&utm_medium=fitness">
      <FitnessSite />
    </ShowcaseShell>
  );
}
