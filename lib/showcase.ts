/** The sample sites at /showcase/<slug>: one per kind of business we pitch. */
export interface ShowcaseSite {
  slug: string;
  /** "Health", "Food"… */
  industry: string;
  /** The fictional business on the sample. */
  business: string;
  blurb: string;
  image: string;
}

export const SHOWCASE: ShowcaseSite[] = [
  {
    slug: "health",
    industry: "Health",
    business: "Sahana Family & Dental Clinic",
    blurb: "Clinics, dentists, labs and physios: services, doctors, timings and booking.",
    image: "/showcase/health/hero.jpg",
  },
];
