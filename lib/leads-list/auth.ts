import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The /leads passcode. Researchers and tele-callers share one code, set as
 * LEADS_PASSCODE in Vercel. Until that's set, the code the team agreed on is
 * accepted via its hash (the repo is public, so the code itself never
 * appears here). A valid cookie is an HMAC keyed by the passcode, so
 * changing the passcode signs everyone out.
 */
const COOKIE = "zev_leads";
const SESSION_DAYS = 30;
const FALLBACK_SHA256 = "6b4355a481ed673e233b5b46cffd8c6dacf7df47cb9f2b5e21f8195018c6f09f";

function sha256(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The passcode in force, or null when only the hash is known. */
function configuredPasscode() {
  return process.env.LEADS_PASSCODE?.trim() || null;
}

export function passcodeMatches(attempt: string) {
  const code = configuredPasscode();
  if (code) return safeEqual(attempt, code);
  return safeEqual(sha256(attempt), FALLBACK_SHA256);
}

function tokenFor(passcode: string) {
  return createHmac("sha256", passcode).update("zev-leads-session-v1").digest("hex");
}

export async function hasLeadsSession() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const code = configuredPasscode();
  // With only the hash on file, the token can't be recomputed from the
  // passcode, so it's derived from the hash instead (see sessionToken).
  const expected = code ? tokenFor(code) : tokenFor(FALLBACK_SHA256);
  return safeEqual(value, expected);
}

/** The cookie value to set once an attempt has passed passcodeMatches. */
export function sessionTokenForAttempt() {
  const code = configuredPasscode();
  return code ? tokenFor(code) : tokenFor(FALLBACK_SHA256);
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
