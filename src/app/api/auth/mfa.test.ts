import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const pending = "mfa_token=first-factor-token; mfa_remember=1";
const request = (path: string, body?: unknown, cookie = pending) => {
  const incoming = new NextRequest(`https://lexchain.test/api/auth/mfa/${path}`, {
  method: "POST", headers: { cookie, "content-type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  vi.spyOn(incoming, "clone").mockImplementation(() => { throw new Error("Request must not be cloned to read cookies"); });
  return incoming;
};

beforeEach(() => { vi.resetModules(); vi.stubEnv("API_URL", "https://api.lexchain.test"); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("MFA authentication", () => {
  it("enrolls with the pending token and returns the setup details", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ factor_id: "factor", qr_code: "data:image/svg+xml;base64,abc", secret: "secret", uri: "otpauth://example" }, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./mfa/enroll/route");
    const response = await POST(request("enroll"));
    expect(await response.json()).toMatchObject({ factor_id: "factor", secret: "secret" });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer first-factor-token");
  });

  it("issues portal cookies only after successful MFA verification", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ access_token: "verified-token", expires_in: 900, mfa_required: false, user: { id: "1", email: "lawyer@example.com", role: "lawyer" } })));
    const { POST } = await import("./mfa/verify/route");
    const response = await POST(request("verify", { factor_id: "factor", code: "123456" }));
    expect(response.cookies.get("portal_token")?.value).toBe("verified-token");
    expect(response.cookies.get("portal_token")?.maxAge).toBe(900);
    expect(response.cookies.get("mfa_token")?.maxAge).toBe(0);
  });

  it("preserves the pending session on rejected codes without creating a portal session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ detail: "Invalid code" }, { status: 401 })));
    const { POST } = await import("./mfa/verify/route");
    const response = await POST(request("verify", { factor_id: "factor", code: "123456" }));
    expect(response.status).toBe(401);
    expect(response.cookies.get("portal_token")).toBeUndefined();
    expect(response.cookies.get("mfa_token")).toBeUndefined();
  });

  it("rejects invalid code and missing pending session before forwarding", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./mfa/verify/route");
    expect((await POST(request("verify", { factor_id: "factor", code: "123" }))).status).toBe(400);
    expect((await POST(request("verify", { factor_id: "factor", code: "123456" }, ""))).status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clears and revokes the pending session when sign-in is cancelled", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./mfa/cancel/route");
    const response = await POST(request("cancel"));
    expect(fetchMock.mock.calls[0][0]).toContain("/auth/signout");
    expect(response.cookies.get("mfa_token")?.maxAge).toBe(0);
    expect(response.cookies.get("mfa_remember")?.maxAge).toBe(0);
  });

  it("does not establish a session if verification still requires MFA", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ access_token: "limited", expires_in: 900, mfa_required: true, user: { id: "1", email: "lawyer@example.com", role: "lawyer" } })));
    const { POST } = await import("./mfa/verify/route");
    const response = await POST(request("verify", { factor_id: "factor", code: "123456" }));
    expect(response.status).toBe(502);
    expect(response.cookies.get("portal_token")).toBeUndefined();
  });
});

