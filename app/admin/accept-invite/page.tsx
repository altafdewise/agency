"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, LockKeyhole } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "done" | "error";

export default function AcceptInvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Checking your invitation...");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    async function acceptInvite() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        window.history.replaceState(null, "", "/admin/accept-invite");

        if (error) {
          setStatus("error");
          setMessage("This invite link could not be opened. Ask Maggie to send a fresh invite.");
          return;
        }

        setStatus("ready");
        setMessage("Create a password to finish joining the team.");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setStatus("ready");
        setMessage("Create a password to finish joining the team.");
        return;
      }

      setStatus("error");
      setMessage("This invite link is missing or expired. Ask Maggie to send a fresh invite.");
    }

    acceptInvite();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setSaving(true);
    const { error } = await createSupabaseBrowserClient().auth.updateUser({
      password,
    });
    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setStatus("done");
    setMessage("You're in. Taking you to admin...");
    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="grid min-h-[100dvh] place-items-center px-6 py-16">
      <section className="w-full max-w-md rounded-lg border border-border bg-[#141414]/78 p-6 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.95)] backdrop-blur">
        <p className="eyebrow">Maggie admin</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-none tracking-tightest text-foreground">
          accept invite.
        </h1>

        <p className="mt-5 text-sm font-light leading-relaxed text-muted">
          {message}
        </p>

        {status === "checking" && (
          <div className="mt-8 flex items-center gap-3 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Opening invite
          </div>
        )}

        {status === "ready" && (
          <form onSubmit={submit} className="mt-10 space-y-7">
            <div>
              <label htmlFor="invite-password" className="eyebrow mb-3 block">
                Password
              </label>
              <TextInput
                id="invite-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="8+ characters"
                required
              />
            </div>
            <div>
              <label htmlFor="invite-confirm-password" className="eyebrow mb-3 block">
                Confirm password
              </label>
              <TextInput
                id="invite-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="repeat password"
                required
              />
            </div>
            <Button className="w-full" size="lg" type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )}
              {saving ? "saving" : "join workspace"}
            </Button>
          </form>
        )}

        {status === "done" && (
          <div className="mt-8 flex items-center gap-3 text-sm text-foreground">
            <Check className="h-4 w-4 text-accent" />
            Access ready
          </div>
        )}

        {status === "error" && (
          <LinkButton href="/admin/login" variant="ghost" className="mt-8">
            go to login
          </LinkButton>
        )}
      </section>
    </main>
  );
}
