import type { EstimateTier } from "@/lib/brief";

export const PRICING_TABLE = {
  brand_logo: {
    simple: [8000, 20000],
    medium: [20000, 50000],
    complex: [50000, 120000],
  },
  website: {
    simple: [15000, 35000],
    medium: [40000, 120000],
    complex: [150000, 500000],
  },
  app: {
    simple: [60000, 150000],
    medium: [200000, 600000],
    complex: [700000, 2500000],
  },
  design_prototype: {
    simple: [20000, 40000],
    medium: [50000, 120000],
    complex: [150000, 400000],
  },
  ai_integration: {
    simple: [25000, 60000],
    medium: [80000, 250000],
    complex: [300000, 1000000],
  },
  content: {
    simple: [10000, 25000],
    medium: [30000, 80000],
    complex: [100000, 300000],
  },
  security: {
    simple: [15000, 40000],
    medium: [50000, 150000],
    complex: [200000, 600000],
  },
} as const;

export type PricingKey = keyof typeof PRICING_TABLE;
export type PricingTable = typeof PRICING_TABLE;

export const PRICING_KEYS = Object.keys(PRICING_TABLE) as PricingKey[];
export const PRICING_TIERS: EstimateTier[] = ["simple", "medium", "complex"];

export function isPricingKey(value: unknown): value is PricingKey {
  return typeof value === "string" && PRICING_KEYS.includes(value as PricingKey);
}

export function isEstimateTier(value: unknown): value is EstimateTier {
  return (
    value === "simple" ||
    value === "medium" ||
    value === "complex"
  );
}

export function isValidPriceRange(low: unknown, high: unknown) {
  const priceLow = Number(low);
  const priceHigh = Number(high);
  return (
    Number.isFinite(priceLow) &&
    Number.isFinite(priceHigh) &&
    priceLow > 0 &&
    priceHigh >= priceLow
  );
}

export function pricingFallback(service: PricingKey, tier: EstimateTier) {
  const [low, high] = PRICING_TABLE[service][tier];
  return [low, high] as [number, number];
}

/* ── What each scope delivers ───────────────────────────────────────────────
   Shown to the client as the "included" list when the AI is unavailable, and
   used to top up a short AI list. Keep in step with the scope guide in
   app/api/estimate/route.ts. */
export const SCOPE_INCLUDES: Record<PricingKey, Record<EstimateTier, string[]>> = {
  brand_logo: {
    simple: ["2–3 logo concepts", "Final logo in every format you need", "A round of refinements"],
    medium: ["Logo, colour palette and fonts", "A mini brand kit", "Files ready for print and web"],
    complex: ["A full identity system", "Brand guidelines document", "Templates for key touchpoints"],
  },
  website: {
    simple: ["One-page responsive site", "Custom animations", "Contact form", "Launch on your domain"],
    medium: ["5–7 page custom-designed site", "CMS so you can edit content yourself", "Responsive on every device", "Basic SEO setup"],
    complex: ["Dynamic web app", "Third-party integrations", "Dashboards and user accounts", "Launch and handover"],
  },
  app: {
    simple: ["Cross-platform app (iOS and Android)", "Core screens for your main flow", "Tested, release-ready build"],
    medium: ["Cross-platform app with a backend", "User accounts and login", "Core feature screens", "Play Store launch"],
    complex: ["Full product build", "Advanced features and integrations", "Architecture built to scale", "Store launch and post-launch support"],
  },
  design_prototype: {
    simple: ["UI mockups for your key screens", "Built on a proven component set", "Handoff-ready Figma file"],
    medium: ["Custom UI/UX design", "Full clickable prototype", "Handoff-ready Figma file"],
    complex: ["A complete design system", "Full product prototype", "Developer handoff and specs"],
  },
  ai_integration: {
    simple: ["A chatbot or single AI feature", "Integrated into your existing product", "Testing on real examples"],
    medium: ["Custom AI workflows", "API integrations with your tools", "Automation of repetitive work"],
    complex: ["AI agents for multi-step work", "Automation across your systems", "Retrieval over your own data (RAG)", "Production-ready infrastructure"],
  },
  content: {
    simple: ["Posters, a carousel or a few reels", "Sized for every platform you post on", "Ready-to-post files"],
    medium: ["Monthly social content package", "Posts, carousels and reels", "A planned posting calendar"],
    complex: ["Full content production", "Content strategy", "Ongoing monthly retainer"],
  },
  security: {
    simple: ["Security audit of your site or app", "Written report with clear fixes"],
    medium: ["Penetration test across web and app", "Prioritised findings report", "Fix guidance for your team"],
    complex: ["Full security assessment", "Remediation of the findings", "Re-test after fixes"],
  },
};

