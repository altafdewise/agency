import { NextResponse } from "next/server";
import { roleForPasscode, sessionCookie, sessionTokenFor } from "@/lib/leads-list/auth";

export const runtime = "nodejs";

// Only a few tries a minute per instance, so the passcode can't be guessed
// in bulk. (Serverless instances each count separately; it's a brake, not a lock.)
const tries = new Map<string, { n: number; at: number }>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const t = tries.get(ip);
  if (t && now - t.at < 60_000 && t.n >= 8) {
    return NextResponse.json({ error: "Too many tries. Wait a minute." }, { status: 429 });
  }
  tries.set(ip, t && now - t.at < 60_000 ? { n: t.n + 1, at: t.at } : { n: 1, at: now });

  let passcode = "";
  try {
    const body = (await request.json()) as { passcode?: unknown };
    passcode = typeof body.passcode === "string" ? body.passcode.trim() : "";
  } catch {
    /* fall through */
  }
  const role = passcode ? roleForPasscode(passcode) : null;
  if (!role) {
    return NextResponse.json({ error: "That passcode isn't right." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, sessionTokenFor(role), sessionCookie.options);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie.name, "", { ...sessionCookie.options, maxAge: 0 });
  return res;
}
