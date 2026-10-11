/**
 * Who the site is, in one place: the canonical address search engines should
 * use, the brand names people search for, the founder, and the profiles that
 * belong to them. Used by page metadata, structured data, the sitemap and the
 * footer, so Google sees one consistent story.
 */
import { CONTACT } from "@/lib/contact";

/** The primary domain. zev.world redirects here, so canonicals must too. */
export const SITE_URL = "https://www.zev.world";

export const BRAND = {
  name: "Zev's Agency",
  short: "Zev",
  alternateNames: ["Zev", "Zev Agency", "Zevs Agency", "zev.world"],
} as const;

export const FOUNDER = {
  name: "Mohammad Altaf",
  role: "Founder of Zev's Agency",
  url: `${SITE_URL}/portfolio`,
} as const;

/** Instagram profile URL (set NEXT_PUBLIC_INSTAGRAM_URL in Vercel to change). */
export const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";

const ORG_ID = `${SITE_URL}/#organization`;
const PERSON_ID = `${SITE_URL}/portfolio#person`;
const sameAs = INSTAGRAM_URL ? [INSTAGRAM_URL] : [];

/**
 * schema.org graph tying the agency, the website and the founder together, so
 * a search for the brand or the founder can surface both, with the profiles.
 */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: BRAND.name,
        alternateName: BRAND.alternateNames,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.png`,
        email: CONTACT.email,
        description:
          "A creative and technology studio for websites, apps, AI, brand and security, founded by Mohammad Altaf.",
        founder: { "@id": PERSON_ID },
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: BRAND.name,
        alternateName: BRAND.alternateNames,
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: FOUNDER.name,
        url: FOUNDER.url,
        jobTitle: "Founder",
        worksFor: { "@id": ORG_ID },
        ...(sameAs.length ? { sameAs } : {}),
      },
    ],
  };
}

export { PERSON_ID, ORG_ID };
