"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccessDenied() {
  const router = useRouter();
  const signOut = async () => {
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };
  return <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground"><section className="w-full max-w-md border border-border p-8"><p className="eyebrow">Maggie admin</p><h1 className="mt-5 font-display text-3xl">Access not granted.</h1><p className="mt-3 text-sm leading-relaxed text-muted">This account does not have an admin profile. Ask the owner for an invitation.</p><button type="button" onClick={signOut} className="mt-7 border border-border px-5 py-2 text-sm hover:border-accent">Sign out</button></section></main>;
}
