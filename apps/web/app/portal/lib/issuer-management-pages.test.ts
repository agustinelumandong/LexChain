import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const portalPages = [
  ["users", "UsersManagementView", "../../admin/users/users-management-view"],
  ["issuer-invitations", "InvitationsManagementView", "../../admin/invitations-permissions/invitations-management-view"],
  ["system-reports", "GeneratedReportsManagementView", "../../admin/generated-reports/generated-reports-management-view"],
  ["audit-logs", "AuditLogsManagementView", "../../admin/audit-logs/audit-logs-management-view"],
] as const;

const legacyPages = [
  ["users", "/portal/users"],
  ["invitations-permissions", "/portal/issuer-invitations"],
  ["generated-reports", "/portal/system-reports"],
  ["audit-logs", "/portal/audit-logs"],
] as const;

const managementLinks = [
  ["users/users-management-view.tsx", "/portal/issuer-invitations", "/admin/invitations-permissions"],
  ["invitations-permissions/invitations-management-view.tsx", "/portal/audit-logs", "/admin/audit-logs"],
] as const;

describe("Issuer management portal pages", () => {
  it.each(portalPages)("reuses the existing %s management view", (route, view, importPath) => {
    const page = resolve(import.meta.dirname, "..", route, "page.tsx");

    expect(existsSync(page)).toBe(true);
    if (!existsSync(page)) return;

    const source = readFileSync(page, "utf8");
    expect(source).toContain(`import { ${view} } from "${importPath}";`);
    expect(source).not.toContain(`function ${view}(`);
  });

  it.each(legacyPages)("redirects legacy /admin/%s", (route, target) => {
    const source = readFileSync(
      resolve(import.meta.dirname, "..", "..", "admin", route, "page.tsx"),
      "utf8",
    );

    expect(source).toContain('import { redirect } from "next/navigation";');
    expect(source).toContain(`redirect("${target}");`);
  });

  it.each(managementLinks)("keeps %s navigation inside the portal", (view, target, legacyTarget) => {
    const source = readFileSync(
      resolve(import.meta.dirname, "..", "..", "admin", view),
      "utf8",
    );

    expect(source).toContain(`href="${target}"`);
    expect(source).not.toContain(`href="${legacyTarget}"`);
  });
});
