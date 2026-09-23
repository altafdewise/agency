import { AdminShell } from "@/components/admin/AdminShell";
import { SetupNotice } from "@/components/admin/SetupNotice";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { getAdminSession } from "@/lib/admin/auth";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (session.status === "missing-env") {
    return <SetupNotice />;
  }

  if (session.status === "missing-profile") return <AccessDenied />;

  return <AdminShell profile={session.profile}>{children}</AdminShell>;
}
