import assert from "node:assert/strict";
import test from "node:test";
import { normalizeFeedbackRow, splitFeedbackMessage } from "../lib/admin/feedback-model.ts";
import { canAccess, canEditLeads } from "../lib/admin/permissions.ts";
import { summarizeAnalytics } from "../lib/admin/analytics-summary.ts";

test("feedback empty state accepts no rows", () => {
  assert.deepEqual([].map(normalizeFeedbackRow), []);
});

test("one feedback record preserves its content and optional fields", () => {
  const item = normalizeFeedbackRow({ id: "one", message: "Thank you", created_at: "2026-09-23T00:00:00Z", name: "A client", rating: 5, project: "Website" });
  assert.equal(item.message, "Thank you");
  assert.equal(item.name, "A client");
  assert.equal(item.rating, 5);
  assert.equal(item.project, "Website");
});

test("multiple feedback records preserve separate messages", () => {
  const items = [
    { id: "two", message: "Second", created_at: "2026-09-23T00:00:00Z" },
    { id: "one", message: "First", created_at: "2026-09-22T00:00:00Z" },
  ].map(normalizeFeedbackRow);
  assert.deepEqual(items.map((item) => item.message), ["Second", "First"]);
});

test("malformed optional feedback fields never crash rendering", () => {
  const item = normalizeFeedbackRow({ id: "bad", message: null, created_at: null, name: {}, rating: "five", project: [] });
  assert.equal(item.message, "");
  assert.equal(item.createdAt, "");
  assert.equal(item.name, null);
  assert.equal(item.rating, null);
  assert.equal(item.project, null);
});

test("legacy tagged feedback is parsed without changing the message", () => {
  assert.deepEqual(splitFeedbackMessage("[Issue]\nSomething broke"), { kind: "Issue", body: "Something broke" });
  assert.deepEqual(splitFeedbackMessage("Plain note"), { kind: "Note", body: "Plain note" });
});

test("non-admin roles cannot use sensitive sections or writes", () => {
  assert.equal(canAccess("viewer", "feedback"), false);
  assert.equal(canAccess("viewer", "bookings"), true);
  assert.equal(canEditLeads("viewer"), false);
  assert.equal(canAccess("owner", "feedback"), true);
  assert.equal(canEditLeads("owner"), true);
});

const NOW = Date.parse("2026-10-11T12:00:00Z");
const view = (path, session, daysAgo = 0) => ({ path, session_id: session, viewed_at: new Date(NOW - daysAgo * 86400000).toISOString() });

test("analytics: empty data shows zeros, not fake percentages", () => {
  const summary = summarizeAnalytics({ pageViews: [], funnelEvents: [], leads: [], flowSteps: 7, now: NOW });
  assert.equal(summary.visitors30, 0);
  assert.equal(summary.conversionRate, null);
  assert.equal(summary.avgEstimate, null);
  assert.equal(summary.funnel.length, 7);
  assert.ok(summary.funnel.every((step) => step.sessions === 0));
});

test("analytics: admin screens are never counted as visitors or pages", () => {
  const summary = summarizeAnalytics({
    pageViews: [view("/", "a"), view("/admin", "owner"), view("/admin/leads", "owner"), view("/administer", "b")],
    funnelEvents: [],
    leads: [],
    flowSteps: 7,
    now: NOW,
  });
  assert.equal(summary.visitors30, 2);
  assert.deepEqual(summary.paths, ["/", "/administer"]);
});

test("analytics: totals are not capped at 1,000 rows", () => {
  const pageViews = Array.from({ length: 2500 }, (_, i) => view("/", `s${i}`));
  const summary = summarizeAnalytics({ pageViews, funnelEvents: [], leads: [], flowSteps: 7, now: NOW });
  assert.equal(summary.visitors30, 2500);
  assert.equal(summary.dailyViews.reduce((sum, day) => sum + day.views, 0), 2500);
});

test("analytics: the funnel counts each session once per step", () => {
  const summary = summarizeAnalytics({
    pageViews: [],
    funnelEvents: [
      { session_id: "a", step_name: "step_1", action: "entered" },
      { session_id: "a", step_name: "step_1", action: "entered" },
      { session_id: "b", step_name: "step_1", action: "entered" },
      { session_id: "a", step_name: "step_2", action: "entered" },
      { session_id: "a", step_name: "step_2", action: "completed" },
    ],
    leads: [],
    flowSteps: 3,
    now: NOW,
  });
  assert.deepEqual(summary.funnel.map((step) => step.sessions), [2, 1, 0]);
});

test("analytics: visitors window is 30 days; enquiry stats use priced leads", () => {
  const summary = summarizeAnalytics({
    pageViews: [view("/", "recent", 3), view("/", "old", 45)],
    funnelEvents: [],
    leads: [
      { status: "won", ai_price_low: 100, ai_price_high: 300 },
      { status: "new", ai_price_low: null, ai_price_high: null },
    ],
    flowSteps: 7,
    now: NOW,
  });
  assert.equal(summary.visitors30, 1);
  assert.equal(summary.enquiries, 2);
  assert.equal(summary.conversionRate, 50);
  assert.equal(summary.estimateRequests, 1);
  assert.equal(summary.avgEstimate, 200);
});
