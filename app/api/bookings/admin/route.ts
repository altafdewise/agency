import { authorizeAdminApi, adminApiError } from "@/lib/admin/api-auth";

/** Kept for older admin clients, but a password alone no longer exposes bookings. */
export async function POST() {
  const auth = await authorizeAdminApi("bookings");
  if (!auth.ok) return adminApiError(auth.status);
  const { data, error } = await auth.supabase.from("bookings").select("id,created_at,date,time,timezone,contact_name,contact_email,contact_phone,note,brief,estimate,status,updated_at").order("created_at", { ascending: false }).limit(100);
  if (error) { console.error("[bookings/admin] read failed:", error); return adminApiError(500); }
  const bookings = (data ?? []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    date: row.date,
    time: row.time,
    timezone: row.timezone,
    contact: { name: row.contact_name, email: row.contact_email, phone: row.contact_phone },
    note: row.note,
    brief: row.brief,
    estimate: row.estimate,
    status: row.status,
  }));
  return Response.json({ bookings });
}
