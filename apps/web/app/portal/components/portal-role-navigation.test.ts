import { describe, expect, it } from "vitest";
import { getPortalNavigation } from "../lib/portal-dashboard";
import { getPortalRoleLabel } from "../lib/portal-role";
import { isPortalRouteActive } from "./portal-role-navigation";

describe("lawyer portal navigation", () => {
  it("keeps the office workspace focused on enabled portal destinations", () => {
    const navigation = getPortalNavigation("issuer");

    expect(navigation.map((group) => group.label)).toEqual(["Workspace", "Integrity", "Office", "Account"]);
    expect(navigation.flatMap((group) => group.items).map((item) => item.href)).not.toContain("/admin");
    expect(getPortalRoleLabel("lawyer")).toBe("Document Issuer · Super User");
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
