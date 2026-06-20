"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  BriefcaseBusiness,
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  Settings,
  Users,
  X,
  Inbox,
} from "lucide-react";
import type { AppRole, ProfileRow } from "@/lib/supabase/database.types";
import { ADMIN_NAV, ROLE_LABELS, canAccess } from "@/lib/admin/permissions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";

const ICONS = {
  dashboard: LayoutDashboard,
  leads: Inbox,
  projects: BriefcaseBusiness,
  blog: BookOpenText,
  analytics: BarChart3,
  feedback: MessageSquareText,
  team: Users,
  settings: Settings,
};

function AdminMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block shrink-0 bg-foreground", className)}
      style={{
        WebkitMaskImage: "url(/Logo/logo-full.png)",
        maskImage: "url(/Logo/logo-full.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        filter: "drop-shadow(0 0 8px rgba(242,238,227,0.18))",
      }}
    />
  );
}

export function AdminShell({
  profile,
  children,
}: {
  profile: ProfileRow;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const role = profile.role as AppRole;

  const links = useMemo(
    () => ADMIN_NAV.filter((item) => canAccess(role, item.section)),
    [role]
  );

  const logout = async () => {
    await createSupabaseBrowserClient().auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="flex flex-col gap-1">
      {links.map((item) => {
        const Icon = ICONS[item.section];
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-background"
                : "text-muted hover:bg-foreground/[0.055] hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-[#111]/95 px-4 py-5 backdrop-blur lg:block">
        <div className="flex h-full flex-col">
          <Link
            href="/"
            className="flex w-fit items-center px-2 text-foreground"
            aria-label="Maggie public site"
          >
            <AdminMark className="h-7 w-5" />
          </Link>

          <div className="mt-8">{nav}</div>

          <div className="mt-auto rounded-lg border border-border bg-foreground/[0.025] p-3">
            <p className="text-sm font-medium text-foreground">
              {profile.name || profile.email}
            </p>
            <p className="mt-1 text-xs text-muted">{ROLE_LABELS[role]}</p>
            <button
              type="button"
              onClick={logout}
              className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted transition-colors hover:text-accent"
            >
              <LogOut className="h-3.5 w-3.5" />
              logout
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border bg-background/88 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted hover:text-foreground lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link
          href="/"
          className="hidden items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground lg:flex"
        >
          <ChevronLeft className="h-4 w-4" />
          public site
        </Link>

        <div className="ml-auto flex items-center gap-3">
          <span className="rounded-full border border-border px-3 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted">
            {ROLE_LABELS[role]}
          </span>
          <span className="hidden text-sm text-foreground sm:inline">
            {profile.name || profile.email}
          </span>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            aria-label="Close admin navigation"
            className="absolute inset-0 bg-background/75 backdrop-blur"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[82vw] max-w-xs border-r border-border bg-[#111] p-5">
            <div className="mb-8 flex items-center justify-between">
              <AdminMark className="h-7 w-5" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-foreground"
                aria-label="Close admin navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}

      <main className="px-4 py-8 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
