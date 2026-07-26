import { describe, expect, it } from "vitest";
import { getDashboardMetrics, getPortalNavigation, getRecentActivityStatus, getStatusOverviewLabel } from "./portal-dashboard";

describe("portal dashboard", () => {
  it("gives issuers the enabled office workspace navigation", () => {
    const navigation = getPortalNavigation("issuer");

    expect(navigation.map((group) => group.label)).toEqual(["Workspace", "Integrity", "Office", "Account"]);
    expect(navigation[0].items.at(-1)?.label).toBe("Upload Document");
  });

  it("only shows participant routes that exist", () => {
    expect(getPortalNavigation("participant").flatMap((group) => group.items).map((item) => item.label)).toEqual([
      "Shared Documents",
      "Invitations",
      "My E-copy Requests",
      "Profile & Security",
    ]);
  });

  it("adds the five management destinations for Super Admin issuers", () => {
    const navigation = getPortalNavigation("issuer", true);

    expect(navigation.filter((group) => group.label === "Super Admin")).toEqual([
      {
        label: "Super Admin",
        items: [
          { label: "User Accounts", href: "/portal/users" },
          { label: "Issuer Invitations", href: "/portal/issuer-invitations" },
          { label: "System Reports", href: "/portal/system-reports" },
          { label: "Audit Logs", href: "/portal/audit-logs" },
          { label: "System Statistics", href: "/portal/system-statistics" },
        ],
      },
    ]);
  });

  it.each(["issuer", "participant"] as const)(
    "does not expose Super Admin destinations to a standard %s",
    (role) => {
      const hrefs = getPortalNavigation(role).flatMap((group) =>
        group.items.map((item) => item.href),
      );

      expect(hrefs).not.toContain("/portal/users");
      expect(hrefs).not.toContain("/portal/issuer-invitations");
      expect(hrefs).not.toContain("/portal/system-reports");
      expect(hrefs).not.toContain("/portal/audit-logs");
      expect(hrefs).not.toContain("/portal/system-statistics");
    },
  );

  it("summarizes an empty document repository without unsupported metrics", () => {
    expect(getDashboardMetrics([])).toEqual([
      ["Total Documents", 0],
      ["Processing", 0],
      ["Ready Documents", 0],
    ]);
  });

  it("summarizes processing, ready, failed, and recorded blockchain states", () => {
    expect(getDashboardMetrics([
      { status: "PROCESSING", on_chain: false },
      { status: "PENDING", on_chain: false },
      { status: "COMPLETED", on_chain: true },
      { status: "ANCHORED", on_chain: false },
      { status: "FAILED", on_chain: false },
    ])).toEqual([
      ["Total Documents", 5],
      ["Processing", 2],
      ["Ready Documents", 2],
      ["On-Chain Records", 1],
    ]);
  });

  it("does not show unavailable roadmap metrics as zero", () => {
    const labels = getDashboardMetrics([{ status: "FAILED" }]).map(([label]) => label);

    expect(labels).not.toContain("Pending Invites");
    expect(labels).not.toContain("Recent Access");
    expect(labels).not.toContain("Integrity Alerts");
  });

  it("uses the mobile completed vocabulary for anchored recent activity", () => {
    expect(getRecentActivityStatus("anchored")).toBe("Completed");
  });

  it("uses the mobile completed vocabulary in the status overview", () => {
    expect(getStatusOverviewLabel("anchored")).toBe("Completed");
  });
});
