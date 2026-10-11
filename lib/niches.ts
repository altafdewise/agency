import { LOCATION } from "@/lib/site";

/**
 * Landing pages for local businesses, one per kind of business, at
 * /for/<slug>. Made for outreach links and ads: each speaks to one kind of
 * owner, about what their customers look for, and ends in the estimator with
 * "website" and "I run a business" already picked.
 *
 * Only promise what the website rate card includes (lib/pricing.ts): the
 * one-page site is the Essential website scope.
 */
export interface Niche {
  slug: string;
  /** "for clinics & doctors" — the eyebrow, and the page title after "Websites". */
  audience: string;
  /** The headline's first line: "your clinic,". */
  yours: string;
  intro: string;
  /** "what patients check before they come in" */
  checksHeading: string;
  checks: { title: string; body: string }[];
  /** Pre-filled WhatsApp message. */
  whatsapp: string;
  /** Starts the brief in the estimator, so they only add the details. */
  briefStarter: string;
  metaDescription: string;
}

export const NICHES: Niche[] = [
  {
    slug: "local-business",
    audience: "local businesses",
    yours: "your business,",
    intro:
      "A fast, good-looking website that tells people what you do, where you are and how to reach you. Live in 24 hours.",
    checksHeading: "what people check before they walk in",
    checks: [
      { title: "what you offer", body: "Your services or products, and prices if you like. Clear enough to decide in a minute." },
      { title: "where you are", body: "Your address, with a map and one-tap directions." },
      { title: "when you're open", body: "Your hours, so nobody turns up to a closed shutter." },
      { title: "how to reach you", body: "Call and WhatsApp buttons that work in one tap." },
    ],
    whatsapp: "Hi Zev, I run a local business and I'd like a website.",
    briefStarter: "A website for my business: ",
    metaDescription:
      `A website for your local business in ${LOCATION.city}, live in 24 hours: what you offer, where you are, your hours and one-tap call and WhatsApp. See your price in two minutes.`,
  },
  {
    slug: "clinics",
    audience: "clinics & doctors",
    yours: "your clinic,",
    intro:
      "Patients look you up before they visit. Give them a clean site with your doctors, timings and how to book. Live in 24 hours.",
    checksHeading: "what patients check before they come in",
    checks: [
      { title: "who they'll see", body: "Your doctors, their qualifications and what they treat." },
      { title: "when you're open", body: "OPD days and timings, so nobody arrives to a closed clinic." },
      { title: "where you are", body: "Your address, with a map and one-tap directions." },
      { title: "how to book", body: "A call or WhatsApp button, one tap away." },
    ],
    whatsapp: "Hi Zev, I run a clinic and I'd like a website.",
    briefStarter: "A website for our clinic: ",
    metaDescription:
      `A website for your clinic in ${LOCATION.city}, live in 24 hours: your doctors, timings, location and one-tap booking by call or WhatsApp. See your price in two minutes.`,
  },
  {
    slug: "cafes",
    audience: "cafés & restaurants",
    yours: "your café,",
    intro:
      "People choose where to eat on their phone. Show them your menu, your place and how to get there, on a site that loads fast. Live in 24 hours.",
    checksHeading: "what people check before they choose where to eat",
    checks: [
      { title: "the menu", body: "What you serve and what it costs, easy to read on a phone. Not a blurry photo." },
      { title: "the place", body: "A few good photos of the space and the food." },
      { title: "where and when", body: "Your address, a map and your opening hours." },
      { title: "how to reserve or order", body: "Call or WhatsApp in one tap, and links to the apps you deliver on." },
    ],
    whatsapp: "Hi Zev, I run a café and I'd like a website.",
    briefStarter: "A website for our café: ",
    metaDescription:
      `A website for your café or restaurant in ${LOCATION.city}, live in 24 hours: your menu, photos, hours, location and one-tap reservations. See your price in two minutes.`,
  },
  {
    slug: "salons",
    audience: "salons & spas",
    yours: "your salon,",
    intro:
      "New clients want to see your work and your prices before they book. Give them both, with a one-tap way to book. Live in 24 hours.",
    checksHeading: "what clients check before they book",
    checks: [
      { title: "your work", body: "Photos of real results, so they know what they'll get." },
      { title: "services and prices", body: "A clear list, so nobody has to call just to ask." },
      { title: "where and when", body: "Your address, a map and your opening hours." },
      { title: "how to book", body: "A call or WhatsApp button, one tap away." },
    ],
    whatsapp: "Hi Zev, I run a salon and I'd like a website.",
    briefStarter: "A website for our salon: ",
    metaDescription:
      `A website for your salon or spa in ${LOCATION.city}, live in 24 hours: your work, services and prices, location and one-tap booking. See your price in two minutes.`,
  },
  {
    slug: "gyms",
    audience: "gyms & fitness studios",
    yours: "your gym,",
    intro:
      "People compare gyms on their phone before they walk in. Show them your space, your trainers and your plans. Live in 24 hours.",
    checksHeading: "what people check before they join",
    checks: [
      { title: "the space", body: "Photos of the floor, the equipment and the classes." },
      { title: "plans and prices", body: "Monthly, quarterly, yearly. Clear, so they arrive ready to join." },
      { title: "who trains them", body: "Your trainers and what they specialise in." },
      { title: "how to start", body: "A WhatsApp button to book a trial or a visit." },
    ],
    whatsapp: "Hi Zev, I run a gym and I'd like a website.",
    briefStarter: "A website for our gym: ",
    metaDescription:
      `A website for your gym or fitness studio in ${LOCATION.city}, live in 24 hours: your space, trainers, plans and a one-tap way to book a trial. See your price in two minutes.`,
  },
  {
    slug: "coaching",
    audience: "coaching & tuition centres",
    yours: "your institute,",
    intro:
      "Parents and students compare institutes before they enquire. Show them your courses, your faculty and your results. Live in 24 hours.",
    checksHeading: "what parents and students check before they enquire",
    checks: [
      { title: "courses and batches", body: "What you teach, for which classes or exams, and when batches start." },
      { title: "who teaches", body: "Your faculty and their experience." },
      { title: "results", body: "Toppers and selections, if you have them to share." },
      { title: "how to enquire", body: "Call or WhatsApp in one tap, and your address on a map." },
    ],
    whatsapp: "Hi Zev, I run a coaching centre and I'd like a website.",
    briefStarter: "A website for our coaching centre: ",
    metaDescription:
      `A website for your coaching or tuition centre in ${LOCATION.city}, live in 24 hours: courses, batches, faculty, results and one-tap enquiries. See your price in two minutes.`,
  },
];

export function getNiche(slug: string) {
  return NICHES.find((niche) => niche.slug === slug);
}
