"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics-client";
import { captureAttribution } from "@/lib/attribution-client";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    captureAttribution(); // where this visit came from, for any lead it becomes
    trackPageView(pathname, document.referrer);
  }, [pathname]);

  return null;
}
