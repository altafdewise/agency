import { createHash } from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/* Limits for the public estimate endpoint. Each estimate is a paid model call,
   saves a lead and can send an email, so the endpoint is capped per visitor, for
   everyone together, and per email address. Counts live in the
   `estimate_requests` table so every serverless instance shares them; until that
   migration is applied, each instance falls back to counting in memory. */

const WINDOW_MS = 10 * 60 * 1000;
/** Estimates one visitor (IP) can request per window. */
const PER_CLIENT = 5;
/** Estimates all visitors together can request per hour: the ceiling on model spend. */
const GLOBAL_PER_HOUR = 60;
const HOUR_MS = 60 * 60 * 1000;
/** Estimate emails any one address can receive per day. */
const EMAILS_PER_ADDRESS = 3;
const DAY_MS = 24 * HOUR_MS;
const PRUNE_AFTER_MS = 2 * DAY_MS;

export type Admission =
  | { ok: true; requestId?: string }
  | { ok: false; retryAfter: number; reason: "client" | "global" };

function hash(value: string) {
  const salt =
    process.env.RATE_LIMIT_SALT ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "zev";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex").slice(0, 32);
}

/** On Vercel these headers are set by the platform, not the visitor. */
export function clientKey(req: Request) {
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  return ip.slice(0, 64);
}

/* ── in-memory fallback (per instance) ───────────────────────────────────── */
const localClients = new Map<string, number[]>();
const localGlobal: number[] = [];
const localEmails = new Map<string, number[]>();

function recent(times: number[], windowMs: number, now: number) {
  while (times.length && times[0] <= now - windowMs) times.shift();
  return times;
}

function pruneLocal(map: Map<string, number[]>, windowMs: number, now: number) {
  if (map.size < 500) return;
  for (const [key, times] of map) {
    if (!recent(times, windowMs, now).length) map.delete(key);
  }
}

function admitLocal(client: string, now: number): Admission {
  pruneLocal(localClients, WINDOW_MS, now);
  const times = recent(localClients.get(client) ?? [], WINDOW_MS, now);
  if (times.length >= PER_CLIENT) {
    return { ok: false, reason: "client", retryAfter: Math.ceil((times[0] + WINDOW_MS - now) / 1000) };
  }
  if (recent(localGlobal, HOUR_MS, now).length >= GLOBAL_PER_HOUR) {
    return { ok: false, reason: "global", retryAfter: Math.ceil((localGlobal[0] + HOUR_MS - now) / 1000) };
  }
  times.push(now);
  localClients.set(client, times);
  localGlobal.push(now);
  return { ok: true };
}

function claimEmailLocal(email: string, now: number) {
  pruneLocal(localEmails, DAY_MS, now);
  const times = recent(localEmails.get(email) ?? [], DAY_MS, now);
  if (times.length >= EMAILS_PER_ADDRESS) return false;
  times.push(now);
  localEmails.set(email, times);
  return true;
}

/* ── shared (Supabase) ───────────────────────────────────────────────────── */
// When the table isn't there yet, stop asking for a few minutes, then look again.
let sharedUnavailableUntil = 0;
const RECHECK_MS = 5 * 60 * 1000;

function isMissingTable(error: { code?: string } | null) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

/** Counts this request against the limits; refuses it if a limit is reached. */
export async function admitEstimateRequest(client: string): Promise<Admission> {
  const now = Date.now();
  const supabase = getSupabaseAdminClient();
  if (!supabase || now < sharedUnavailableUntil) return admitLocal(client, now);

  const clientHash = hash(client);
  const [perClient, global] = await Promise.all([
    supabase
      .from("estimate_requests")
      .select("created_at", { count: "exact" })
      .eq("client_hash", clientHash)
      .gte("created_at", new Date(now - WINDOW_MS).toISOString())
      .order("created_at", { ascending: true })
      .limit(1),
    supabase
      .from("estimate_requests")
      .select("created_at", { count: "exact" })
      .gte("created_at", new Date(now - HOUR_MS).toISOString())
      .order("created_at", { ascending: true })
      .limit(1),
  ]);

  const error = perClient.error || global.error;
  if (error) {
    if (isMissingTable(error)) sharedUnavailableUntil = now + RECHECK_MS;
    else console.error("[estimate-guard] limit check failed:", error);
    return admitLocal(client, now);
  }

  const oldest = (rows: { created_at: string }[] | null) =>
    rows?.[0] ? new Date(rows[0].created_at).getTime() : now;
  if ((perClient.count ?? 0) >= PER_CLIENT) {
    return {
      ok: false,
      reason: "client",
      retryAfter: Math.max(1, Math.ceil((oldest(perClient.data) + WINDOW_MS - now) / 1000)),
    };
  }
  if ((global.count ?? 0) >= GLOBAL_PER_HOUR) {
    return {
      ok: false,
      reason: "global",
      retryAfter: Math.max(1, Math.ceil((oldest(global.data) + HOUR_MS - now) / 1000)),
    };
  }

  const { data, error: insertError } = await supabase
    .from("estimate_requests")
    .insert({ client_hash: clientHash })
    .select("id")
    .single();
  if (insertError) {
    console.error("[estimate-guard] request log failed:", insertError);
    return admitLocal(client, now);
  }

  // Old rows are only needed for the windows above.
  if (Math.random() < 0.02) {
    void supabase
      .from("estimate_requests")
      .delete()
      .lt("created_at", new Date(now - PRUNE_AFTER_MS).toISOString())
      .then(({ error: pruneError }) => {
        if (pruneError) console.error("[estimate-guard] prune failed:", pruneError);
      });
  }

  return { ok: true, requestId: data.id };
}

/** Whether this address may be sent another estimate email today. Claims the
 *  send when it may, so the caller should email right after. */
export async function claimEstimateEmail(email: string, requestId?: string) {
  const now = Date.now();
  const address = email.trim().toLowerCase();
  const supabase = getSupabaseAdminClient();
  if (!supabase || !requestId) return claimEmailLocal(address, now);

  const emailHash = hash(address);
  const { count, error } = await supabase
    .from("estimate_requests")
    .select("id", { count: "exact", head: true })
    .eq("email_hash", emailHash)
    .eq("emailed", true)
    .gte("created_at", new Date(now - DAY_MS).toISOString());
  if (error) {
    console.error("[estimate-guard] email check failed:", error);
    return claimEmailLocal(address, now);
  }
  if ((count ?? 0) >= EMAILS_PER_ADDRESS) return false;

  const { error: markError } = await supabase
    .from("estimate_requests")
    .update({ email_hash: emailHash, emailed: true })
    .eq("id", requestId);
  if (markError) console.error("[estimate-guard] email mark failed:", markError);
  return true;
}
