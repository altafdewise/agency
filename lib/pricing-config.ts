import type { EstimateTier } from "@/lib/brief";
import {
  PRICING_TABLE,
  isEstimateTier,
  isPricingKey,
  isValidPriceRange,
  pricingFallback,
  type PricingKey,
  type PricingTable,
} from "@/lib/pricing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * The live rate card: PRICING_TABLE with any bands the team has changed in
 * admin (the `pricing_config` table) laid over it. Server only. Shared by the
 * estimator and the About page, so the two can never quote different prices.
 */
export async function loadPricingTable(): Promise<PricingTable> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return PRICING_TABLE;

  try {
    const { data, error } = await supabase
      .from("pricing_config")
      .select("service_key,tier,price_low,price_high");

    if (error || !data?.length) return PRICING_TABLE;

    const table = JSON.parse(JSON.stringify(PRICING_TABLE)) as Record<
      PricingKey,
      Record<EstimateTier, [number, number]>
    >;

    for (const row of data) {
      if (!isPricingKey(row.service_key) || !isEstimateTier(row.tier)) {
        continue;
      }

      if (isValidPriceRange(row.price_low, row.price_high)) {
        table[row.service_key][row.tier] = [
          Number(row.price_low),
          Number(row.price_high),
        ];
      } else {
        table[row.service_key][row.tier] = pricingFallback(
          row.service_key,
          row.tier
        );
      }
    }

    return table as PricingTable;
  } catch (error) {
    console.error("[pricing] pricing_config read failed:", error);
    return PRICING_TABLE;
  }
}
