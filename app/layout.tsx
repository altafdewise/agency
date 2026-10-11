import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PathProvider } from "@/components/PathProvider";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { SiteChrome } from "@/components/SiteChrome";
import { SITE_URL, siteJsonLd } from "@/lib/site";

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

const TITLE = "Zev's Agency — for brands ready to move.";
const DESCRIPTION =
  "Zev's Agency is a creative and technology studio in Hyderabad, founded by Mohammad Altaf. Websites, apps, AI, brand and more — tell us what you're building and get an instant, grounded estimate.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Zev's Agency",
  },
  description: DESCRIPTION,
  applicationName: "Zev's Agency",
  authors: [{ name: "Mohammad Altaf", url: `${SITE_URL}/portfolio` }],
  creator: "Mohammad Altaf",
  keywords: [
    "Zev",
    "Zev's Agency",
    "Zev Agency",
    "Mohammad Altaf",
    "creative studio",
    "web design",
    "app development",
    "AI integration",
    "branding",
    "zev.world",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Zev's Agency",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
        {/* Flow state lives at the root so it survives visiting other pages. */}
        <PathProvider>
          <AnalyticsTracker />
          <SiteChrome />
          {children}
        </PathProvider>
      </body>
    </html>
  );
}
