export type PortalUiRole = "lawyer" | "user" | "unsupported";

export function getPortalUiRole(role?: string): PortalUiRole {
  const normalized = role?.trim().toLowerCase();
  if (["lawyer", "document_issuer"].includes(normalized ?? "")) return "lawyer";
  if (["user", "document_participant"].includes(normalized ?? "")) return "user";
  return "unsupported";
}

export function getPortalSessionUiRole(roleHint?: string): PortalUiRole {
  const normalized = roleHint?.trim().toLowerCase();
  if (normalized === "lawyer") return "lawyer";
  if (["user", "document_participant"].includes(normalized ?? "")) return "user";
  return "unsupported";
}

export function isSupportedPortalUiRole(role: PortalUiRole): boolean {
  return role !== "unsupported";
}

export function getPortalRoleLabel(role?: string): string {
  const uiRole = getPortalUiRole(role);
  if (uiRole === "lawyer") return "Lawyer";
  if (uiRole === "user") return "User";
  return "Unsupported role";
}

export function getPortalLoginRedirect(role?: string): "/portal/dashboard" | "/portal/documents" | undefined {
  const uiRole = getPortalUiRole(role);
  if (uiRole === "lawyer") return "/portal/dashboard";
  if (uiRole === "user") return "/portal/documents";
  return undefined;
}
