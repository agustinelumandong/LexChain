import { describe, expect, it } from "vitest";
import { getPortalNavigation } from "../lib/portal-dashboard";
import { getPortalRoleLabel } from "../lib/portal-role";
import { isPortalRouteActive } from "./portal-role-navigation";

describe("lawyer portal navigation", () => {
  it("keeps the office workspace focused on enabled portal destinations", () => {
    const navigation = getPortalNavigation("issuer");

    expect(navigation.map((item) => item.label)).toEqual([
      "Dashboard",
      "Documents",
      "Blockchain Records",
      "Categories",
      "Upload Document",
      "Notifications",
      "Profile & Security",
    ]);
    expect(navigation.map((item) => item.href)).not.toContain("/admin");
    expect(getPortalRoleLabel("lawyer")).toBe("Document Issuer · Super User");
  });

  it.each([
    ["/portal/dashboard", "Dashboard"],
    ["/portal/documents", "Documents"],
    ["/portal/blockchain-records", "Blockchain Records"],
    ["/portal/categories", "Categories"],
    ["/portal/upload", "Upload Document"],
  ])("marks %s as the active %s destination", (pathname, label) => {
    const item = getPortalNavigation("issuer").find((navigationItem) => navigationItem.label === label);

    expect(item).toBeDefined();
    expect(isPortalRouteActive(pathname, item!)).toBe(true);
  });
});
