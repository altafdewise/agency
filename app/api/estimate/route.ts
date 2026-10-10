import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { Brief, Estimate, EstimateTier } from "@/lib/brief";
import {
  BRIEF_PROMPTS,
  GENERAL_PROMPTS,
  PRICING_TABLE,
  SCOPE_INCLUDES,
  isEstimateTier,
  isPricingKey,
  isValidPriceRange,
  pricingFallback,
  quote,
  startingPrice,
  type PricingKey,
  type PricingTable,
  type ServiceScope,
} from "@/lib/pricing";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEstimateEmail } from "@/lib/email";

export const runtime = "nodejs";

const MODEL = "claude-sonnet-4-6";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_DESCRIPTION_CHARS = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
// A precise range needs real detail: the model has to judge the brief complete,
// and it has to be more than a line. Without the model, length is all we have.
const MIN_WORDS_FOR_RANGE = 12;
const FALLBACK_WORDS_FOR_RANGE = 30;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// A refined brief may update its lead only while that lead is fresh and untouched.
const REFINE_WINDOW_MS = 2 * 60 * 60 * 1000;

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

/* ── The estimator's brief (system prompt) ──────────────────────────────────
   The model only judges scope and writes the client-facing copy. Prices and
   timelines are computed from the pricing table by `quote()`, so they're
   consistent from one visitor to the next. */
function systemPrompt(pricingTable: PricingTable): string {
  return `You are the project estimator for Zev's Agency (zev.world), a creative and technology studio based in India. You read a prospective client's brief and decide the scope of each service they need. Our system turns your scope into the price and timeline, so you never write prices or durations yourself.

SCOPES PER SERVICE (simple / medium / complex):
- brand_logo: simple = logo only (2-3 concepts); medium = logo + colours + fonts (mini kit); complex = full identity system + guidelines.
- website: simple = 1-page/landing (animated, responsive, form); medium = 5-7 page business site with original design + CMS; complex = dynamic web app, integrations, dashboards.
- app: simple = basic cross-platform app, few screens; medium = moderate app with backend, auth, Play Store launch; complex = full product, complex features, scale.
- design_prototype: simple = UI mockups with pre-built components; medium = custom UI/UX + full interactive prototype; complex = design system + full product prototype.
- ai_integration: simple = chatbot / single AI feature on an existing product; medium = custom AI workflows, API integration, automation; complex = AI agents, multi-system automation, RAG, infra.
- content: simple = one-off posters/carousel/few reels; medium = monthly social package; complex = full content + strategy retainer.
- security: simple = basic site/app audit + report; medium = deeper pen-test (web + app); complex = full security assessment + remediation.

PRICE DRIVERS - the details that decide the scope and where a project sits inside its band:
- brand_logo: logo only or a fuller kit; how many concepts; what else needs designing (cards, packaging, social templates); whether guidelines are needed.
- website: how many distinct pages or page types; whether the client edits content themselves (CMS, blog); bookings, payments, a shop or user accounts; integrations (CRM, WhatsApp, maps, email tools); who writes the copy and supplies photos; languages.
- app: the core user flows and roughly how many screens; iOS, Android or both; accounts and stored user data (backend); payments, chat, maps, notifications; an admin panel; offline or real-time needs.
- design_prototype: how many screens or flows; static mockups or a clickable prototype; whether a design system is needed.
- ai_integration: what the AI must do; where it lives (website, WhatsApp, internal tool); what data or documents it uses; which tools it connects to; how many workflows.
- content: formats (posts, carousels, reels, video); volume per month; one-off or ongoing; whether shooting is needed.
- security: what is tested (site, app, API); size (pages, endpoints, user roles); report only or fixes too; any compliance requirement.

PRICE BANDS (INR) per service and scope, for judging where the project sits inside a band:
${JSON.stringify(pricingTable)}

FIRST, THE DETAIL CHECK - set "enough":
- true only if, for every service you scope, the brief says what is being built AND gives at least two of that service's price drivers concretely (counts, named features, platforms, integrations, volumes). Who the client is and their stage never count as drivers.
- false otherwise. Never fill gaps with guesses to make a brief look complete.

FOR EACH SERVICE TO SCOPE, return:
- "key": the service key.
- "tier": when enough, the scope the stated drivers need. When not enough, the smallest scope that everything the brief does state would require - never assume features the client didn't mention. Pick complex only when the brief clearly asks for complex-scope work.
- "position": a number from 0 to 1 for where the project sits inside that scope's band, judged only from the stated drivers. 0-0.3 = small, few features; 0.3-0.6 = a typical project; 0.6-1 = clearly large or demanding. When not enough, use 0.

QUESTIONS:
- When not enough: "questions" holds 2-3 short questions (at most 12 words each), addressed to the client, asking for the missing price drivers that would change the price most. One idea per question, e.g. "How many pages do you need?".
- When enough: "questions": [].

THEN WRITE FOR THE CLIENT:
- "summary": 1-2 sentences, at most 35 words, addressed to the client ("you", "your"), saying what we'd build for them. Plain and confident, no hype.
- "included": 3-5 concrete deliverables, at most 8 words each.
- The summary and the included list must describe the same deliverables and only promise what the chosen scope covers. Example: a medium app includes a Play Store launch, so don't promise an App Store launch.
- Never describe how you estimated. Don't write "inferred", "assumed", "conservatively", "based on your brief", "limited detail", scope or tier names, or notes in brackets. If the brief is thin, describe the typical project for that scope.
- Don't mention prices, currencies, durations or dates.

WHICH SERVICES TO SCOPE: exactly the keys listed in "services" in the brief. If "services" is empty, map "customNeed" and "description" to the closest service keys (at most 3); if nothing fits, return "services": [].

OUTPUT: only valid JSON, with no markdown or commentary, in exactly this shape:
{"enough":boolean,"services":[{"key":string,"tier":"simple"|"medium"|"complex","position":number}],"summary":string,"included":string[],"questions":string[]}`;
}

