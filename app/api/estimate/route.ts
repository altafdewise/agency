import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { Brief, Estimate, EstimateTier } from "@/lib/brief";
import {
  PRICING_KEYS,
  PRICING_TABLE,
  isEstimateTier,
  isPricingKey,
  isValidPriceRange,
  pricingFallback,
  type PricingKey,
  type PricingTable,
} from "@/lib/pricing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";
const MAX_DESCRIPTION_CHARS = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

async function loadPricingTable(): Promise<PricingTable> {
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
    console.error("[estimate] pricing_config read failed:", error);
    return PRICING_TABLE;
  }
}

/* â”€â”€ The estimator's brief (system prompt) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function systemPrompt(pricingTable: PricingTable): string {
  return `You are the project estimator for "maggie", a premium creative studio (maggie.agency) based in India. You read a prospective client's brief and return a single, grounded price estimate.

PRICING TABLE (INR) â€” these are your ONLY source of truth for numbers. Each service has simple / medium / complex bands as [low, high]:
${JSON.stringify(pricingTable, null, 2)}

Scope guide per tier:
- brand_logo: simple = logo only (2-3 concepts); medium = logo + colors + fonts (mini kit); complex = full identity system + guidelines.
- website: simple = 1-page/landing (animated, responsive, form); medium = 5-7 page business site with original design + CMS; complex = dynamic web-app, integrations, dashboards.
- app: simple = basic cross-platform, few screens; medium = moderate app with backend, auth, Play Store launch; complex = full product, complex features, scale.
- design_prototype: simple = UI mockups with pre-built components; medium = custom UI/UX + full interactive prototype; complex = design system + full product prototype.
- ai_integration: simple = chatbot / single AI feature on an existing product; medium = custom AI workflows, API integration, automation; complex = AI agents, multi-system automation, RAG, infra.
- content: simple = one-off posters/carousel/few reels; medium = monthly social package; complex = full content + strategy retainer.
- security: simple = basic site/app audit + report; medium = deeper pen-test (web + app); complex = full security assessment + remediation.

RULES:
1. Read the brief (needs, persona, stage, description). Identify which service(s) and which tier (simple / medium / complex) fit best.
2. If multiple needs are present, sum the relevant bands into ONE combined range (priceLow = sum of lows, priceHigh = sum of highs).
3. Lean toward the LOWER half of the band for first-time / small / early-stage / solo clients (to win the deal). Lean upper half only for clearly complex, large, or scaling scope. NEVER go below a service's simple-low floor.
4. The "delivered in 24 hours" promise applies ONLY when tier = "simple". If tier is "simple", timeline MUST be exactly the fixed string "24 hours" - never "1-2 days", "24-48 hours", "~24 hours", or any other wording. For medium, timeline is a few days (e.g. "3-5 days"). For complex, it is weeks / milestone-based (e.g. "2-4 weeks"). NEVER promise 24 hours for medium or complex.
5. Always return a RANGE, never a single number. Round numbers to clean values.
6. Tone for "summary": plain, confident, no fluff, no hype, 1-2 sentences. "included" = 3-5 short, concrete bullet items relevant to the chosen scope.
7. If the brief is vague, infer the most likely reasonable scope rather than refusing.

OUTPUT: Return ONLY valid JSON â€” no markdown, no code fences, no preamble, no trailing commentary. Exactly this shape:
{"tier":"simple"|"medium"|"complex","priceLow":number,"priceHigh":number,"timeline":string,"summary":string,"included":string[]}`;
}

function userContent(brief: Brief): string {
  return `Here is the client's brief as JSON. Produce the estimate.\n\n${JSON.stringify(
    {
      needs: brief.needs,
      customNeed: brief.customNeed ?? null,
      persona: brief.persona,
      customPersona: brief.customPersona ?? null,
      stage: brief.stage,
      description: brief.description,
    },
    null,
    2
  )}`;
}

/* â”€â”€ Safe parsing + validation of the model's reply â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function extractJson(raw: string): string {
  let s = raw.trim();
  // strip ``` / ```json fences if the model added them despite instructions
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  return s;
}

function validate(obj: unknown): Estimate | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const tier = o.tier;
  if (!isEstimateTier(tier)) return null;
  const low = Number(o.priceLow);
  const high = Number(o.priceHigh);
  if (!Number.isFinite(low) || !Number.isFinite(high) || low <= 0 || high < low)
    return null;
  if (typeof o.timeline !== "string" || !o.timeline.trim()) return null;
  if (typeof o.summary !== "string" || !o.summary.trim()) return null;
  if (!Array.isArray(o.included)) return null;
  const included = o.included
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .slice(0, 5);
  if (included.length === 0) return null;
  return {
    tier,
    priceLow: Math.round(low),
    priceHigh: Math.round(high),
    timeline: o.timeline.trim(),
    summary: o.summary.trim(),
    included,
  };
}

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const current = rateBuckets.get(ip);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  }

  current.count += 1;
  return null;
}

function validateBrief(input: unknown): { brief: Brief } | { error: string } {
  if (!input || typeof input !== "object") {
    return { error: "Tell us what you need before requesting an estimate." };
  }

  const candidate = input as Partial<Brief>;
  const needs = Array.isArray(candidate.needs)
    ? candidate.needs.filter((need): need is string => typeof need === "string")
    : [];
  const persona = typeof candidate.persona === "string" ? candidate.persona.trim() : "";
  const description =
    typeof candidate.description === "string" ? candidate.description.trim() : "";

  if (!needs.length) {
    return { error: "Choose at least one service before requesting an estimate." };
  }

  if (!persona) {
    return { error: "Choose who this is for before requesting an estimate." };
  }

  if (description.length > MAX_DESCRIPTION_CHARS) {
    return {
      error: `Keep the brief under ${MAX_DESCRIPTION_CHARS} characters so we can price it clearly.`,
    };
  }

  return {
    brief: {
      needs,
      customNeed:
        typeof candidate.customNeed === "string"
          ? candidate.customNeed.slice(0, MAX_DESCRIPTION_CHARS)
          : undefined,
      persona,
      customPersona:
        typeof candidate.customPersona === "string"
          ? candidate.customPersona.slice(0, 300)
          : undefined,
      stage: typeof candidate.stage === "string" ? candidate.stage.trim() : "",
      description,
      contact:
        candidate.contact && typeof candidate.contact === "object"
          ? candidate.contact
          : null,
    },
  };
}

/* â”€â”€ Deterministic fallback, straight from PRICING_TABLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function heuristic(brief: Brief, pricingTable: PricingTable): Estimate {
  const keys = brief.needs.filter((n): n is PricingKey =>
    PRICING_KEYS.includes(n as PricingKey)
  );
  const usedKeys = keys.length ? keys : (["website"] as PricingKey[]);

  const earlyStages = [
    "ideation",
    "prototype",
    "business-started",
    "creator-starting",
    "idea-thought",
    "idea-real",
    "freelancer-clients",
    "explore",
    "proxy-unsure",
  ];
  const complexStages = [
    "scaling",
    "business-scale",
    "creator-pro",
    "idea-launch",
    "freelancer-team",
  ];
  const blob = `${brief.stage} ${brief.description}`.toLowerCase();
  const complexSignals =
    complexStages.includes(brief.stage) ||
    /enterprise|dashboard|integrat|rag|agent|multi|scale|saas|platform|backend/.test(
      blob
    );

  let tier: EstimateTier = "medium";
  if (earlyStages.includes(brief.stage)) tier = "simple";
  if (complexSignals) tier = "complex";

  let low = 0;
  let high = 0;
  for (const k of usedKeys) {
    const band = pricingTable[k][tier];
    low += band[0];
    high += band[1];
  }

  const timeline =
    tier === "simple" ? "24 hours" : tier === "medium" ? "3-5 days" : "2-4 weeks";

  const included = [
    "Senior team, one point of contact",
    "Original work â€” no templates",
    tier === "simple" ? "Delivered in ~24 hours" : "Clear milestones & check-ins",
    "Revisions until it's right",
    "Launch support",
  ].slice(0, 5);

  const labels: Record<PricingKey, string> = {
    brand_logo: "brand & logo",
    website: "website",
    app: "app",
    design_prototype: "design",
    ai_integration: "AI",
    content: "content",
    security: "security",
  };
  const what = usedKeys.map((k) => labels[k]).join(" + ");
  const summary =
    tier === "simple"
      ? `A tight ${what} build we can turn around fast.`
      : tier === "complex"
        ? `A serious ${what} build â€” we'd scope it into clear milestones.`
        : `A focused ${what} build, scoped to move quickly without cutting corners.`;

  return { tier, priceLow: low, priceHigh: high, timeline, summary, included };
}

async function recordLead(brief: Brief, estimate: Estimate) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  try {
    const { error } = await supabase.from("leads").insert({
      name: brief.contact?.name ?? null,
      contact_email: brief.contact?.email ?? null,
      contact_phone: null,
      persona: brief.customPersona || brief.persona || null,
      needs: brief.needs ?? [],
      stage: brief.stage || null,
      brief_text: brief.description || null,
      ai_tier: estimate.tier,
      ai_price_low: estimate.priceLow,
      ai_price_high: estimate.priceHigh,
      ai_summary: estimate.summary,
      ai_included: estimate.included,
      status: "new",
    });

    if (error) throw error;
  } catch (error) {
    console.error("[estimate] lead insert failed:", error);
  }
}

export async function POST(req: Request) {
  const retryAfter = checkRateLimit(getClientIp(req));
  if (retryAfter) {
    return NextResponse.json(
      {
        error:
          "Too many estimate requests from this connection. Please wait a few minutes and try again.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validated = validateBrief(body);
  if ("error" in validated) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { brief } = validated;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const pricingTable = await loadPricingTable();

  // No key yet â†’ still return a grounded number so the path works end-to-end.
  if (!apiKey) {
    const estimate = heuristic(brief, pricingTable);
    await recordLead(brief, estimate);
    return NextResponse.json(estimate);
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      temperature: 0.4,
      system: systemPrompt(pricingTable),
      messages: [{ role: "user", content: userContent(brief) }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = validate(JSON.parse(extractJson(text)));
    if (!parsed) throw new Error("Model returned unparseable estimate.");

    await recordLead(brief, parsed);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[estimate] falling back to heuristic:", err);
    // Graceful: hand back a grounded estimate rather than failing the journey.
    const estimate = heuristic(brief, pricingTable);
    await recordLead(brief, estimate);
    return NextResponse.json(estimate);
  }
}
