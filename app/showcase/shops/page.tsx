import type { Metadata } from "next";
import { Karla, Marcellus } from "next/font/google";
import { ShowcaseShell } from "@/components/showcase/ShowcaseShell";
import { ShopsSite } from "@/components/showcase/sites/ShopsSite";

const display = Marcellus({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const body = Karla({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Sample boutique website",
  description: "A sample website for a handloom & ethnic-wear boutique, designed by Zev's Agency. Flip light/dark and static/dynamic.",
  robots: { index: false, follow: true },
};

// Ikat teal and rose on unbleached cotton; deep teal-black for dark.
const light = {
  "--s-bg": "#F7F3EC",
  "--s-surface": "#FFFFFF",
  "--s-soft": "#EFE6D8",
  "--s-fg": "#1B2829",
  "--s-muted": "#5D6766",
  "--s-line": "#E4DACB",
  "--s-accent": "#0F5C5B",
  "--s-accent-ink": "#0F5C5B",
  "--s-on-accent": "#F7F3EC",
  "--s-tile-1": "#D9E6E2",
  "--s-tile-2": "#F0D9D6",
  "--s-tile-3": "#E9E0C9",
  "--s-tile-4": "#E3D5E3",
  "--s-shadow": "rgba(27,40,41,0.35)",
};
const dark = {
  "--s-bg": "#0D1515",
  "--s-surface": "#131E1E",
  "--s-soft": "#1A2727",
  "--s-fg": "#EFEAE1",
  "--s-muted": "#A3AFAC",
  "--s-line": "#243232",
  "--s-accent": "#7CCBC4",
  "--s-accent-ink": "#8FD6CF",
  "--s-on-accent": "#0D1515",
  "--s-tile-1": "#16302E",
  "--s-tile-2": "#3A2228",
  "--s-tile-3": "#2F2A1C",
  "--s-tile-4": "#2C2233",
  "--s-shadow": "rgba(0,0,0,0.7)",
};

export default function ShopsShowcase() {
  return (
    <ShowcaseShell light={light} dark={dark} fontClass={`${display.variable} ${body.variable}`} zevHref="/for/local-business?utm_source=showcase&utm_medium=shops">
      <ShopsSite />
    </ShowcaseShell>
  );
}