/* ── Delivery time per scope ────────────────────────────────────────────────
   `days` only orders them, so a multi-service project quotes its longest one.
   Simple scope keeps the 24-hour promise used on the closing step. */
export const TIMELINES: Record<PricingKey, Record<EstimateTier, { label: string; days: number }>> = {
  brand_logo: {
    simple: { label: "24 hours", days: 1 },
    medium: { label: "3–5 days", days: 5 },
    complex: { label: "2–3 weeks", days: 21 },
  },
  website: {
    simple: { label: "24 hours", days: 1 },
    medium: { label: "1–2 weeks", days: 14 },
    complex: { label: "4–6 weeks", days: 42 },
  },
  app: {
    simple: { label: "24 hours", days: 1 },
    medium: { label: "4–6 weeks", days: 42 },
    complex: { label: "8–12 weeks", days: 84 },
  },
  design_prototype: {
    simple: { label: "24 hours", days: 1 },
    medium: { label: "1–2 weeks", days: 14 },
    complex: { label: "3–4 weeks", days: 28 },
  },
  ai_integration: {
    simple: { label: "24 hours", days: 1 },
    medium: { label: "2–3 weeks", days: 21 },
    complex: { label: "6–8 weeks", days: 56 },
  },
  content: {
    simple: { label: "24 hours", days: 1 },
    medium: { label: "First posts in 5 days, then monthly", days: 5 },
    complex: { label: "Monthly retainer", days: 30 },
  },
  security: {
    simple: { label: "24 hours", days: 1 },
    medium: { label: "1–2 weeks", days: 14 },
    complex: { label: "3–4 weeks", days: 28 },
  },
};

const TIER_ORDER: Record<EstimateTier, number> = { simple: 0, medium: 1, complex: 2 };

export interface ServiceScope {
  key: PricingKey;
  tier: EstimateTier;
  /** Where the project sits inside its band: 0 = smallest, 1 = largest. */
  position: number;
}

/* Quotes stay within ±12% of a single point in the band, so the range reads
   as a real number rather than the whole band. */
const SPREAD = 0.12;

function priceStep(n: number) {
  if (n < 50000) return 1000;
  if (n < 200000) return 5000;
  if (n < 1000000) return 10000;
  return 50000;
}

export function quote(scopes: ServiceScope[], table: PricingTable) {
  let low = 0;
  let high = 0;
  let tier: EstimateTier = "simple";
  let timeline = TIMELINES[scopes[0].key][scopes[0].tier];

  for (const { key, tier: t, position } of scopes) {
    const [bandLow, bandHigh] = table[key][t];
    const p = Math.min(1, Math.max(0, position));
    const point = Math.min(
      bandHigh / (1 + SPREAD),
      Math.max(bandLow / (1 - SPREAD), bandLow + (bandHigh - bandLow) * p)
    );
    low += point * (1 - SPREAD);
    high += point * (1 + SPREAD);
    if (TIER_ORDER[t] > TIER_ORDER[tier]) tier = t;
    if (TIMELINES[key][t].days > timeline.days) timeline = TIMELINES[key][t];
  }

  const lowStep = priceStep(low);
  const highStep = priceStep(high);
  const priceLow = Math.floor(low / lowStep) * lowStep;
  let priceHigh = Math.ceil(high / highStep) * highStep;
  if (priceHigh <= priceLow) priceHigh = priceLow + highStep;

  return { tier, priceLow, priceHigh, timeline: timeline.label };
}
