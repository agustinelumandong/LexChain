import { describe, expect, it } from "vitest";
import { getPortalLoginRedirect, getPortalProfileRequestShortcut, getPortalRoleLabel, getPortalUiRole, isSupportedPortalUiRole } from "./portal-role";

describe("portal UI roles", () => {
  it("maps the canonical Document Issuer role", () => {
    expect(getPortalUiRole("document_issuer")).toBe("issuer");
    expect(getPortalRoleLabel("document_issuer")).toBe("Document Issuer");
  });

  it("maps the canonical Document Participant role", () => {
    expect(getPortalUiRole("document_participant")).toBe("participant");
    expect(getPortalRoleLabel("document_participant")).toBe("Document Participant");
  });

  it("maps backend account roles to the corresponding portal roles", () => {
    for (const issuerRole of ["lawyer", "admin", "super_admin"]) {
      expect(getPortalUiRole(issuerRole)).toBe("issuer");
      expect(getPortalRoleLabel(issuerRole)).toBe("Document Issuer");
    }
    expect(getPortalUiRole("user")).toBe("participant");
    expect(getPortalRoleLabel("user")).toBe("Document Participant");
  });

  it("routes each canonical actor to a useful portal destination", () => {
    expect(getPortalLoginRedirect("document_issuer")).toBe("/portal/dashboard");
    expect(getPortalLoginRedirect("lawyer")).toBe("/portal/dashboard");
    expect(getPortalLoginRedirect("document_participant")).toBe("/portal/documents");
    expect(getPortalLoginRedirect("user")).toBe("/portal/documents");
    expect(getPortalLoginRedirect("staff")).toBeUndefined();
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
