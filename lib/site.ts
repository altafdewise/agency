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

/** Where the studio is. Used in structured data, the local landing pages and
 *  the map on the home page. */
export const LOCATION = {
  building: "Sri Residency, 92",
  street: "East Balaji Hill Colony, Mallikarjuna Nagar",
  area: "Uppal",
  city: "Hyderabad",
  region: "Telangana",
  postalCode: "500092",
  country: "IN",
  lat: 17.4141709,
  lng: 78.5786001,
  /** The studio's Google Business listing ("Zev's Agency" on Google Maps). */
  mapsUrl: "https://maps.app.goo.gl/XTrMmffai6cs31K2A",
} as const;

/** Instagram profile (NEXT_PUBLIC_INSTAGRAM_URL in Vercel overrides it). */
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/thyzevv/";

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
          "A creative and technology studio in Hyderabad for websites, apps, AI, brand and security, founded by Mohammad Altaf.",
        address: {
          "@type": "PostalAddress",
          streetAddress: `${LOCATION.building}, ${LOCATION.street}, ${LOCATION.area}`,
          addressLocality: LOCATION.city,
          addressRegion: LOCATION.region,
          postalCode: LOCATION.postalCode,
          addressCountry: LOCATION.country,
        },
        geo: { "@type": "GeoCoordinates", latitude: LOCATION.lat, longitude: LOCATION.lng },
        hasMap: LOCATION.mapsUrl,
        areaServed: [
          { "@type": "City", name: LOCATION.city },
          { "@type": "Country", name: "India" },
        ],
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
