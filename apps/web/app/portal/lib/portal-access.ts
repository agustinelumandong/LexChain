import type { PortalUiRole } from "./portal-role";

export type ProtectedPortalFeature = "upload" | "books" | "categories" | "invitations" | "my-requests";

export function canAccessPortalFeature(role: PortalUiRole, feature: ProtectedPortalFeature): boolean {
  if (feature === "upload" || feature === "books" || feature === "categories") return role === "lawyer";
  return role === "user";
}
