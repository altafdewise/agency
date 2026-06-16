import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true });

  try {
    const body = (await req.json()) as {
      sessionId?: unknown;
      stepName?: unknown;
      action?: unknown;
    };
    const session_id =
      typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : "";
    const step_name =
      typeof body.stepName === "string" ? body.stepName.slice(0, 80) : "";
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
