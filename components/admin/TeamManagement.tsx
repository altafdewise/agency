"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";
import type { AppRole, ProfileRow } from "@/lib/supabase/database.types";
import { ROLE_LABELS } from "@/lib/admin/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { shortDate } from "@/lib/admin/format";

const ROLES: AppRole[] = ["owner", "project_lead", "editor", "viewer"];

export function TeamManagement({ profiles }: { profiles: ProfileRow[] }) {
  const [items, setItems] = useState(profiles);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AppRole>("viewer");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const updateRole = async (profile: ProfileRow, nextRole: AppRole) => {
    const previous = items;
    setItems((current) =>
      current.map((item) =>
        item.id === profile.id ? { ...item, role: nextRole } : item
      )
    );
    const { error } = await createSupabaseBrowserClient()
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", profile.id);
    if (error) {
      setItems(previous);
      setToast(error.message);
    } else {
      setToast("Role updated.");
    }
  };

  const invite = async () => {
    setSaving(true);
    setToast("");
    const response = await fetch("/api/admin/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, role }),
    });
    const data = (await response.json()) as { profile?: ProfileRow; error?: string };
    setSaving(false);
    if (!response.ok || !data.profile) {
      setToast(data.error || "Could not invite member.");
      return;
    }
    setItems((current) => [data.profile!, ...current]);
    setEmail("");
    setName("");
    setRole("viewer");
    setToast("Invite sent.");
  };

  const remove = async (profile: ProfileRow) => {
    if (!window.confirm(`Remove ${profile.email} from the admin team?`)) return;
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== profile.id));
    const response = await fetch(`/api/admin/team/${profile.id}`, {
      method: "DELETE",
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      setItems(previous);
      setToast(data.error || "Could not remove member.");
    } else {
      setToast("Member removed from admin access.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <section className="rounded-lg border border-border bg-[#141414]/72 p-5">
        <p className="eyebrow">Invite</p>
        <div className="mt-6 space-y-6">
          <div>
            <label htmlFor="team-email" className="eyebrow mb-3 block">
              Email
            </label>
            <TextInput
              id="team-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="person@email.com"
            />
          </div>
          <div>
            <label htmlFor="team-name" className="eyebrow mb-3 block">
              Name
            </label>
            <TextInput
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="optional"
            />
          </div>
          <label>
            <span className="eyebrow mb-3 block">Role</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AppRole)}
              className="h-11 w-full rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
            >
              {ROLES.map((item) => (
                <option key={item} value={item}>
                  {ROLE_LABELS[item]}
                </option>
              ))}
            </select>
          </label>
          <Button onClick={invite} disabled={saving || !email.trim()}>
            <Plus className="h-4 w-4" />
            {saving ? "sending" : "Invite"}
          </Button>
        </div>
        {toast && <p className="mt-5 text-sm text-muted">{toast}</p>}
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-[#141414]/72">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_auto] border-b border-border px-4 py-3 text-[0.64rem] uppercase tracking-[0.2em] text-muted max-lg:hidden">
          <span>Member</span>
          <span>Role</span>
          <span>Last active</span>
          <span />
        </div>
        <div className="divide-y divide-border">
          {items.map((profile) => (
            <article
              key={profile.id}
              className="grid gap-4 px-4 py-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto] lg:items-center"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {profile.name || "Unnamed"}
                </p>
                <p className="mt-1 text-xs text-muted">{profile.email}</p>
              </div>
              <select
                value={profile.role}
                onChange={(event) => updateRole(profile, event.target.value as AppRole)}
                className="h-10 rounded-md border border-border bg-background/40 px-3 text-sm outline-none focus:border-accent"
              >
                {ROLES.map((item) => (
                  <option key={item} value={item}>
                    {ROLE_LABELS[item]}
                  </option>
                ))}
              </select>
              <p className="text-sm text-muted">{shortDate(profile.last_active_at)}</p>
              <button
                type="button"
                onClick={() => remove(profile)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-accent"
                aria-label={`Remove ${profile.email}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
