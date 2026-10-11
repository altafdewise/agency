"use client";

import { attributionFrom, sanitizeAttribution, type Attribution } from "@/lib/attribution";
import { sessionGet, sessionSet } from "@/lib/safe-storage";

const KEY = "zev_attribution";

/**
 * Notes where this visit came from, for the session. A tagged link always
 * wins (so the latest campaign is credited); otherwise the first landing's
 * referrer is kept and later in-site navigation never overwrites it.
 */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const tagged = url.searchParams.has("utm_source") || url.searchParams.has("gclid") || url.searchParams.has("fbclid");
  if (!tagged && sessionGet(KEY)) return;
  sessionSet(KEY, JSON.stringify(attributionFrom(url, document.referrer)));
}

export function readAttribution(): Attribution | null {
  try {
    return sanitizeAttribution(JSON.parse(sessionGet(KEY) || "null"));
  } catch {
    return null;
  }
}
