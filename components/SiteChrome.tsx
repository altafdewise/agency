"use client";

import { usePathname } from "next/navigation";
import { Ambient } from "@/components/Ambient";
import { SiteNav } from "@/components/SiteNav";

export function SiteChrome() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Ambient />
      <SiteNav />
    </>
  );
}
