import { NextResponse } from "next/server";
import { listBookings } from "@/lib/bookings";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("[bookings/admin] ADMIN_PASSWORD env var is not configured");
    return NextResponse.json(
      { error: "Admin booking access is not configured." },
      { status: 403 }
    );
  }

  let password = "";

  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  return NextResponse.json({ bookings: await listBookings() });
}
