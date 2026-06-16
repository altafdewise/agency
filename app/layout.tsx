import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Inter — the open stand-in for Apple's SF Pro. Used for everything (display +
// body); on Apple devices the CSS stack prefers the real SF Pro / -apple-system.
const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

// Mono for the tiny step index (01 / 08).
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "maggie — one studio. from idea to launch.",
  description:
    "A creative studio. Tell us what you're building and get an instant, grounded estimate.",
  metadataBase: new URL("https://maggie.agency"),
  openGraph: {
    title: "maggie — one studio. from idea to launch.",
    description:
      "Tell us what you're building and get an instant, grounded estimate.",
    url: "https://maggie.agency",
    siteName: "maggie",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable}`}
    >
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
