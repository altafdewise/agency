import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { Brief, Estimate, EstimateTier } from "@/lib/brief";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";

/* ──────────────────────────────────────────────────────────────────────────
   PRICING_TABLE — grounded 2026 Indian-market rates, all values INR.
   Adjust freely; the estimator is told to price strictly within these bands.
   ────────────────────────────────────────────────────────────────────────── */
const PRICING_TABLE = {
  brand_logo: {
    simple: [8000, 20000], // logo only, 2-3 concepts + revisions
    medium: [20000, 50000], // logo + colors + fonts (mini kit)
    complex: [50000, 120000], // full brand identity system + guidelines
  },
  website: {
    simple: [15000, 35000], // 1-page / landing, animated, responsive, form
    medium: [40000, 120000], // 5-7 page business site, original design, CMS
    complex: [150000, 500000], // dynamic / web-app, integrations, dashboards
  },
  app: {
    simple: [60000, 150000], // basic cross-platform (Flutter), few screens
    medium: [200000, 600000], // moderate app, backend, auth, Play Store launch
    complex: [700000, 2500000], // full product, complex features, scale
  },
  design_prototype: {
    simple: [20000, 40000], // UI mockups, few screens, pre-built components
    medium: [50000, 120000], // custom UI/UX, full prototype, interactions
    complex: [150000, 400000], // design system + full product prototype
  },
  ai_integration: {
    simple: [25000, 60000], // chatbot / single AI feature on existing product
    medium: [80000, 250000], // custom AI workflows, API integration, automation
    complex: [300000, 1000000], // AI agents, multi-system automation, RAG, infra
  },
  content: {
    simple: [10000, 25000], // one-off: posters / carousel set / few reels
    medium: [30000, 80000], // monthly social package (posts + reels)
    complex: [100000, 300000], // full content + strategy retainer (monthly)
  },
  security: {
    simple: [15000, 40000], // basic site/app audit + report
    medium: [50000, 150000], // deeper pen-test, web + app
    complex: [200000, 600000], // full security assessment + remediation
  },
} as const;

type PricingKey = keyof typeof PRICING_TABLE;
const PRICING_KEYS = Object.keys(PRICING_TABLE) as PricingKey[];

/* ── The estimator's brief (system prompt) ────────────────────────────────── */
function systemPrompt(): string {
  return `You are the project estimator for "maggie", a premium creative studio (maggie.agency) based in India. You read a prospective client's brief and return a single, grounded price estimate.

PRICING TABLE (INR) — these are your ONLY source of truth for numbers. Each service has simple / medium / complex bands as [low, high]:
${JSON.stringify(PRICING_TABLE, null, 2)}

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
4. The "delivered in 24 hours" promise applies ONLY when tier = "simple". For medium, timeline is a few days (e.g. "3-5 days"). For complex, it is weeks / milestone-based (e.g. "2-4 weeks"). NEVER promise 24 hours for medium or complex.
5. Always return a RANGE, never a single number. Round numbers to clean values.
6. Tone for "summary": plain, confident, no fluff, no hype, 1-2 sentences. "included" = 3-5 short, concrete bullet items relevant to the chosen scope.
7. If the brief is vague, infer the most likely reasonable scope rather than refusing.

OUTPUT: Return ONLY valid JSON — no markdown, no code fences, no preamble, no trailing commentary. Exactly this shape:
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

/* ── Safe parsing + validation of the model's reply ───────────────────────── */
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
  if (tier !== "simple" && tier !== "medium" && tier !== "complex") return null;
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
    tier: tier as EstimateTier,
    priceLow: Math.round(low),
    priceHigh: Math.round(high),
    timeline: o.timeline.trim(),
    summary: o.summary.trim(),
    included,
  };
}

/* ── Deterministic fallback, straight from PRICING_TABLE ──────────────────── */
function heuristic(brief: Brief): Estimate {
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
    const band = PRICING_TABLE[k][tier];
    low += band[0];
    high += band[1];
  }

  const timeline =
    tier === "simple" ? "24 hours" : tier === "medium" ? "3-5 days" : "2-4 weeks";

  const included = [
    "Senior team, one point of contact",
    "Original work — no templates",
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
        ? `A serious ${what} build — we'd scope it into clear milestones.`
        : `A focused ${what} build, scoped to move quickly without cutting corners.`;

  return { tier, priceLow: low, priceHigh: high, timeline, summary, included };
}

export async function POST(req: Request) {
  let brief: Brief;
  try {
    brief = (await req.json()) as Brief;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key yet → still return a grounded number so the path works end-to-end.
  if (!apiKey) {
    return NextResponse.json(heuristic(brief));
  }

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      temperature: 0.4,
      system: systemPrompt(),
      messages: [{ role: "user", content: userContent(brief) }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = validate(JSON.parse(extractJson(text)));
    if (!parsed) throw new Error("Model returned unparseable estimate.");

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[estimate] falling back to heuristic:", err);
    // Graceful: hand back a grounded estimate rather than failing the journey.
    return NextResponse.json(heuristic(brief));
  }
}
