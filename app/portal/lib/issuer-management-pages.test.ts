import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const portalPages = [
  ["users", "@/features/office/pages/users-page"],
  ["issuer-invitations", "@/features/access/pages/issuer-invitations-page"],
  ["audit-logs", "@/features/office/pages/audit-logs-page"],
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
  it.each(portalPages)("routes %s to its feature view", (route, importPath) => {
    const page = resolve(import.meta.dirname, "..", route, "page.tsx");

    expect(existsSync(page)).toBe(true);
    if (!existsSync(page)) return;

    const source = readFileSync(page, "utf8");
    expect(source).toContain(`export { default } from '${importPath}';`);
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
      resolve(process.cwd(), "features", "admin", view),
      "utf8",
    );

    expect(source).toContain(`href="${target}"`);
    expect(source).not.toContain(`href="${legacyTarget}"`);
  });

  it("uses canonical issuer invitation copy while loading", () => {
    const source = readFileSync(
      resolve(import.meta.dirname, "..", "..", "admin", "invitations-permissions", "loading.tsx"),
      "utf8",
    );

    expect(source).toContain("Issuer Invitations");
    expect(source).toContain("Manage Lawyer invitations");
  });
});
