import type { Metadata, Viewport } from "next";
import { PortfolioStory } from "@/components/portfolio/PortfolioStory";
import { ORG_ID, PERSON_ID, SITE_URL } from "@/lib/site";

const TITLE = "Mohammad Altaf, founder of Zev’s Agency";
const DESCRIPTION =
  "Mohammad Altaf is the founder of Zev’s Agency: designer, developer and curious builder. A scrolling story through design, development, cybersecurity, game development, Zev’s Agency, and boxing.";

export const metadata: Metadata = {
  // The full name leads; skip the site-wide "· Zev's Agency" suffix.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/portfolio" },
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/portfolio",
    siteName: "Zev’s Agency",
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
  // The Person itself (with profiles) is in the site-wide graph; this page is
  // marked as their profile and points at them by id.
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/portfolio`,
    mainEntity: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Mohammad Altaf",
      url: `${SITE_URL}/portfolio`,
      jobTitle: "Founder of Zev’s Agency; designer, developer and cybersecurity practitioner",
      worksFor: { "@id": ORG_ID },
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
