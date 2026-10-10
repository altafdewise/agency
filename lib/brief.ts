/**
 * The single accumulating object that travels across every step of the path.
 * Pure types + constants only (no React) so the server API route can import it.
 */

export interface Contact {
  name?: string;
  email?: string;
}

export interface Brief {
  /** Service keys chosen in Step 1 (each maps to the pricing table). */
  needs: string[];
  /** Free text when "Something else" is chosen in Step 1. */
  customNeed?: string;
  /** Who it's for (Step 2). */
  persona: string;
  /** Free text when "something else" persona is chosen. */
  customPersona?: string;
  /** Stage / goal (Step 3). */
  stage: string;
  /** The brief, free text (Step 5). */
  description: string;
  /** Optional contact (Step 6), null if skipped. */
  contact: Contact | null;
}

export const EMPTY_BRIEF: Brief = {
  needs: [],
  persona: "",
  stage: "",
  description: "",
  contact: null,
};

/** Keep the unpublished case-study step in the codebase, but out of the live flow. */
export const SHOW_CASE_STUDIES = false;
export const TOTAL_STEPS = SHOW_CASE_STUDIES ? 8 : 7;

/* The shape the estimate API returns. Shared by the route and Step 7. */
export type EstimateTier = "simple" | "medium" | "complex";

export interface Estimate {
  /** "range" = the brief was detailed enough for a precise quote.
   *  "from" = only a starting price; `questions` say what would firm it up. */
  kind: "range" | "from";
  tier: EstimateTier;
  /** For "from", the starting price. */
  priceLow: number;
  /** For "from", the top of that scope's band (kept for the team, not shown). */
  priceHigh: number;
  timeline: string;
  summary: string;
  included: string[];
  /** Pricing keys the range covers, so the client sees what was priced. */
  services?: string[];
  /** For "from": the 2–3 details that would most sharpen the price. */
  questions?: string[];
  /** The lead this estimate was saved as, so a refined brief updates it. */
  leadId?: string;
}
