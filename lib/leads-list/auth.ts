import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The /leads passcodes: one for the founder, one shared by the team.
 * LEADS_PASSCODE and LEADS_TEAM_PASSCODE in Vercel win; until they're set,
 * the agreed codes are accepted via their hashes (the repo is public, so
 * the codes themselves never appear here). A session cookie is an HMAC keyed
 * by the code it was opened with, so changing a code signs out everyone
 * who used it, and only them.
 */
const COOKIE = "zev_leads";
const SESSION_DAYS = 30;

export type LeadsRole = "admin" | "team";

const CODES: { role: LeadsRole; env: string; fallbackSha256: string }[] = [
  { role: "admin", env: "LEADS_PASSCODE", fallbackSha256: "6b4355a481ed673e233b5b46cffd8c6dacf7df47cb9f2b5e21f8195018c6f09f" },
  { role: "team", env: "LEADS_TEAM_PASSCODE", fallbackSha256: "414a311f3d2d8ab8e766df03d24ff1b1cfb4fd4fe671b905e1aa8325e0bc32a6" },
];

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The code in force for a role, or null when only its hash is known. */
function configured(env: string) {
  return process.env[env]?.trim() || null;
}

/** What a cookie is keyed by: the code itself, or its hash until it's set. */
function secretFor(c: (typeof CODES)[number]) {
  return configured(c.env) ?? c.fallbackSha256;
}

function tokenFor(secret: string) {
  return createHmac("sha256", secret).update("zev-leads-session-v1").digest("hex");
}

/** The role this passcode opens, or null. */
export function roleForPasscode(attempt: string): LeadsRole | null {
  for (const c of CODES) {
    const code = configured(c.env);
    if (code ? safeEqual(attempt, code) : safeEqual(sha256(attempt), c.fallbackSha256)) return c.role;
  }
  return null;
}

/** The cookie value for a role, set once its passcode has been checked. */
export function sessionTokenFor(role: LeadsRole) {
  const c = CODES.find((x) => x.role === role)!;
  return tokenFor(secretFor(c));
}

/** The signed-in role, or null. */
export async function leadsSession(): Promise<LeadsRole | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  for (const c of CODES) {
    if (safeEqual(value, tokenFor(secretFor(c)))) return c.role;
  }
  return null;
}

export async function hasLeadsSession() {
  return (await leadsSession()) !== null;
}

export const sessionCookie = {
  name: COOKIE,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  },
};
