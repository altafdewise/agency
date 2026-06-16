import { AdminShell } from "@/components/admin/AdminShell";
import { SetupNotice } from "@/components/admin/SetupNotice";
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

  if (session.status === "missing-profile") {
    return (
      <SetupNotice title="Your admin profile is missing.">
        <p>
          Supabase Auth found `{session.email}`, but there is no matching row in
          `profiles`. Add that profile with the right role, then reload.
        </p>
      </SetupNotice>
    );
  }

  return <AdminShell profile={session.profile}>{children}</AdminShell>;
}
