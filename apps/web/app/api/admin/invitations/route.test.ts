import { afterEach, describe, expect, it, vi } from "vitest";

function invitationRequest(cookie?: string) {
  return new Request("https://lexchain.test/api/admin/invitations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({ email: "new-issuer@example.com" }),
  });
}

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("POST /api/admin/invitations", () => {
  it("rejects an anonymous request before the mock branch", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");

    const response = await POST(invitationRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Not authenticated." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("denies a participant credential before the mock branch", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");

    const response = await POST(invitationRequest(
      "portal_token=mock-token:mock-document-participant; issuer_token=mock-token:mock-document-participant",
    ));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ message: "Document Issuer access required." });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts only the exact mock issuer credential under the server mock flag", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK_API", "false");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("./route");

    const response = await POST(invitationRequest(
      "portal_token=mock-token:mock-document-issuer; issuer_token=mock-token:mock-document-issuer",
    ));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ message: "Mock invitation accepted." });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
