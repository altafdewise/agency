"use client";

import { useEffect } from "react";

/** /leads is a light working tool, not part of the dark public site. */
export function LeadsTheme({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("leads-theme");
    return () => document.body.classList.remove("leads-theme");
  }, []);
  return <div className="leads min-h-[100dvh]">{children}</div>;
}
