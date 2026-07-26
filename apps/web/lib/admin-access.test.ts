import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getRedirectUrl } from "next/experimental/testing/server";
import { proxy, SUPER_ADMIN_PORTAL_PATHS } from "../proxy";

function adminRequest(path: string, cookie?: string) {
  return new NextRequest(`https://lexchain.test${path}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe("admin workspace proxy access", () => {
  it("allows an authenticated admin to continue to admin routes", () => {
    const response = proxy(adminRequest(
      "/admin/users",
      "admin_token=admin-token; portal_token=admin-token",
    ));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(getRedirectUrl(response)).toBeNull();
  });

  it("defines the five privileged portal route prefixes", () => {
    expect(SUPER_ADMIN_PORTAL_PATHS).toEqual([
      "/portal/users",
      "/portal/issuer-invitations",
      "/portal/system-reports",
      "/portal/audit-logs",
      "/portal/system-statistics",
    ]);
  });

  it("allows a Super Admin portal session to continue to privileged routes", () => {
    const response = proxy(adminRequest(
      "/portal/users",
      "admin_token=admin-token; portal_token=admin-token",
    ));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(getRedirectUrl(response)).toBeNull();
  });

  it("redirects a standard issuer away from privileged portal routes", () => {
    const response = proxy(adminRequest(
      "/portal/users",
      "portal_token=lawyer-token",
    ));

    expect(getRedirectUrl(response)).toBe("https://lexchain.test/portal/dashboard");
  });

  it("redirects a participant away from privileged portal routes", () => {
    const response = proxy(adminRequest(
      "/portal/system-reports",
      "portal_token=participant-token",
    ));

    expect(getRedirectUrl(response)).toBe("https://lexchain.test/portal/dashboard");
  });

  it("redirects unauthenticated privileged portal requests to login", () => {
    const response = proxy(adminRequest("/portal/users"));

    expect(getRedirectUrl(response)).toBe("https://lexchain.test/login");
  });

  it("keeps ordinary portal routes available to portal sessions", () => {
    const response = proxy(adminRequest(
      "/portal/documents",
      "portal_token=participant-token",
    ));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(getRedirectUrl(response)).toBeNull();
  });

  it("redirects unauthenticated admin requests to unified login", () => {
    const response = proxy(adminRequest("/admin/users"));

    expect(getRedirectUrl(response)).toBe("https://lexchain.test/login");
  });

  it("does not trust a forged admin role from a portal session", () => {
    const response = proxy(adminRequest(
      "/admin/users",
      "portal_token=lawyer-token; user_role=admin",
    ));

    expect(getRedirectUrl(response)).toBe("https://lexchain.test/portal/dashboard");
  });
});
