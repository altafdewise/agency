"use client";

const SESSION_KEY = "maggie_session_id";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getAnalyticsSessionId() {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = makeId();
    window.sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
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
  post("/api/analytics/page-view", {
    path,
    referrer: referrer || null,
    sessionId: getAnalyticsSessionId(),
  });
}

export function trackFunnelEvent(stepName: string, action: "entered" | "completed") {
  post("/api/analytics/funnel-event", {
    sessionId: getAnalyticsSessionId(),
    stepName,
    action,
  });
}
