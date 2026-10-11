"use client";

import { sessionGet, sessionSet } from "@/lib/safe-storage";
import { isVisitorPath } from "@/lib/admin/analytics-summary";

const SESSION_KEY = "maggie_session_id";
const FUNNEL_SENT_KEY = "zev_funnel_sent";

// Kept in memory too, so a visitor whose browser blocks storage still gets one
// stable id (and one set of funnel events) for as long as the tab is open.
let memorySessionId = "";
let funnelSent: Set<string> | null = null;

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "";
  if (memorySessionId) return memorySessionId;
  memorySessionId = sessionGet(SESSION_KEY) || makeId();
  sessionSet(SESSION_KEY, memorySessionId);
  return memorySessionId;
}

function post(path: string, body: Record<string, unknown>) {
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
    navigator.sendBeacon(path, blob);
    return;
  }

  fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {});
}

export function trackPageView(path: string, referrer?: string) {
  if (!isVisitorPath(path)) return; // the team's own admin screens aren't visitors
  post("/api/analytics/page-view", {
    path,
    referrer: referrer || null,
    sessionId: getAnalyticsSessionId(),
  });
}

function sentFunnelEvents() {
  if (!funnelSent) {
    let saved: unknown = [];
    try {
      saved = JSON.parse(sessionGet(FUNNEL_SENT_KEY) || "[]");
    } catch {
      saved = [];
    }
    funnelSent = new Set(Array.isArray(saved) ? saved.filter((v) => typeof v === "string") : []);
  }
  return funnelSent;
}

/** Each step is entered and completed at most once per session, so going back
 *  and forth (or revisiting the home page) never inflates the funnel. */
export function trackFunnelEvent(stepName: string, action: "entered" | "completed") {
  const sent = sentFunnelEvents();
  const key = `${stepName}:${action}`;
  if (sent.has(key)) return;
  sent.add(key);
  sessionSet(FUNNEL_SENT_KEY, JSON.stringify([...sent]));

  post("/api/analytics/funnel-event", {
    sessionId: getAnalyticsSessionId(),
    stepName,
    action,
  });
}
