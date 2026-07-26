export type PortalUiRole = "issuer" | "participant" | "unsupported";

export type PortalProfileRequestShortcut = {
  label: "Document Requests" | "My E-copy Requests";
  href: "/portal/requests" | "/portal/requests/my";
};

export function getPortalUiRole(role?: string): PortalUiRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "document_issuer") return "issuer";
  if (normalized === "document_participant") return "participant";
  return "unsupported";
}

export function isSupportedPortalUiRole(role: PortalUiRole): boolean {
  return role !== "unsupported";
}

export function getPortalRoleLabel(role?: string): string {
  const uiRole = getPortalUiRole(role);
  if (uiRole === "issuer") return "Document Issuer";
  if (uiRole === "participant") return "Document Participant";
  return "Unsupported role";
}

export function getPortalLoginRedirect(role?: string): "/portal/dashboard" | "/portal/documents" | undefined {
  const uiRole = getPortalUiRole(role);
  if (uiRole === "issuer") return "/portal/dashboard";
  if (uiRole === "participant") return "/portal/documents";
  return undefined;
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
