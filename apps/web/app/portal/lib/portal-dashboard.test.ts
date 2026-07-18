import { describe, expect, it } from "vitest";
import { getDashboardMetrics, getPortalNavigation, getRecentActivityStatus, getStatusOverviewLabel } from "./portal-dashboard";

describe("portal dashboard", () => {
  it("gives issuers the enabled office workspace navigation", () => {
    expect(getPortalNavigation("issuer").map((item) => item.label)).toEqual([
      "Dashboard",
      "Documents",
      "Upload Document",
      "Notifications",
      "Profile & Security",
    ]);
  });

  it("only shows participant routes that exist", () => {
    expect(getPortalNavigation("participant").map((item) => item.label)).toEqual([
      "Shared Documents",
      "Invitations",
      "My E-copy Requests",
      "Profile & Security",
    ]);
  });

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
