import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/LoginForm";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  if (!hasSupabaseBrowserConfig()) return <SetupNotice />;
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
