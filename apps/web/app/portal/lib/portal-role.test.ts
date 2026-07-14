import { describe, expect, it } from "vitest";
import { getPortalProfileRequestShortcut, getPortalRoleLabel, getPortalUiRole, isSupportedPortalUiRole } from "./portal-role";

describe("portal UI roles", () => {
  it("maps backend lawyer copy to Document Issuer", () => {
    expect(getPortalUiRole("lawyer")).toBe("issuer");
    expect(getPortalRoleLabel("lawyer")).toBe("Document Issuer");
  });

  it("does not expose Super Admin as product copy", () => {
    expect(getPortalRoleLabel("lawyer")).not.toContain("Admin");
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
