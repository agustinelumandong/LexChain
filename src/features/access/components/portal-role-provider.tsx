"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getPortalSessionUiRole, type PortalUiRole } from "@/features/access/portal-role";

const PortalRoleContext = createContext<PortalUiRole>("unsupported");

export function PortalRoleProvider({ roleHint, children }: { roleHint?: string; children: ReactNode }) {
  return (
    <PortalRoleContext.Provider value={getPortalSessionUiRole(roleHint)}>
      {children}
    </PortalRoleContext.Provider>
  );
}

export function usePortalRole(): PortalUiRole {
  return useContext(PortalRoleContext);
}
