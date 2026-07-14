import { describe, expect, it } from "vitest";
import { getPortalRoleLabel, getPortalUiRole, isSupportedPortalUiRole } from "./portal-role";

describe("portal UI roles", () => {
  it("maps backend lawyer copy to Document Issuer", () => {
    expect(getPortalUiRole("lawyer")).toBe("issuer");
    expect(getPortalRoleLabel("lawyer")).toBe("Document Issuer");
  });

  it("maps backend user copy to Document Participant", () => {
    expect(getPortalUiRole("user")).toBe("participant");
    expect(getPortalRoleLabel("user")).toBe("Document Participant");
  });

  it("keeps unrecognized roles out of restricted UI", () => {
    const uiRole = getPortalUiRole("staff");

    expect(uiRole).toBe("unsupported");
    expect(isSupportedPortalUiRole(uiRole)).toBe(false);
  });
});
