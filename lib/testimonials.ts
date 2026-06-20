/**
 * Testimonials — Section 3 of the homepage (the stacked-card carousel).
 *
 * PLACEHOLDER DATA. These are deliberately, obviously non-real so the layout can
 * be built and styled without shipping fabricated client praise. Swapping in the
 * real thing later is a pure data edit — no component changes needed:
 *   - replace `name` / `role` with the real person + company,
 *   - drop a photo in `public/testimonials/` and point `avatar` at it,
 *   - add the real `audioSrc` (an .mp3 in `public/testimonials/`),
 *   - add `metrics` ONLY where a real, verifiable number exists.
 *
 * Two slots wire up the audio player against placeholder paths that do not exist
 * yet (audio-1.mp3 / audio-2.mp3) — the player degrades to a disabled state until
 * the files are added, so nothing errors in the meantime.
 */
export type Testimonial = {
  id: string;
  /** Short, intentionally generic placeholder line. */
  quote: string;
  /** Obviously-placeholder label (Client A … Client G). */
  name: string;
  /** Visible neutral placeholder; real value is a // TODO below. */
  role: string;
  /** Optional photo path under /public. Falls back to a placeholder avatar. */
  avatar?: string;
  /** Optional audio file path. Player shows a disabled state if it 404s. */
  audioSrc?: string;
  /** Optional metric chips — present ONLY where a real metric will exist. */
  metrics?: string[];
};

// TODO: replace every entry below with a real client + company + quote before launch.
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "client-a",
    quote: "This is where a real client quote will go.",
    name: "Client A",
    role: "role · company", // TODO: real client + company
  },
  {
    id: "client-b",
    quote: "A short, real testimonial from this client lives here.",
    name: "Client B",
    role: "role · company", // TODO: real client + company
    audioSrc: "/testimonials/audio-1.mp3", // TODO: add the real audio file
  },
  {
    id: "client-c",
    quote: "Placeholder quote — to be replaced with genuine feedback.",
    name: "Client C",
    role: "role · company", // TODO: real client + company
  },
  {
    id: "client-d",
    quote: "A real client's words about the work will appear here.",
    name: "Client D",
    role: "role · company", // TODO: real client + company
    audioSrc: "/testimonials/audio-2.mp3", // TODO: add the real audio file
  },
  {
    id: "client-e",
    quote: "This is a placeholder quote, swapped for the real one later.",
    name: "Client E",
    role: "role · company", // TODO: real client + company
  },
  {
    id: "client-f",
    quote: "Genuine client feedback will be written here.",
    name: "Client F",
    role: "role · company", // TODO: real client + company
  },
  {
    id: "client-g",
    quote: "Real testimonial copy goes in this slot.",
    name: "Client G",
    role: "role · company", // TODO: real client + company
  },
];

/** Aggregate studio stats shown at the foot of the testimonials section. */
export const TESTIMONIAL_STATS: { value: string; label: string }[] = [
  { value: "54+", label: "Projects shipped" },
  { value: "31+", label: "Clients" },
  { value: "6", label: "Years building" },
];
