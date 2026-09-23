import { authorizeAdminApi, adminApiError } from "@/lib/admin/api-auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Context = { params: Promise<{ id: string }> };

/** An estimate is part of a lead; remove estimate fields without deleting the enquiry. */
export async function DELETE(_request: Request, { params }: Context) {
  const auth = await authorizeAdminApi("estimates", true);
  if (!auth.ok) return adminApiError(auth.status);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid estimate ID." }, { status: 400 });

  const { data, error } = await auth.supabase.from("leads").update({
    ai_tier: null,
    ai_price_low: null,
    ai_price_high: null,
    ai_summary: null,
    ai_timeline: null,
    ai_included: null,
    estimate_status: null,
  }).eq("id", id).not("ai_price_low", "is", null).select("id").maybeSingle();
  if (error) { console.error("[admin/estimates] delete failed:", error); return adminApiError(500); }
  if (!data) return Response.json({ error: "Estimate not found." }, { status: 404 });
  return Response.json({ deleted: true });
}
