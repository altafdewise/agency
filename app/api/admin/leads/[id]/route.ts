import { authorizeAdminApi, adminApiError } from "@/lib/admin/api-auth";
import type { EstimateStatus, LeadStatus } from "@/lib/supabase/database.types";

const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "converted", "lost"];
const ESTIMATE_STATUSES: EstimateStatus[] = ["new", "reviewing", "sent", "accepted", "rejected"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await authorizeAdminApi("leads", true);
  if (!auth.ok) return adminApiError(auth.status);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid lead ID." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const fields: { status?: LeadStatus; estimate_status?: EstimateStatus } = {};
  if ("status" in input) {
    if (typeof input.status !== "string" || !LEAD_STATUSES.includes(input.status as LeadStatus)) return Response.json({ error: "Invalid lead status." }, { status: 400 });
    fields.status = input.status as LeadStatus;
  }
  if ("estimateStatus" in input) {
    if (typeof input.estimateStatus !== "string" || !ESTIMATE_STATUSES.includes(input.estimateStatus as EstimateStatus)) return Response.json({ error: "Invalid estimate status." }, { status: 400 });
    fields.estimate_status = input.estimateStatus as EstimateStatus;
  }
  if (!Object.keys(fields).length) return Response.json({ error: "Choose a valid status." }, { status: 400 });

  const { data, error } = await auth.supabase.from("leads").update(fields).eq("id", id).select("id,status,estimate_status,updated_at").maybeSingle();
  if (error) { console.error("[admin/leads] status update failed:", error); return adminApiError(500); }
  if (!data) return Response.json({ error: "Lead not found." }, { status: 404 });
  return Response.json({ lead: data });
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await authorizeAdminApi("leads", true);
  if (!auth.ok) return adminApiError(auth.status);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid lead ID." }, { status: 400 });

  const { data, error } = await auth.supabase.from("leads").delete().eq("id", id).select("id").maybeSingle();
  if (error) { console.error("[admin/leads] delete failed:", error); return adminApiError(500); }
  if (!data) return Response.json({ error: "Lead not found." }, { status: 404 });
  return Response.json({ deleted: true });
}
