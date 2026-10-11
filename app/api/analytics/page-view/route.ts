import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isVisitorPath } from "@/lib/admin/analytics-summary";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 2048;

export async function POST(req: Request) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true });

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ ok: true });
    const body = JSON.parse(raw) as {
      path?: unknown;
      referrer?: unknown;
      sessionId?: unknown;
    };
    const path = typeof body.path === "string" ? body.path.slice(0, 300) : "";
    // Only site paths, and never the team's own admin screens.
    if (!path.startsWith("/") || path.startsWith("//") || !isVisitorPath(path)) {
      return NextResponse.json({ ok: true });
    }
    const referrer =
      typeof body.referrer === "string" && body.referrer
        ? body.referrer.slice(0, 500)
        : null;
    const session_id =
      typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null;

    await supabase.from("page_views").insert({ path, referrer, session_id });
  } catch (error) {
    console.error("[analytics] page view insert failed:", error);
  }

  return NextResponse.json({ ok: true });
}
