import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("API_URL", "https://api.lexchain.test");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
    access_token: "participant-token",
    expires_in: 3600,
    user: { role: "user" },
  }), { status: 200 })));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("alternate portal authentication", () => {
  it("replaces the portal session without retaining stale admin authority", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://lexchain.test/api/portal/auth", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        cookie: "admin_token=stale-admin; portal_token=old-token; user_role=admin",
      },
      body: JSON.stringify({ email: "user@example.com", password: "Password123" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.cookies.get("portal_token")?.value).toBe("participant-token");
    expect(response.cookies.get("admin_token")?.value).toBe("");
    expect(response.cookies.get("admin_token")?.maxAge).toBe(0);
    expect(response.cookies.get("user_role")?.value).toBe("");
    expect(response.cookies.get("user_role")?.maxAge).toBe(0);
  });
});
