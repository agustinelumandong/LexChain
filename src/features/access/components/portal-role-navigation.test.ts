import { describe, expect, it } from "vitest";
import { getPortalNavigation } from "@/features/portal/portal-dashboard";
import { isPortalRouteActive } from "@/features/access/components/portal-role-navigation";

describe("portal navigation", () => {
  it('does not mark the review queue active on the personal requests page', () => {
    expect(isPortalRouteActive('/portal/requests/my', { label: 'Document Requests', href: '/portal/requests' })).toBe(false);
  });
  it("keeps the complete issuer workspace focused on portal destinations", () => {
    const navigation = getPortalNavigation("lawyer");

    expect(navigation.map((group) => group.label)).toEqual([
      "Workspace",
      "Office",
      "System Management",
      "Account",
    ]);
    expect(navigation.flatMap((group) => group.items).map((item) => item.href)).not.toContain("/admin");
  });

  it("includes the three system management routes for every issuer", () => {
    const managementItems = getPortalNavigation("lawyer").find(
      (group) => group.label === "System Management",
    )?.items;

    expect(managementItems?.map(({ label, href }) => [label, href])).toEqual([
      ["User Accounts", "/portal/users"],
      ["Issuer Invitations", "/portal/issuer-invitations"],
      ["Audit Logs", "/portal/audit-logs"],
    ]);
  });

  it.each([
    ["/portal/dashboard", "Dashboard"],
    ["/portal/documents", "Documents"],
    ["/portal/reports", "Reports"],
    ["/portal/office-settings", "Office Settings"],
  ])("marks %s as the active %s destination", (pathname, label) => {
    const item = getPortalNavigation("lawyer").flatMap((group) => group.items).find((navigationItem) => navigationItem.label === label);

    expect(item).toBeDefined();
    expect(isPortalRouteActive(pathname, item!)).toBe(true);
  });
});
