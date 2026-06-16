import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Brief, Estimate } from "@/lib/brief";

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
  const bookings = await readBookings();
  return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createBooking(input: BookingInput): Promise<Booking> {
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
