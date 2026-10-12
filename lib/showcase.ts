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
  {
    slug: "food",
    industry: "Food",
    business: "Kaapi & Crumb",
    blurb: "Cafés, restaurants and bakeries: menu, story, delivery and table bookings.",
    image: "/showcase/food/hero.jpg",
  },
  {
    slug: "education",
    industry: "Education",
    business: "Little Banyan Play School",
    blurb: "Play schools, tuition and coaching centres: programs, a day at school and admissions.",
    image: "/showcase/education/hero.jpg",
  },
  {
    slug: "events",
    industry: "Events",
    business: "Rajmahal Gardens",
    blurb: "Function halls, lawns and caterers: spaces, capacities, packages and a date check.",
    image: "/showcase/events/hero.jpg",
  },
];
