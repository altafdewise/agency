import { NextResponse } from "next/server";
import { createFeedback } from "@/lib/feedback";

export const runtime = "nodejs";

const MAX_MESSAGE_CHARS = 2000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

// In-memory per-IP buckets: same lightweight approach as /api/estimate. Deters
// spam without storing any identifying info alongside the feedback itself.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

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

export async function POST(req: Request) {
  const retryAfter = checkRateLimit(getClientIp(req));
  if (retryAfter) {
    return NextResponse.json(
      {
        error:
          "Thanks - that's a lot of feedback at once. Please wait a few minutes and try again.",
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

  const raw =
    body && typeof body === "object"
      ? (body as { message?: unknown }).message
      : undefined;
  const rawKind =
    body && typeof body === "object"
      ? (body as { kind?: unknown }).kind
      : undefined;
  const message = typeof raw === "string" ? raw.trim() : "";
  const kind = typeof rawKind === "string" ? rawKind.trim().slice(0, 40) : "";

  if (!message) {
    return NextResponse.json(
      { error: "Add a message before sending." },
      { status: 400 }
    );
  }

  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: `Keep it under ${MAX_MESSAGE_CHARS} characters, please.` },
      { status: 400 }
    );
  }

  try {
    await createFeedback(kind ? `[${kind}]\n${message}` : message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[feedback] failed to store feedback:", error);
    return NextResponse.json(
      { error: "Could not send that just now. Please try again." },
      { status: 500 }
    );
  }
}
