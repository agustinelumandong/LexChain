import type { PortalUiRole } from "./portal-role";

export type ProtectedPortalFeature = "upload" | "books" | "invitations" | "my-requests";

export function canAccessPortalFeature(role: PortalUiRole, feature: ProtectedPortalFeature): boolean {
  if (feature === "upload" || feature === "books") return role === "issuer";
  return role === "participant";
}
