import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const portalPages = [
  ["users", "@/features/office/pages/server", "PortalUsersPage", "users-page"],
  ["issuer-invitations", "@/features/access/pages/server", "PortalIssuerInvitationsPage", "issuer-invitations-page"],
  ["audit-logs", "@/features/office/pages/server", "PortalAuditLogsPage", "audit-logs-page"],
] as const;

const legacyPages = [
  ["users", "/portal/users"],
  ["invitations-permissions", "/portal/issuer-invitations"],
  ["generated-reports", "/portal/reports"],
  ["audit-logs", "/portal/audit-logs"],
] as const;

const managementLinks = [
  ["users/users-management-view.tsx", "/portal/issuer-invitations", "/admin/invitations-permissions"],
  ["invitations-permissions/invitations-management-view.tsx", "/portal/audit-logs", "/admin/audit-logs"],
] as const;

describe("Issuer management portal pages", () => {
  it.each(portalPages)("routes %s to its feature view", (route, importPath, exportName, implementation) => {
    const page = resolve(import.meta.dirname, "..", route, "page.tsx");

    expect(existsSync(page)).toBe(true);
    if (!existsSync(page)) return;

    const source = readFileSync(page, "utf8");
    expect(source).toContain(`export { ${exportName} as default } from "${importPath}";`);
    const barrel = readFileSync(resolve(process.cwd(), "src", `${importPath.slice(2)}.ts`), "utf8");
    expect(barrel).toContain(`export { default as ${exportName} } from "./${implementation}";`);
  });

  it.each(legacyPages)("redirects legacy /admin/%s", (route, target) => {
    const response = proxy(new NextRequest(`https://lexchain.example/admin/${route}`));
    expect(response.headers.get("location")).toBe(`https://lexchain.example${target}`);
  });

  it.each(managementLinks)("keeps %s navigation inside the portal", (view, target, legacyTarget) => {
    const source = readFileSync(
      resolve(process.cwd(), "src", "features", "admin", view),
      "utf8",
    );

    expect(source).toContain(`href="${target}"`);
    expect(source).not.toContain(`href="${legacyTarget}"`);
  });

  it("uses canonical issuer invitation copy in the management view", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src", "features", "admin", "invitations-permissions", "invitations-management-view.tsx"),
      "utf8",
    );

    expect(source).toContain("Issuer Invitations");
    expect(source).toContain("invitations");
  });
});
