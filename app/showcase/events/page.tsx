import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { EventsSite } from "@/components/showcase/sites/EventsSite";

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample function hall website",
  description: "A sample website for a function hall & lawns, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Maroon and old gold on ivory; near-black wine for dark.
const light = {
  "--s-bg": "#FBF7F0",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#F3E7D4",
  "--s-fg": "#2A1418",
  "--s-muted": "#6D5A5C",
  "--s-line": "#E8DCCB",
  "--s-accent": "#7A1E2C",
  "--s-accent-ink": "#7A1E2C",
  "--s-gold": "#A87A22",
  "--s-on-accent": "#FBF7F0",
  "--s-shadow": "rgba(42,20,24,0.35)",
};
const dark = {
  "--s-bg": "#130A0C",
  "--s-surface": "#1C1013",
  "--s-soft": "#29171B",
  "--s-fg": "#F6EDE3",
  "--s-muted": "#BFA9A6",
  "--s-line": "#352024",
  "--s-accent": "#E2B65C",
  "--s-accent-ink": "#E9C57A",
  "--s-gold": "#E2B65C",
  "--s-on-accent": "#130A0C",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function EventsShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/local-business?utm_source=showcase&utm_medium=events">
      <EventsSite />
    </ShowcaseShell>
  );
}
