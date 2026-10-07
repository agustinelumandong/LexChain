// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PortalRouteLayout from "./layout";

const roleCookie = vi.hoisted(() => ({ value: undefined as string | undefined }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => name === "user_role" && roleCookie.value
      ? { name, value: roleCookie.value }
      : undefined,
  }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/documents",
  useRouter: () => ({ push: vi.fn() }),
}));

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("%2Fdocuments%2F")) return Promise.resolve(Response.json([]));
    if (url.includes("unread-count")) return Promise.resolve(Response.json({ unread: 0 }));
    if (url.includes("%2Fnotifications%2F")) return Promise.resolve(Response.json({ notifications: [] }));
    return Promise.resolve(new Response(null, { status: 404 }));
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  roleCookie.value = undefined;
});

async function renderPortal(role?: string) {
  roleCookie.value = role;
  const layout = await PortalRouteLayout({ children: <p>Portal content</p> });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{layout}</QueryClientProvider>);
}

describe("portal layout role hint", () => {
  it("renders lawyer navigation and Books without a successful profile request", async () => {
    await renderPortal("lawyer");

    expect(screen.getByText("Portal content")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "Books" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Lawyer")).toBeTruthy();
    expect(screen.queryByText("undefined undefined")).toBeNull();
    expect(screen.queryByText("...")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("%2Fusers%2F"), expect.anything());
  });

  it("renders participant navigation without lawyer-only Books", async () => {
    await renderPortal("document_participant");

    expect(screen.getAllByRole("link", { name: "My E-copy Requests" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("link", { name: "Books" })).toBeNull();
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining("%2Fusers%2F"), expect.anything());
  });

  it.each([
    ["missing", undefined],
    ["unsupported", "staff"],
    ["issuer alias", "document_issuer"],
    ["admin", "admin"],
    ["super admin", "super_admin"],
  ])(
    "does not expose portal content or Books for a %s role hint",
    async (_label, role) => {
      await renderPortal(role);

      expect(screen.getByRole("heading", { name: "Portal access unavailable" })).toBeTruthy();
      expect(screen.queryByText("Portal content")).toBeNull();
      expect(screen.queryByRole("link", { name: "Books" })).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
