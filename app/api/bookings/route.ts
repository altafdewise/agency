import { NextResponse } from "next/server";
import type { Brief, Estimate } from "@/lib/brief";
import { createBooking } from "@/lib/bookings";
import { sendBookingEmails } from "@/lib/email";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_ZONE = "Asia/Kolkata";
const TIME_SLOTS = [
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

type BookingBody = {
  date?: unknown;
  time?: unknown;
  timezone?: unknown;
  contact?: unknown;
  note?: unknown;
  brief?: unknown;
  estimate?: unknown;
};

function getKolkataNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    date: `${value("year")}-${value("month")}-${value("day")}`,
    time: `${value("hour")}:${value("minute")}`,
  };
}

function invalid(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: BookingBody;

  try {
    body = (await req.json()) as BookingBody;
  } catch {
    return invalid("Invalid request body.");
  }

  const date = typeof body.date === "string" ? body.date : "";
  const time = typeof body.time === "string" ? body.time : "";
  const timezone =
    typeof body.timezone === "string" && body.timezone.trim()
      ? body.timezone.trim()
      : TIME_ZONE;
  const note =
    typeof body.note === "string" && body.note.trim()
      ? body.note.trim().slice(0, 500)
      : undefined;

  if (!DATE_RE.test(date)) return invalid("Choose a valid date.");
  if (!TIME_SLOTS.includes(time)) {
    return invalid("Choose a time between 2 PM and 6 PM.");
  }

  const now = getKolkataNow();
  if (date < now.date || (date === now.date && time <= now.time)) {
    return invalid("Choose an upcoming call slot.");
  }

  const contact =
    body.contact && typeof body.contact === "object"
      ? (body.contact as Record<string, unknown>)
      : {};
  const email = typeof contact.email === "string" ? contact.email.trim() : "";
  const name = typeof contact.name === "string" ? contact.name.trim() : "";
  const phone = typeof contact.phone === "string" ? contact.phone.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return invalid("Add a valid email for the call booking.");
  }

  const brief = body.brief as Brief | undefined;
  if (!brief || typeof brief !== "object") {
    return invalid("Missing project brief.");
  }

  try {
    const booking = await createBooking({
      date,
      time,
      timezone,
      contact: {
        email,
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
      },
      ...(note ? { note } : {}),
      brief,
      estimate: (body.estimate as Estimate | null | undefined) ?? null,
    });

    try {
      await sendBookingEmails(booking);
    } catch (emailError) {
      console.error("[bookings] booked call but email failed:", emailError);
    }

    return NextResponse.json({ booking });
  } catch (error) {
    if ((error as Error).message === "SLOT_TAKEN") {
      return invalid("That slot is already booked. Choose another time.", 409);
    }

    console.error("[bookings] failed to create booking:", error);
    return invalid("Could not book that call right now.", 500);
  }
}
