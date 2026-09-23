import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole, ProfileRow } from "@/lib/supabase/database.types";
import { ROLE_LABELS } from "@/lib/admin/permissions";

export const runtime = "nodejs";

const ROLES: AppRole[] = ["owner", "project_lead", "editor", "viewer"];
const INVITER_EMAIL = process.env.ADMIN_INVITER_EMAIL || "admin@maggie.agency";
const INVITER_NAME = process.env.ADMIN_INVITER_NAME || "Maggie";

export async function POST(req: Request) {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase service key is missing." },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const requester = profile as Pick<ProfileRow, "role"> | null;
  if (requester?.role !== "owner") {
    return NextResponse.json({ error: "Owner access required." }, { status: 403 });
  }

  let body: {
    email?: unknown;
    name?: unknown;
    role?: unknown;
  };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const role = body.role as AppRole;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !ROLES.includes(role)) {
    return NextResponse.json({ error: "Enter a valid email and role." }, { status: 400 });
  }

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    return NextResponse.json(
      { error: "This email is already on the team." },
      { status: 409 }
    );
  }

  const origin = new URL(req.url).origin;
  const inviteData = {
    redirectTo: `${origin}/admin/accept-invite`,
    data: {
      name,
      role_label: ROLE_LABELS[role],
      inviter_email: INVITER_EMAIL,
      inviter_name: INVITER_NAME,
    },
  };

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, inviteData);

  if (error && /already.*registered/i.test(error.message)) {
    return NextResponse.json(
      { error: "This email already has an account. Resolve it in Supabase Auth before inviting; the account was not changed." },
      { status: 409 }
    );
  }

  if (error || !data.user) {
    console.error("[admin/team] invite failed:", error);
    return NextResponse.json(
      { error: "Could not send the invite. Please try again." },
      { status: 500 }
    );
  }

  const { data: upserted, error: profileError } = await admin
    .from("profiles")
    .upsert({
      id: data.user.id,
      email,
      name: name || null,
      role,
    })
    .select("*")
    .single();

  if (profileError || !upserted) {
    console.error("[admin/team] profile upsert failed:", profileError);
    return NextResponse.json(
      { error: "The invite was sent, but admin access could not be saved. Please contact the owner." },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: upserted });
}
