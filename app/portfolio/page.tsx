import type { Metadata, Viewport } from "next";
import { PortfolioStory } from "@/components/portfolio/PortfolioStory";

const TITLE = "Mohammad Altaf: designer, developer, and curious builder";
const DESCRIPTION =
  "The personal portfolio of Mohammad Altaf. A scrolling story through design, development, cybersecurity, game development, Maggie’s Agency, and boxing.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/portfolio",
    siteName: "Maggie’s Agency",
    type: "profile",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Mohammad Altaf, designer, developer, and curious builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f2efe7",
  width: "device-width",
  initialScale: 1,
};

export default function PortfolioPage() {
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://maggie.agency/portfolio",
    mainEntity: {
      "@type": "Person",
      name: "Mohammad Altaf",
      url: "https://maggie.agency/portfolio",
      jobTitle: "Designer, developer, cybersecurity practitioner, and founder",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <PortfolioStory />
    </>
  );
}
