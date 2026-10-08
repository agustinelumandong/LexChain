import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

function request(cookie?: string, body: unknown = { is_active: false }) {
  return new Request("https://lexchain.test/api/admin/users/user-1/active", {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/admin/users/[id]/active", () => {
  it("requires the admin session before forwarding the status change", async () => {
    vi.stubEnv("API_URL", "https://api.lexchain.test");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { PATCH } = await import("./route");

    const response = await PATCH(request(), { params: Promise.resolve({ id: "user-1" }) });

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the requested state and returns the backend account", async () => {
    vi.stubEnv("API_URL", "https://api.lexchain.test");
    const account = { id: "user-1", is_active: false };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(account), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { PATCH } = await import("./route");

    const response = await PATCH(request("issuer_token=admin-token"), { params: Promise.resolve({ id: "user-1" }) });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(account);
    expect(fetchMock).toHaveBeenCalledWith("https://api.lexchain.test/admin/users/user-1/active", expect.objectContaining({
      method: "PATCH",
      headers: expect.objectContaining({ Authorization: "Bearer admin-token", "Content-Type": "application/json" }),
      body: JSON.stringify({ is_active: false }),
    }));
  });

  it("preserves documented backend constraint errors", async () => {
    vi.stubEnv("API_URL", "https://api.lexchain.test");
    const error = { detail: "You cannot deactivate the last active lawyer." };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(error), { status: 400 })));
    const { PATCH } = await import("./route");

    const response = await PATCH(request("issuer_token=admin-token"), { params: Promise.resolve({ id: "user-1" }) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(error);
  });
});
