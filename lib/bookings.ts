import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Brief, Estimate } from "@/lib/brief";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { BookingRow, Json } from "@/lib/supabase/database.types";

export interface BookingContact {
  name?: string;
  email: string;
  phone?: string;
}

export interface Booking {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  timezone: string;
  contact: BookingContact;
  note?: string;
  brief: Brief;
  estimate: Estimate | null;
}

export type BookingInput = Omit<Booking, "id" | "createdAt">;

const DATA_DIR = path.join(process.cwd(), "data");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

function isMissingBookingsTable(error: { code?: string; message?: string }) {
  const message = error.message ?? "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (/bookings/i.test(message) &&
      (/does not exist/i.test(message) || /schema cache/i.test(message)))
  );
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    createdAt: row.created_at,
    date: row.date,
    time: row.time,
    timezone: row.timezone,
    contact: {
      email: row.contact_email,
      ...(row.contact_name ? { name: row.contact_name } : {}),
      ...(row.contact_phone ? { phone: row.contact_phone } : {}),
    },
    ...(row.note ? { note: row.note } : {}),
    brief: row.brief as unknown as Brief,
    estimate: (row.estimate as unknown as Estimate | null) ?? null,
  };
}

async function listSupabaseBookings() {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingBookingsTable(error)) return null;
    throw error;
  }

  return (data as BookingRow[]).map(toBooking);
}

async function createSupabaseBooking(input: BookingInput) {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("bookings")
    .insert({
      date: input.date,
      time: input.time,
      timezone: input.timezone,
      contact_name: input.contact.name ?? null,
      contact_email: input.contact.email,
      contact_phone: input.contact.phone ?? null,
      note: input.note ?? null,
      brief: input.brief as unknown as Json,
      estimate: input.estimate as unknown as Json | null,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("SLOT_TAKEN");
    if (isMissingBookingsTable(error)) return null;
    throw error;
  }

  return toBooking(data as BookingRow);
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(BOOKINGS_FILE);
  } catch {
    await fs.writeFile(BOOKINGS_FILE, "[]\n", "utf8");
  }
}

async function readBookings(): Promise<Booking[]> {
  await ensureStore();
  const raw = await fs.readFile(BOOKINGS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Booking[]) : [];
  } catch {
    return [];
  }
}

async function writeBookings(bookings: Booking[]) {
  await ensureStore();
  await fs.writeFile(BOOKINGS_FILE, `${JSON.stringify(bookings, null, 2)}\n`, "utf8");
}

export async function listBookings(): Promise<Booking[]> {
  const supabaseBookings = await listSupabaseBookings();
  if (supabaseBookings) return supabaseBookings;

  const bookings = await readBookings();
  return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createBooking(input: BookingInput): Promise<Booking> {
  const supabaseBooking = await createSupabaseBooking(input);
  if (supabaseBooking) return supabaseBooking;

  const bookings = await readBookings();
  const taken = bookings.some(
    (booking) => booking.date === input.date && booking.time === input.time
  );

  if (taken) {
    throw new Error("SLOT_TAKEN");
  }

  const booking: Booking = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  await writeBookings(bookings);
  return booking;
}
