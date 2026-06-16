"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";
import type { PricingConfigRow, SiteSettingRow } from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const SERVICES = [
  "brand_logo",
  "website",
  "app",
  "design_prototype",
  "ai_integration",
  "content",
  "security",
];

const TIERS = ["simple", "medium", "complex"] as const;

const SETTING_FIELDS = [
  { key: "cal_url", label: "Cal.com URL", placeholder: "https://cal.com/..." },
  { key: "whatsapp_number", label: "WhatsApp number", placeholder: "919999999999" },
  { key: "site_title", label: "Site title", placeholder: "maggie - one studio" },
  { key: "meta_description", label: "Meta description", placeholder: "One studio..." },
  { key: "og_image", label: "OG image URL", placeholder: "/opengraph-image.png" },
];

export function SettingsPanel({
  pricing,
  settings,
}: {
  pricing: PricingConfigRow[];
  settings: SiteSettingRow[];
}) {
  const [rows, setRows] = useState<PricingConfigRow[]>(pricing);
  const [values, setValues] = useState<Record<string, string>>(() => {
    return Object.fromEntries(
      SETTING_FIELDS.map((field) => {
        const value = settings.find((setting) => setting.key === field.key)?.value;
        return [field.key, typeof value === "string" ? value : ""];
      })
    );
  });
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const normalizedRows = useMemo(() => {
    return SERVICES.flatMap((service) =>
      TIERS.map((tier) => {
        return (
          rows.find((row) => row.service_key === service && row.tier === tier) || {
            id: `${service}-${tier}`,
            service_key: service,
            tier,
            price_low: 0,
            price_high: 0,
            label: null,
            updated_at: new Date().toISOString(),
          }
        );
      })
    );
  }, [rows]);

  const setPrice = (
    serviceKey: string,
    tier: PricingConfigRow["tier"],
    field: "price_low" | "price_high",
    value: string
  ) => {
    setRows((current) => {
      const exists = current.some(
        (row) => row.service_key === serviceKey && row.tier === tier
      );
      const nextValue = Number(value || 0);
      if (exists) {
        return current.map((row) =>
          row.service_key === serviceKey && row.tier === tier
            ? { ...row, [field]: nextValue }
            : row
        );
      }
      return [
        ...current,
        {
          id: `${serviceKey}-${tier}`,
          service_key: serviceKey,
          tier,
          price_low: field === "price_low" ? nextValue : 0,
          price_high: field === "price_high" ? nextValue : 0,
          label: null,
          updated_at: new Date().toISOString(),
        },
      ];
    });
  };

  const save = async () => {
    setSaving(true);
    setToast("");
    const supabase = createSupabaseBrowserClient();

    const pricingPayload = normalizedRows.map((row) => ({
      service_key: row.service_key,
      tier: row.tier,
      price_low: Number(row.price_low || 0),
      price_high: Number(row.price_high || 0),
      label: row.label,
    }));

    const { error: pricingError } = await supabase
      .from("pricing_config")
      .upsert(pricingPayload, { onConflict: "service_key,tier" });

    if (pricingError) {
      setSaving(false);
      setToast(pricingError.message);
      return;
    }

    const settingsPayload = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }));
    const { error: settingsError } = await supabase
      .from("site_settings")
      .upsert(settingsPayload, { onConflict: "key" });

    setSaving(false);
    if (settingsError) {
      setToast(settingsError.message);
    } else {
      setToast("Settings saved.");
    }
  };

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-lg border border-border bg-[#141414]/72">
        <div className="border-b border-border p-5">
          <p className="eyebrow">Pricing table</p>
          <p className="mt-2 text-sm text-muted">
            These rows override the estimator's code defaults when Supabase is connected.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[0.64rem] uppercase tracking-[0.2em] text-muted">
              <tr className="border-b border-border">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Low</th>
                <th className="px-4 py-3">High</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {normalizedRows.map((row) => (
                <tr key={`${row.service_key}-${row.tier}`}>
                  <td className="px-4 py-3 text-foreground">{row.service_key}</td>
                  <td className="px-4 py-3 text-muted">{row.tier}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={row.price_low}
                      onChange={(event) =>
                        setPrice(row.service_key, row.tier, "price_low", event.target.value)
                      }
                      className="h-10 w-36 rounded-md border border-border bg-background/40 px-3 outline-none focus:border-accent"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={row.price_high}
                      onChange={(event) =>
                        setPrice(row.service_key, row.tier, "price_high", event.target.value)
                      }
                      className="h-10 w-36 rounded-md border border-border bg-background/40 px-3 outline-none focus:border-accent"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-[#141414]/72 p-5">
        <p className="eyebrow">Contact and SEO</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {SETTING_FIELDS.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className="eyebrow mb-3 block">
                {field.label}
              </label>
              <TextInput
                id={field.key}
                value={values[field.key] || ""}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      {toast && <p className="text-sm text-muted">{toast}</p>}
      <div>
        <Button onClick={save} disabled={saving}>
          {saving ? "saving" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
