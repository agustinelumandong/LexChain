import { describe, expect, it } from "vitest";
import { getPortalLoginRedirect, getPortalRoleLabel, getPortalSessionUiRole, getPortalUiRole, isSupportedPortalUiRole } from "@/features/access/portal-role";

describe("portal UI roles", () => {
  it("maps the canonical Document Issuer role", () => {
    expect(getPortalUiRole("document_issuer")).toBe("lawyer");
    expect(getPortalRoleLabel("document_issuer")).toBe("Lawyer");
  });

  it("maps the canonical Document Participant role", () => {
    expect(getPortalUiRole("document_participant")).toBe("user");
    expect(getPortalRoleLabel("document_participant")).toBe("User");
  });

  it("maps backend account roles to the corresponding portal roles", () => {
    expect(getPortalUiRole("lawyer")).toBe("lawyer");
    expect(getPortalRoleLabel("lawyer")).toBe("Lawyer");
    expect(getPortalUiRole("user")).toBe("user");
    expect(getPortalRoleLabel("user")).toBe("User");
  });

  it("accepts only the exact lawyer role from the sign-in hint", () => {
    expect(getPortalSessionUiRole("lawyer")).toBe("lawyer");
    for (const role of ["admin", "super_admin", "document_issuer", "staff"]) {
      expect(getPortalSessionUiRole(role)).toBe("unsupported");
    }
  });

  it("routes each canonical actor to a useful portal destination", () => {
    expect(getPortalLoginRedirect("document_issuer")).toBe("/portal/dashboard");
    expect(getPortalLoginRedirect("lawyer")).toBe("/portal/dashboard");
    expect(getPortalLoginRedirect("document_participant")).toBe("/portal/documents");
    expect(getPortalLoginRedirect("user")).toBe("/portal/documents");
    expect(getPortalLoginRedirect("staff")).toBeUndefined();
  });

  it("keeps unrecognized roles out of restricted UI", () => {
    for (const role of ["staff", "admin", "super_admin"]) {
      const uiRole = getPortalUiRole(role);
      expect(uiRole).toBe("unsupported");
      expect(getPortalRoleLabel(role)).toBe("Unsupported role");
      expect(getPortalLoginRedirect(role)).toBeUndefined();
      expect(isSupportedPortalUiRole(uiRole)).toBe(false);
    }
  });
});
