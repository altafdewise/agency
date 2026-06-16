import { NextResponse } from "next/server";
import { listBookings } from "@/lib/bookings";

export const runtime = "nodejs";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "@ThyMaggie";

export async function POST(req: Request) {
  let password = "";

  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  return NextResponse.json({ bookings: await listBookings() });
}
