import { describe, expect, it } from "vitest";
import { getDashboardMetrics, getIssuerQuickActions, getPortalNavigation, getRecentActivityStatus, getStatusOverviewLabel } from "./portal-dashboard";

describe("portal dashboard", () => {
  it("gives issuers the mobile-aligned navigation", () => {
    expect(getPortalNavigation("issuer").map((item) => item.label)).toEqual([
      "Dashboard",
      "Documents",
      "Books",
      "Document Requests",
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

  it("counts issuer document cards", () => {
    const metrics = getDashboardMetrics("issuer", [
      { status: "PROCESSING", on_chain: false },
      { status: "COMPLETED", on_chain: true },
    ]);

    expect(metrics).toEqual([
      ["Total Documents", 2],
      ["Processing", 1],
      ["On-Chain Records", 1],
      ["Pending Invites", 0],
    ]);
  });

  it("counts pending documents as processing", () => {
    expect(getDashboardMetrics("issuer", [{ status: "PENDING" }])).toContainEqual([
      "Processing",
      1,
    ]);
  });

  it("includes the issuer document-request review quick action", () => {
    expect(getIssuerQuickActions()).toContainEqual(expect.objectContaining({
      label: "Review document requests",
      href: "/portal/requests",
    }));
  });

  it("uses the mobile completed vocabulary for anchored recent activity", () => {
    expect(getRecentActivityStatus("anchored")).toBe("Completed");
  });

  it("uses the mobile completed vocabulary in the status overview", () => {
    expect(getStatusOverviewLabel("anchored")).toBe("Completed");
  });
});
