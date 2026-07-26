import { describe, expect, it } from "vitest";
import { getRedirectPath } from "./page";

describe("unified login routing", () => {
  it("routes admin accounts to the admin dashboard", () => {
    expect(getRedirectPath({ user: { role: "admin" } })).toBe("/admin/dashboard");
  });

  it("keeps issuer and participant routing unchanged", () => {
    expect(getRedirectPath({ user: { role: "lawyer" } })).toBe("/portal/dashboard");
    expect(getRedirectPath({ user: { role: "user" } })).toBe("/portal/dashboard");
  });

  it("keeps unsupported roles at login", () => {
    expect(getRedirectPath({ user: { role: "staff" } })).toBe("/login");
  });
});
