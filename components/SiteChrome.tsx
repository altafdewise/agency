"use client";

import { usePathname } from "next/navigation";
import { Ambient } from "@/components/Ambient";
import { SiteNav } from "@/components/SiteNav";

export function SiteChrome() {
  const pathname = usePathname();
  if (pathname === "/portfolio" || pathname.startsWith("/portfolio/")) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/leads")) return <div className="grain" aria-hidden />;
  if (pathname.startsWith("/showcase/")) return null;

  return (
    <>
      <Ambient />
      <SiteNav />
      <div className="grain" aria-hidden />
    </>
  );
}