function pricedKeys(brief: Brief): PricingKey[] {
  return brief.needs.filter((need): need is PricingKey => isPricingKey(need));
}

function userContent(brief: Brief): string {
  return `Here is the client's brief as JSON. Scope it.\n\n${JSON.stringify(
    {
      services: pricedKeys(brief),
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

/* ── Safe parsing + validation of the model's reply ─────────────────────────── */
function extractJson(raw: string): string {
  let s = raw.trim();
  // strip ``` / ```json fences if the model added them despite instructions
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  return s;
}

interface ModelScope {
  scopes: ServiceScope[];
  /** The model judged the brief detailed enough for a precise range. */
  enough: boolean;
  summary: string;
  included: string[];
  questions: string[];
}

function parseModelScope(obj: unknown, brief: Brief): ModelScope | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  if (!Array.isArray(o.services)) return null;

  const returned = new Map<PricingKey, ServiceScope>();
  for (const item of o.services) {
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const position = Number(s.position);
    if (!isPricingKey(s.key) || !isEstimateTier(s.tier)) continue;
    returned.set(s.key, {
      key: s.key,
      tier: s.tier,
      position: Number.isFinite(position) ? position : 0.3,
    });
  }

  // Price exactly what the client picked; the model may only choose services
  // itself when they described their need in their own words.
  const required = pricedKeys(brief);
  const scopes = required.length
    ? required.map((key) => returned.get(key) ?? heuristicScope(brief, key))
    : Array.from(returned.values()).slice(0, 3);

  return {
    scopes,
    enough: o.enough === true,
    summary: typeof o.summary === "string" ? o.summary.trim() : "",
    included: Array.isArray(o.included)
      ? o.included.filter((x): x is string => typeof x === "string")
      : [],
    questions: Array.isArray(o.questions)
      ? o.questions.filter((x): x is string => typeof x === "string")
      : [],
  };
}

/* ── Client-facing copy guards ──────────────────────────────────────────────
   The estimate is read by prospects, so anything that sounds like the model
   talking to itself, or that could contradict the computed numbers, is
   replaced with the standard copy for that scope. */
const META_RE =
  /\b(infer\w*|assum\w*|conservativ\w*|vague\w*|unclear|unspecified|not specified|limited (brief|detail|info\w*)|brief detail|based on (the|your) brief|tiers?|simple build|medium build|complex build)\b/i;
const NUMBERS_RE =
  /₹|\binr\b|\brs\.?\s|\blakhs?\b|\bcrores?\b|\b\d+\s*(?:[-–]\s*\d+\s*)?(?:hours?|days?|weeks?|months?)\b/i;

function isCleanCopy(text: string) {
  return !META_RE.test(text) && !NUMBERS_RE.test(text);
}

const SERVICE_NOUNS: Record<PricingKey, string> = {
  brand_logo: "brand identity",
  website: "website",
  app: "app",
  design_prototype: "product design",
  ai_integration: "AI integration",
  content: "content package",
  security: "security review",
};

function standardSummary(scopes: ServiceScope[], tier: EstimateTier) {
  const what = scopes.map((s) => SERVICE_NOUNS[s.key]).join(" and ");
  if (tier === "simple") return `A focused ${what} with the essentials done properly, delivered fast.`;
  if (tier === "complex") return `A full ${what}, delivered in clear milestones and built to scale.`;
  return `A custom ${what} with the features your project needs, ready to launch.`;
}

function standardIncluded(scopes: ServiceScope[]) {
  const perService = scopes.length > 1 ? 2 : 5;
  return scopes.flatMap((s) => SCOPE_INCLUDES[s.key][s.tier].slice(0, perService));
}

function cleanIncluded(items: string[], scopes: ServiceScope[]) {
  const seen = new Set<string>();
  const clean: string[] = [];
  const add = (raw: string) => {
    const item = raw
      .replace(/\s*\([^)]*\)/g, (part) => (META_RE.test(part) ? "" : part))
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\.$/, "");
    const id = item.toLowerCase();
    if (!item || item.length > 80 || !isCleanCopy(item) || seen.has(id)) return;
    seen.add(id);
    clean.push(item);
  };

  items.forEach(add);
  if (clean.length < 3) standardIncluded(scopes).forEach(add);
  return clean.slice(0, 5);
}

/* The follow-ups shown with a starting price: the model's, when they read as
   real questions, topped up from the standard prompts for those services. */
function cleanQuestions(items: string[], scopes: ServiceScope[]) {
  const seen = new Set<string>();
  const clean: string[] = [];
  const add = (raw: string) => {
    const q = raw.replace(/\s+/g, " ").trim();
    const id = q.toLowerCase();
    if (!q.endsWith("?") || q.length > 100 || !isCleanCopy(q) || seen.has(id)) return;
    seen.add(id);
    clean.push(q);
  };

  items.forEach(add);
  if (clean.length < 2) {
    const standard = scopes.length
      ? scopes.flatMap((s) => BRIEF_PROMPTS[s.key].slice(0, 2))
      : GENERAL_PROMPTS;
    standard.forEach(add);
  }
  return clean.slice(0, 3);
}

function wordCount(brief: Brief) {
  return `${brief.customNeed ?? ""} ${brief.description}`.split(/\s+/).filter(Boolean).length;
}

function buildEstimate(
  scopes: ServiceScope[],
  pricingTable: PricingTable,
  copy: { summary: string; included: string[]; questions: string[] } | null,
  precise: boolean
): Estimate {
  const { tier, priceLow, priceHigh, timeline } = precise
    ? quote(scopes, pricingTable)
    : startingPrice(scopes, pricingTable);
  const summary =
    copy?.summary && copy.summary.length <= 300 && isCleanCopy(copy.summary)
      ? copy.summary
      : standardSummary(scopes, tier);

  return {
    kind: precise ? "range" : "from",
    tier,
    priceLow,
    priceHigh,
    timeline,
    summary,
    included: cleanIncluded(copy?.included ?? [], scopes),
    services: scopes.map((s) => s.key),
    ...(precise ? {} : { questions: cleanQuestions(copy?.questions ?? [], scopes) }),
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
  const rawContact =
    candidate.contact && typeof candidate.contact === "object"
      ? (candidate.contact as Record<string, unknown>)
      : null;
  const contactEmail =
    typeof rawContact?.email === "string" ? rawContact.email.trim() : "";
  const contactName =
    typeof rawContact?.name === "string" ? rawContact.name.trim().slice(0, 120) : "";

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
      contact: EMAIL_RE.test(contactEmail)
        ? { email: contactEmail.slice(0, 254), ...(contactName ? { name: contactName } : {}) }
        : null,
    },
  };
}

/* ── Deterministic scope when the model is unavailable ──────────────────────── */
const EARLY_STAGES = [
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
const COMPLEX_STAGES = [
  "scaling",
  "business-scale",
  "creator-pro",
  "idea-launch",
  "freelancer-team",
];

function heuristicScope(brief: Brief, key: PricingKey): ServiceScope {
  const blob = `${brief.stage} ${brief.description}`.toLowerCase();
  const complexSignals =
    COMPLEX_STAGES.includes(brief.stage) ||
    /enterprise|dashboard|integrat|rag|agent|multi|scale|saas|platform|backend/.test(
      blob
    );

  let tier: EstimateTier = "medium";
  if (EARLY_STAGES.includes(brief.stage)) tier = "simple";
  if (complexSignals) tier = "complex";

  return { key, tier, position: 0.3 };
}

async function scopeWithModel(
  brief: Brief,
  pricingTable: PricingTable,
  apiKey: string
): Promise<ModelScope | null> {
  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      temperature: 0.2,
      system: systemPrompt(pricingTable),
      messages: [{ role: "user", content: userContent(brief) }],
    });

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = parseModelScope(JSON.parse(extractJson(text)), brief);
    if (!parsed) throw new Error("Model returned an unparseable scope.");
    return parsed;
  } catch (err) {
    console.error("[estimate] falling back to heuristic scope:", err);
    return null;
  }
}

/* What the team sees: a starting price is flagged, with what's still open. */
function leadSummary(estimate: Estimate) {
  if (estimate.kind === "range") return estimate.summary;
  const open = estimate.questions?.length ? ` Still to confirm: ${estimate.questions.join(" / ")}` : "";
  return `${estimate.summary}\n\nStarting price only - the brief was too thin for a precise range.${open}`;
}

/** Saves the lead and returns its id. A refined brief (`leadId`) updates the
 *  lead it came from instead of adding a second one. */
async function recordLead(
  brief: Brief,
  estimate: Estimate | null,
  leadId?: string
): Promise<string | undefined> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return undefined;

  const row = {
    name: brief.contact?.name ?? null,
    contact_email: brief.contact?.email ?? null,
    contact_phone: null,
    persona: brief.customPersona || brief.persona || null,
    needs: brief.needs ?? [],
    stage: brief.stage || null,
    brief_text: brief.description || null,
    ai_tier: estimate?.tier ?? null,
    ai_price_low: estimate?.priceLow ?? null,
    ai_price_high: estimate?.priceHigh ?? null,
    ai_summary: estimate ? leadSummary(estimate) : null,
    ai_timeline: estimate?.timeline ?? null,
    ai_included: estimate?.included ?? null,
  };

  try {
    if (leadId) {
      const { data, error } = await supabase
        .from("leads")
        .update(row)
        .eq("id", leadId)
        .eq("status", "new")
        .gte("created_at", new Date(Date.now() - REFINE_WINDOW_MS).toISOString())
        .select("id");
      if (error) throw error;
      if (data?.length) return leadId;
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({ ...row, status: "new" })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("[estimate] lead save failed:", error);
    return undefined;
  }
}

async function completeEstimate(brief: Brief, estimate: Estimate, leadId?: string) {
  const savedId = await recordLead(brief, estimate, leadId);

  try {
    await sendEstimateEmail(brief, estimate);
  } catch (error) {
    // The estimate must still reach the browser even if email delivery is down.
    console.error("[estimate] estimate email failed:", error);
  }

  return NextResponse.json({ ...estimate, ...(savedId ? { leadId: savedId } : {}) });
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
  const rawLeadId = (body as { leadId?: unknown }).leadId;
  const leadId = typeof rawLeadId === "string" && UUID_RE.test(rawLeadId) ? rawLeadId : undefined;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const pricingTable = await loadPricingTable();

  // No key or no usable reply → scope from the stage alone, so the path still
  // ends in a grounded number.
  const modelScope = apiKey ? await scopeWithModel(brief, pricingTable, apiKey) : null;
  const scopes = modelScope?.scopes.length
    ? modelScope.scopes
    : pricedKeys(brief).map((key) => heuristicScope(brief, key));

  // Nothing we can price (e.g. "something else" that maps to no service):
  // keep the lead and let the client fall through to "let's talk it through".
  if (!scopes.length) {
    await recordLead(brief, null, leadId);
    return NextResponse.json(
      { error: "This one needs a conversation rather than a standard range." },
      { status: 422 }
    );
  }

  // A precise range only when the brief carries the details that set the
  // price; otherwise an honest starting price plus what would firm it up.
  const words = wordCount(brief);
  const precise = modelScope?.scopes.length
    ? modelScope.enough && words >= MIN_WORDS_FOR_RANGE
    : words >= FALLBACK_WORDS_FOR_RANGE;

  return completeEstimate(
    brief,
    buildEstimate(scopes, pricingTable, modelScope, precise),
    leadId
  );
}
