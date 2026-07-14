import { describe, expect, it } from "vitest";
import { isAdminRole } from "./admin-role";

describe("admin role routing", () => {
  it("recognizes every legacy admin role used by the proxy", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("super_admin")).toBe(true);
    expect(isAdminRole("superadmin")).toBe(true);
    expect(isAdminRole("owner")).toBe(true);
  });

  it("does not route portal roles to admin", () => {
    expect(isAdminRole("lawyer")).toBe(false);
    expect(isAdminRole("user")).toBe(false);
  });
});
