import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AppRole, ProfileRow } from "@/lib/supabase/database.types";
import { ROLE_LABELS } from "@/lib/admin/permissions";

export const runtime = "nodejs";

const ROLES: AppRole[] = ["owner", "project_lead", "editor", "viewer"];
const INVITER_EMAIL = process.env.ADMIN_INVITER_EMAIL || "admin@maggie.agency";
const INVITER_NAME = process.env.ADMIN_INVITER_NAME || "Maggie";

async function findAuthUserByEmail(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  email: string
) {
  const normalized = email.toLowerCase();

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) throw error;

    const user = data.users.find(
      (item) => item.email?.toLowerCase() === normalized
    );
    if (user) return user;
    if (!data.nextPage) return null;
  }

  return null;
}

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

  const body = (await req.json()) as {
    email?: unknown;
    name?: unknown;
    role?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = ROLES.includes(body.role as AppRole) ? (body.role as AppRole) : "viewer";

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
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

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const inviteData = {
    redirectTo: `${origin}/admin/accept-invite`,
    data: {
      name,
      role,
      role_label: ROLE_LABELS[role],
      inviter_email: INVITER_EMAIL,
      inviter_name: INVITER_NAME,
    },
  };

  let { data, error } = await admin.auth.admin.inviteUserByEmail(email, inviteData);

  if (error && /already.*registered/i.test(error.message)) {
    const staleUser = await findAuthUserByEmail(admin, email);

    if (staleUser?.id === user.id) {
      return NextResponse.json(
        { error: "You cannot invite your own admin account." },
        { status: 400 }
      );
    }

    if (staleUser) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(staleUser.id);
      if (deleteError) {
        return NextResponse.json(
          { error: deleteError.message },
          { status: 500 }
        );
      }

      const retry = await admin.auth.admin.inviteUserByEmail(email, inviteData);
      data = retry.data;
      error = retry.error;
    }
  }

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message || "Could not send invite." },
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
    return NextResponse.json(
      { error: profileError?.message || "Invite sent, but profile was not saved." },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: upserted });
}
