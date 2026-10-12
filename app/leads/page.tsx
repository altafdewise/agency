import type { Metadata } from "next";
import { LeadsDesk } from "@/components/leads/LeadsDesk";
import { LeadsLogin } from "@/components/leads/LeadsLogin";
import { LeadsTheme } from "@/components/leads/LeadsTheme";
import { hasLeadsSession } from "@/lib/leads-list/auth";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** The outreach desk: passcode first, then the city's call list. */
export default async function LeadsPage() {
  const signedIn = await hasLeadsSession();
  return (
    <LeadsTheme>
      {signedIn ? <LeadsDesk /> : <LeadsLogin />}
    </LeadsTheme>
  );
}
