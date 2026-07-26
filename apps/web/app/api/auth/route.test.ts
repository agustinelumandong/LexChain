import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const credentials = (email: string) => new Request("https://lexchain.test/api/auth", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password: "Password123" }),
});

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("USE_MOCK_API", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("unified auth session cookies", () => {
  it("issues an HttpOnly admin credential only for an authenticated admin", async () => {
    const { POST } = await import("./route");

    const response = await POST(credentials("admin@example.com"));

    expect(response.status).toBe(200);
    expect(response.cookies.get("admin_token")?.value).toBe("mock-token:mock-admin");
    expect(response.cookies.get("admin_token")?.httpOnly).toBe(true);
    expect(response.cookies.get("portal_token")?.value).toBe("mock-token:mock-admin");
  });

  it("keeps the portal credential but clears stale admin access for a non-admin login", async () => {
    const { POST } = await import("./route");

    const response = await POST(credentials("lawyer@example.com"));

    expect(response.status).toBe(200);
    expect(response.cookies.get("portal_token")?.value).toBe("mock-token:mock-lawyer");
    expect(response.cookies.get("admin_token")?.value).toBe("");
    expect(response.cookies.get("admin_token")?.maxAge).toBe(0);
  });
});
