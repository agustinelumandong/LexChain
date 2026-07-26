import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { getRedirectUrl } from "next/experimental/testing/server";
import { proxy } from "../proxy";

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
