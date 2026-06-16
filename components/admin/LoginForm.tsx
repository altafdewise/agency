"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  };

  return (
    <main className="grid min-h-[100dvh] place-items-center px-6 py-16">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-lg border border-border bg-[#141414]/78 p-6 shadow-[0_28px_80px_-48px_rgba(0,0,0,0.95)] backdrop-blur"
      >
        <p className="eyebrow">Admin</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-none tracking-tightest text-foreground">
          sign in.
        </h1>

        <div className="mt-10 space-y-7">
          <div>
            <label htmlFor="admin-email" className="eyebrow mb-3 block">
              Email
            </label>
            <TextInput
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              placeholder="you@maggie.agency"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="eyebrow mb-3 block">
              Password
            </label>
            <TextInput
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="password"
              required
            />
          </div>
        </div>

        {error && <p className="mt-5 text-sm font-light text-accent">{error}</p>}

        <Button className="mt-8 w-full" size="lg" type="submit" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LockKeyhole className="h-4 w-4" />
          )}
          {loading ? "checking" : "enter admin"}
        </Button>
      </form>
    </main>
  );
}
