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

export const TOTAL_STEPS = 8;

/* The shape the estimate API returns. Shared by the route and Step 7. */
export type EstimateTier = "simple" | "medium" | "complex";

export interface Estimate {
  tier: EstimateTier;
  priceLow: number;
  priceHigh: number;
  timeline: string;
  summary: string;
  included: string[];
}
