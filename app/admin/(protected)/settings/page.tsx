import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { requireAdminSection } from "@/lib/admin/auth";
import type { PricingConfigRow, SiteSettingRow } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Settings | Admin",
};

export default async function SettingsPage() {
  const session = await requireAdminSection("settings");
  if (session.status !== "ready") return null;

  const [{ data: pricing = [] }, { data: settings = [] }] = await Promise.all([
    session.supabase
      .from("pricing_config")
      .select("*")
      .order("service_key", { ascending: true }),
    session.supabase.from("site_settings").select("*").order("key", { ascending: true }),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Settings"
        title="controls."
        description="Owner-only controls for pricing, contact links, and metadata."
      />
      <SettingsPanel
        pricing={pricing as PricingConfigRow[]}
        settings={settings as SiteSettingRow[]}
      />
    </>
  );
}
