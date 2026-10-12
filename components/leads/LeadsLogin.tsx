"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LeadsLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/leads-list/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Couldn't sign in.");
        return;
      }
      router.refresh();
    } catch {
      setError("No connection. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-center px-6 py-16">
      <p className="leads-label">Zev&apos;s Agency</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">Leads desk</h1>
      <p className="mt-2 text-sm text-[color:var(--l-muted)]">For the research and calling team.</p>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <label htmlFor="passcode" className="text-sm font-medium">
          Passcode
        </label>
        <input
          id="passcode"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          className="leads-input"
          required
        />
        {error && (
          <p role="alert" className="text-sm text-[color:var(--l-accent)]">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy || !passcode} className="leads-btn leads-btn-primary mt-2">
          {busy ? "Checking…" : "Open the desk"}
        </button>
      </form>
    </main>
  );
}
