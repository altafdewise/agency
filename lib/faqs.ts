/**
 * FAQ content for the homepage FAQ section (components/faq/FaqSection.tsx).
 *
 * Edit freely. Answers are deliberately marked placeholders (`// TODO`) until
 * real pricing / timeline / policy details are confirmed — drop the real copy
 * straight in here. Keep questions lowercase to match the site's voice.
 */
export type Faq = {
  /** The question — shown in the closed accordion row. */
  q: string;
  /** The answer — revealed when the row opens. */
  a: string;
};

export const FAQS: Faq[] = [
  {
    q: "how much does a project cost?",
    a: "// TODO: real answer — pricing depends on scope; don't publish a number until it's confirmed.",
  },
  {
    q: "how long does it take?",
    a: "// TODO: real answer — timeline depends on scope; confirm typical ranges before publishing.",
  },
  {
    q: "do you work with clients outside India / remotely?",
    a: "// TODO: real answer — confirm remote / international working policy.",
  },
  {
    q: "what do you need from me to start?",
    a: "// TODO: real answer — list what's actually required to kick a project off.",
  },
  {
    q: "do you offer support after launch?",
    a: "// TODO: real answer — confirm post-launch support / maintenance terms.",
  },
  {
    q: "what if I'm not sure what I need yet?",
    a: "// TODO: real answer — reassure, and explain the discovery / scoping path.",
  },
];
