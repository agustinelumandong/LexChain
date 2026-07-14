const ADMIN_ROLES = new Set(["admin", "super_admin", "superadmin", "owner"]);

export function isAdminRole(role?: string): boolean {
  return ADMIN_ROLES.has(role?.trim().toLowerCase() ?? "");
}
