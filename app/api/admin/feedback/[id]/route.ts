import { authorizeAdminApi, adminApiError } from "@/lib/admin/api-auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await authorizeAdminApi("feedback", true);
  if (!auth.ok) return adminApiError(auth.status);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid feedback ID." }, { status: 400 });

  const { data, error } = await auth.supabase.from("feedback").delete().eq("id", id).select("id").maybeSingle();
  if (error) { console.error("[admin/feedback] delete failed:", error); return adminApiError(500); }
  if (!data) return Response.json({ error: "Feedback not found." }, { status: 404 });
  return Response.json({ deleted: true });
}
