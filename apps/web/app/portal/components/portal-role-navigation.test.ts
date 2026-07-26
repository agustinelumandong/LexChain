import { describe, expect, it } from "vitest";
import { getPortalNavigation } from "../lib/portal-dashboard";
import { isPortalRouteActive } from "./portal-role-navigation";

describe("portal navigation", () => {
  it("keeps the complete issuer workspace focused on portal destinations", () => {
    const navigation = getPortalNavigation("issuer");

    expect(navigation.map((group) => group.label)).toEqual([
      "Workspace",
      "Integrity",
      "Office",
      "System Management",
      "Account",
    ]);
    expect(navigation.flatMap((group) => group.items).map((item) => item.href)).not.toContain("/admin");
  });

  it("includes the five system management routes for every issuer", () => {
    const managementItems = getPortalNavigation("issuer").find(
      (group) => group.label === "System Management",
    )?.items;

    expect(managementItems?.map(({ label, href }) => [label, href])).toEqual([
      ["User Accounts", "/portal/users"],
      ["Issuer Invitations", "/portal/issuer-invitations"],
      ["System Reports", "/portal/system-reports"],
      ["Audit Logs", "/portal/audit-logs"],
      ["System Statistics", "/portal/system-statistics"],
    ]);
  });

  it.each([
    ["/portal/dashboard", "Dashboard"],
    ["/portal/documents", "Documents"],
    ["/portal/processing", "Processing Monitor"],
    ["/portal/blockchain-records", "Blockchain Records"],
    ["/portal/categories", "Categories"],
    ["/portal/analytics", "Analytics"],
    ["/portal/reports", "Reports"],
    ["/portal/upload", "Upload Document"],
    ["/portal/office-settings", "Office Settings"],
  ])("marks %s as the active %s destination", (pathname, label) => {
    const item = getPortalNavigation("issuer").flatMap((group) => group.items).find((navigationItem) => navigationItem.label === label);

    expect(item).toBeDefined();
    expect(isPortalRouteActive(pathname, item!)).toBe(true);
  });
});
