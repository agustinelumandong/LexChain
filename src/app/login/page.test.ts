import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getRedirectPath } from "@/features/auth/pages/login-page";
import LoginRoute from "./page";

const { getCookie, redirect, isMockMode } = vi.hoisted(() => ({
  getCookie: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`redirect:${path}`); }),
  isMockMode: vi.fn(() => false),
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: getCookie }) }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/lib/mocks/mode", () => ({ isMockMode }));
vi.mock("@/server/api/backend", () => ({ backendUrl: (path: string) => `https://api.example${path}` }));
vi.mock("@/features/auth/pages", () => ({ LoginPage: () => null }));

describe("unified login routing", () => {
  it("routes the issuer to the dashboard and the participant to shared documents", () => {
    expect(getRedirectPath({ user: { role: "document_issuer" } })).toBe("/portal/dashboard");
    expect(getRedirectPath({ user: { role: "document_participant" } })).toBe("/portal/documents");
  });

  it("keeps unsupported roles at login", () => {
    expect(getRedirectPath({ user: { role: "staff" } })).toBe("/login");
  });
});

describe("login session redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isMockMode.mockReturnValue(false);
    getCookie.mockReturnValue({ value: "session-token" });
    vi.stubEnv("API_URL", "https://api.example");
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    ["lawyer", "/portal/dashboard"],
    ["document_participant", "/portal/documents"],
  ])("redirects a validated %s session", async (role, destination) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ role })));
    await expect(LoginRoute()).rejects.toThrow(`redirect:${destination}`);
    expect(fetch).toHaveBeenCalledWith("https://api.example/users/", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer session-token" }),
      cache: "no-store",
    }));
  });

  it("shows login for a rejected session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    expect((await LoginRoute()).type).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("shows login when no session exists", async () => {
    getCookie.mockReturnValue(undefined);
    expect((await LoginRoute()).type).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("shows login when the backend cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("unavailable")));
    expect((await LoginRoute()).type).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it.each([
    ["mock-token:mock-document-issuer", "/portal/dashboard"],
    ["mock-token:mock-document-participant", "/portal/documents"],
  ])("routes a recognized mock session", async (token, destination) => {
    isMockMode.mockReturnValue(true);
    getCookie.mockReturnValue({ value: token });
    await expect(LoginRoute()).rejects.toThrow(`redirect:${destination}`);
  });
});
