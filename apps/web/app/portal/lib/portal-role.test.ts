import { describe, expect, it } from "vitest";
import { getPortalLoginRedirect, getPortalProfileRequestShortcut, getPortalRoleLabel, getPortalUiRole, isPortalSuperAdminRole, isSupportedPortalUiRole } from "./portal-role";

describe("portal UI roles", () => {
  it("maps backend lawyer copy to Document Issuer", () => {
    expect(getPortalUiRole("lawyer")).toBe("issuer");
    expect(getPortalRoleLabel("lawyer")).toBe("Document Issuer · Super User");
  });

  it("maps Super Admin aliases into the Document Issuer actor", () => {
    expect(getPortalUiRole("admin")).toBe("issuer");
    expect(getPortalUiRole("super_admin")).toBe("issuer");
    expect(getPortalRoleLabel("admin")).toBe("Document Issuer · Super Admin");
    expect(isPortalSuperAdminRole("admin")).toBe(true);
    expect(isPortalSuperAdminRole("lawyer")).toBe(false);
  });

  it("routes supported portal accounts to the portal without granting unsupported roles office navigation", () => {
    expect(getPortalLoginRedirect("lawyer")).toBe("/portal/dashboard");
    expect(getPortalLoginRedirect("user")).toBe("/portal/dashboard");
    expect(getPortalLoginRedirect("staff")).toBeUndefined();
  });

  it("maps backend user copy to Document Participant", () => {
    expect(getPortalUiRole("user")).toBe("participant");
    expect(getPortalRoleLabel("user")).toBe("Document Participant");
  });

  it("keeps unrecognized roles out of restricted UI", () => {
    const uiRole = getPortalUiRole("staff");

    expect(uiRole).toBe("unsupported");
    expect(isSupportedPortalUiRole(uiRole)).toBe(false);
    expect(getPortalProfileRequestShortcut(uiRole)).toBeUndefined();
  });

  it("maps profile shortcuts only for supported portal roles", () => {
    expect(getPortalProfileRequestShortcut("issuer")).toEqual({
      label: "Document Requests",
      href: "/portal/requests",
    });
    expect(getPortalProfileRequestShortcut("participant")).toEqual({
      label: "My E-copy Requests",
      href: "/portal/requests/my",
    });
  });
});
