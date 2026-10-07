import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { PortalRoleProvider } from "@/features/access/components";
import { PortalLayout } from "@/features/portal";

export default async function PortalRouteLayout({ children }: { children: ReactNode }) {
  const roleHint = (await cookies()).get("user_role")?.value;

  return (
    <PortalRoleProvider roleHint={roleHint}>
      <PortalLayout>{children}</PortalLayout>
    </PortalRoleProvider>
  );
}
