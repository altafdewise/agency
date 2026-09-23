import { authorizeAdminApi, adminApiError } from "@/lib/admin/api-auth";
import type { BookingStatus } from "@/lib/supabase/database.types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];
type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const auth = await authorizeAdminApi("bookings", true);
  if (!auth.ok) return adminApiError(auth.status);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid booking ID." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request." }, { status: 400 });
  const input = body as Record<string, unknown>;
  const fields: { status?: BookingStatus; date?: string; time?: string } = {};
  if ("status" in input) {
    if (typeof input.status !== "string" || !STATUSES.includes(input.status as BookingStatus)) return Response.json({ error: "Invalid booking status." }, { status: 400 });
    fields.status = input.status as BookingStatus;
  }
  if ("date" in input || "time" in input) {
    if (typeof input.date !== "string" || typeof input.time !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) return Response.json({ error: "Choose a valid date and time." }, { status: 400 });
    const [year, month, day] = input.date.split("-").map(Number);
    const [hour, minute] = input.time.split(":").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day || hour > 23 || minute > 59) return Response.json({ error: "Choose a valid date and time." }, { status: 400 });
    const now = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const part = (name: string) => now.find((entry) => entry.type === name)?.value || "00";
    const today = `${part("year")}-${part("month")}-${part("day")}`;
    const currentTime = `${part("hour")}:${part("minute")}`;
    if (input.date < today || (input.date === today && input.time <= currentTime)) return Response.json({ error: "Choose an upcoming call slot." }, { status: 400 });
    fields.date = input.date;
    fields.time = input.time;
  }
  if (!Object.keys(fields).length) return Response.json({ error: "Choose a valid change." }, { status: 400 });

  const { data, error } = await auth.supabase.from("bookings").update(fields).eq("id", id).select("id,status,date,time,updated_at").maybeSingle();
  if (error) {
    if (error.code === "23505") return Response.json({ error: "That time slot is already booked." }, { status: 409 });
    console.error("[admin/bookings] update failed:", error);
    return adminApiError(500);
  }
  if (!data) return Response.json({ error: "Booking not found." }, { status: 404 });
  return Response.json({ booking: data });
}

export async function DELETE(_request: Request, { params }: Context) {
  const auth = await authorizeAdminApi("bookings", true);
  if (!auth.ok) return adminApiError(auth.status);
  const { id } = await params;
  if (!UUID.test(id)) return Response.json({ error: "Invalid booking ID." }, { status: 400 });

  const { data, error } = await auth.supabase.from("bookings").delete().eq("id", id).select("id").maybeSingle();
  if (error) { console.error("[admin/bookings] delete failed:", error); return adminApiError(500); }
  if (!data) return Response.json({ error: "Booking not found." }, { status: 404 });
  return Response.json({ deleted: true });
}
