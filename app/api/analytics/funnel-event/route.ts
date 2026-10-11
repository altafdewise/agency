import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 1024;
const STEP_NAME_RE = /^step_[1-9][0-9]?$/;

export async function POST(req: Request) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true });

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ ok: true });
    const body = JSON.parse(raw) as {
      sessionId?: unknown;
      stepName?: unknown;
      action?: unknown;
    };
    const session_id =
      typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "";
    const step_name =
      typeof body.stepName === "string" && STEP_NAME_RE.test(body.stepName) ? body.stepName : "";
    const action = body.action === "completed" ? "completed" : "entered";

    if (session_id && step_name) {
      await supabase.from("funnel_events").insert({
        session_id,
        step_name,
        action,
      });
    }
  } catch (error) {
    console.error("[analytics] funnel event insert failed:", error);
  }

  return NextResponse.json({ ok: true });
}
