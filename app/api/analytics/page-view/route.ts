import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true });

  try {
    const body = (await req.json()) as {
      path?: unknown;
      referrer?: unknown;
      sessionId?: unknown;
    };
    const path = typeof body.path === "string" ? body.path.slice(0, 300) : "/";
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
