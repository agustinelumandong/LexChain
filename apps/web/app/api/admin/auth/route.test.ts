import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const credentials = (email: string) => new Request("https://lexchain.test/api/admin/auth", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email, password: "Password123" }),
});

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("legacy admin authentication", () => {
  it.each(["lawyer@example.com", "user@example.com"])(
    "rejects mock non-admin %s and expires any retained admin credential",
    async (email) => {
      const { POST } = await import("./route");

      const response = await POST(credentials(email));

      expect(response.status).toBe(403);
      expect(response.cookies.get("admin_token")?.value).toBe("");
      expect(response.cookies.get("admin_token")?.maxAge).toBe(0);
    },
  );

  it("issues an HttpOnly admin credential to a mock admin", async () => {
    const { POST } = await import("./route");

    const response = await POST(credentials("admin@example.com"));

    expect(response.status).toBe(200);
    expect(response.cookies.get("admin_token")?.value).toBe("mock-admin-token:mock-admin");
    expect(response.cookies.get("admin_token")?.httpOnly).toBe(true);
  });

  it("preserves non-mock admin authentication using the backend profile role", async () => {
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "false");
    vi.stubEnv("API_URL", "https://api.lexchain.test");
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        access_token: "real-admin-token",
        user: { id: "admin-1", email: "admin@lexchain.test" },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ role: "owner" }), { status: 200 })));
    const { POST } = await import("./route");

    const response = await POST(credentials("admin@lexchain.test"));

    expect(response.status).toBe(200);
    expect(response.cookies.get("admin_token")?.value).toBe("real-admin-token");
  });
});
