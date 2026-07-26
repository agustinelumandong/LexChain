import { isAdminRole } from "@/lib/admin-role";

export type PortalUiRole = "issuer" | "participant" | "unsupported";

export type PortalProfileRequestShortcut = {
  label: "Document Requests" | "My E-copy Requests";
  href: "/portal/requests" | "/portal/requests/my";
};

export function isPortalSuperAdminRole(role?: string): boolean {
  return isAdminRole(role);
}

export function getPortalUiRole(role?: string): PortalUiRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "lawyer" || isPortalSuperAdminRole(normalized)) return "issuer";
  if (normalized === "user") return "participant";
  return "unsupported";
}

export function isSupportedPortalUiRole(role: PortalUiRole): boolean {
  return role !== "unsupported";
}

export function getPortalRoleLabel(role?: string): string {
  if (isPortalSuperAdminRole(role)) return "Document Issuer · Super Admin";
  const uiRole = getPortalUiRole(role);
  if (uiRole === "issuer") return "Document Issuer · Super User";
  if (uiRole === "participant") return "Document Participant";
  return "LexChain User";
}

export function getPortalLoginRedirect(role?: string): "/portal/dashboard" | undefined {
  return isSupportedPortalUiRole(getPortalUiRole(role)) ? "/portal/dashboard" : undefined;
}

export function getPortalProfileRequestShortcut(
  role: PortalUiRole,
): PortalProfileRequestShortcut | undefined {
  if (role === "issuer") {
    return { label: "Document Requests", href: "/portal/requests" };
  }
  if (role === "participant") {
    return { label: "My E-copy Requests", href: "/portal/requests/my" };
  }
  return undefined;
}
