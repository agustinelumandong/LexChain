import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as recover } from "./password-recovery/route";
import { POST as reset } from "./password-reset/route";

vi.mock("@/server/api/backend", () => ({ backendUrl: (path: string) => `https://backend.test${path}` }));

const request = (body: unknown) => new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("password recovery routes", () => {
  it("forwards a valid recovery request and returns a generic response", async () => {
    vi.stubEnv("API_URL", "https://backend.test");
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ message: "accepted" }));
    vi.stubGlobal("fetch", fetchMock);
    const response = await recover(request({ email: " person@example.com " }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ message: "If an account exists for that email, a reset link has been sent." });
    expect(fetchMock).toHaveBeenCalledWith("https://backend.test/auth/password-recovery", expect.objectContaining({ method: "POST", body: JSON.stringify({ email: "person@example.com" }) }));
  });

  it("rejects invalid input without forwarding it", async () => {
    vi.stubEnv("API_URL", "https://backend.test");
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    expect((await recover(request({ email: "invalid" }))).status).toBe(422);
    expect((await reset(request({ token_hash: "x", new_password: "weak" }))).status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the reset payload and retains upstream status", async () => {
    vi.stubEnv("API_URL", "https://backend.test");
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 400 })); vi.stubGlobal("fetch", fetchMock);
    const response = await reset(request({ token_hash: "abc", new_password: "Password1" }));
    expect(response.status).toBe(400);
    expect(fetchMock).toHaveBeenCalledWith("https://backend.test/auth/password-reset", expect.objectContaining({ body: JSON.stringify({ token_hash: "abc", new_password: "Password1" }) }));
  });

  it("returns an unavailable response when the backend cannot be reached", async () => {
    vi.stubEnv("API_URL", "https://backend.test");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect((await reset(request({ token_hash: "abc", new_password: "Password1" }))).status).toBe(502);
  });
});
