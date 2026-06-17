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
