import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PathProvider } from "@/components/PathProvider";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SiteChrome } from "@/components/SiteChrome";

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

const TITLE = "maggie — one studio. from idea to launch.";
const DESCRIPTION =
  "One studio, from idea to launch — websites, apps, AI, brand and more. Tell us what you're building and get an instant, grounded estimate.";

export const metadata: Metadata = {
  metadataBase: new URL("https://maggie.agency"),
  title: {
    default: TITLE,
    template: "%s · maggie",
  },
  description: DESCRIPTION,
  applicationName: "maggie",
  keywords: [
    "creative studio",
    "web design",
    "app development",
    "AI integration",
    "branding",
    "maggie.agency",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://maggie.agency",
    siteName: "maggie",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {/* Flow state lives at the root so it survives visiting other pages. */}
        <PathProvider>
          <AnalyticsTracker />
          <SiteChrome />
          {children}
        </PathProvider>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
