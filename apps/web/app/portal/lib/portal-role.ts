export type PortalUiRole = "issuer" | "participant" | "unsupported";

export function getPortalUiRole(role?: string): PortalUiRole {
  const normalized = role?.trim().toLowerCase();
  if (normalized === "lawyer") return "issuer";
  if (normalized === "user") return "participant";
  return "unsupported";
}

export function isSupportedPortalUiRole(role: PortalUiRole): boolean {
  return role !== "unsupported";
}

export function getPortalRoleLabel(role?: string): string {
  const uiRole = getPortalUiRole(role);
  if (uiRole === "issuer") return "Document Issuer";
  if (uiRole === "participant") return "Document Participant";
  return "LexChain User";
}
