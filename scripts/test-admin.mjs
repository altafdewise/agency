import assert from "node:assert/strict";
import test from "node:test";
import { normalizeFeedbackRow, splitFeedbackMessage } from "../lib/admin/feedback-model.ts";
import { canAccess, canEditLeads } from "../lib/admin/permissions.ts";

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
