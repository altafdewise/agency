/**
 * Where a visit came from: a tagged campaign link (utm_*), an ad click id, or
 * the referring site. Pure helpers shared by the browser (capture), the
 * estimate route (sanitising) and the admin + alert email (display).
 */

export interface Attribution {
  /** instagram, google, linkedin, direct... */
  source: string;
  /** bio, post, story, cpc, organic, social, referral... */
  medium?: string;
  /** Your campaign name from the link, e.g. "launch". */
  campaign?: string;
  /** The referring site's host, when there was one. */
  referrer?: string;
  /** The first page they landed on. */
  landing?: string;
}

/** Known referrers, so untagged traffic still gets a readable source. */
const REFERRERS: [RegExp, string, string][] = [
  [/(^|\.)instagram\.com$/, "instagram", "social"],
  [/(^|\.)(facebook\.com|fb\.me|fb\.com)$/, "facebook", "social"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin", "social"],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "x", "social"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp", "social"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube", "social"],
  [/(^|\.)reddit\.com$/, "reddit", "social"],
  [/(^|\.)google\.[a-z.]+$/, "google", "organic"],
  [/(^|\.)bing\.com$/, "bing", "organic"],
  [/(^|\.)duckduckgo\.com$/, "duckduckgo", "organic"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "chatgpt", "referral"],
];

const clean = (value: unknown, max = 60) =>
  typeof value === "string"
    ? value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._/-]/g, "").slice(0, max)
    : "";

/** Works out the source of a landing, from its URL and the referrer. */
export function attributionFrom(url: URL, referrer: string): Attribution {
  const params = url.searchParams;
  let referrerHost = "";
  try {
    referrerHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    referrerHost = "";
  }
  if (referrerHost && referrerHost === url.hostname.replace(/^www\./, "")) referrerHost = "";

  const landing = url.pathname.slice(0, 200);
  const base = { landing, ...(referrerHost ? { referrer: referrerHost } : {}) };
  const known = REFERRERS.find(([pattern]) => pattern.test(referrerHost));

  const utmSource = clean(params.get("utm_source"));
  if (utmSource) {
    return {
      ...base,
      source: utmSource,
      ...(clean(params.get("utm_medium")) ? { medium: clean(params.get("utm_medium")) } : {}),
      ...(clean(params.get("utm_campaign"), 80) ? { campaign: clean(params.get("utm_campaign"), 80) } : {}),
    };
  }
  if (params.has("gclid")) return { ...base, source: "google", medium: "cpc" };
  if (params.has("fbclid")) return { ...base, source: known?.[1] ?? "meta", medium: "social" };
  if (known) return { ...base, source: known[1], medium: known[2] };
  if (referrerHost) return { ...base, source: referrerHost, medium: "referral" };
  return { ...base, source: "direct" };
}

/** Accepts only a well-formed attribution from the browser. */
export function sanitizeAttribution(input: unknown): Attribution | null {
  if (!input || typeof input !== "object") return null;
  const a = input as Record<string, unknown>;
  const source = clean(a.source);
  if (!source) return null;
  const medium = clean(a.medium);
  const campaign = clean(a.campaign, 80);
  const referrer = clean(a.referrer, 120);
  const landing = typeof a.landing === "string" && a.landing.startsWith("/") ? a.landing.slice(0, 200) : "";
  return {
    source,
    ...(medium ? { medium } : {}),
    ...(campaign ? { campaign } : {}),
    ...(referrer ? { referrer } : {}),
    ...(landing ? { landing } : {}),
  };
}

/** "instagram · bio · launch", for the admin and the lead alert. */
export function describeAttribution(a: Partial<Attribution> | null | undefined) {
  if (!a?.source) return "";
  return [a.source, a.medium, a.campaign].filter(Boolean).join(" · ");
}
