// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PortalRouteLayout from "./layout";
import type React from 'react';

const roleCookie = vi.hoisted(() => ({ value: undefined as string | undefined }));
const routePathname = vi.hoisted(() => ({ value: '/portal/documents' }));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => name === "user_role" && roleCookie.value
      ? { name, value: roleCookie.value }
      : undefined,
  }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => routePathname.value,
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('next/link', () => ({ default: ({ href, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} onClick={(event) => { event.preventDefault(); onClick?.(event); }} {...props} /> }));

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
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  roleCookie.value = undefined;
  routePathname.value = '/portal/documents';
});

async function renderPortal(role?: string) {
  roleCookie.value = role;
  const layout = await PortalRouteLayout({ children: <p>Portal content</p> });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return { ...render(<QueryClientProvider client={queryClient}>{layout}</QueryClientProvider>), queryClient };
}

describe("portal layout role hint", () => {
  it.each(['/portal/documents', '/portal/documents/doc-123'])(
    'keeps %s inside the viewport-locked document shell',
    async (pathname) => {
      routePathname.value = pathname;
      await renderPortal('lawyer');

      expect(document.querySelector('main')?.className).toContain('h-dvh overflow-hidden');
      expect(document.getElementById('portal-content')?.className).toContain('overflow-y-hidden');
    },
  );

  it('leaves nested document review routes with normal page scrolling', async () => {
    routePathname.value = '/portal/documents/doc-123/verify';
    await renderPortal('lawyer');

    expect(document.querySelector('main')?.className).toContain('min-h-screen');
    expect(document.getElementById('portal-content')?.className).not.toContain('overflow-y-hidden');
  });

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

  it("shows unread-count failures instead of displaying a false zero badge", async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('%2Fdocuments%2F')) return Promise.resolve(Response.json([]));
      if (url.includes('unread-count')) return Promise.resolve(Response.json({}, { status: 503 }));
      if (url.includes('%2Fnotifications%2F')) return Promise.resolve(Response.json({ notifications: [], total: 0 }));
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    await renderPortal('lawyer');

    const notificationsButton = screen.getByRole('button', { name: 'View notifications' });
    await waitFor(() => expect(notificationsButton.getAttribute('aria-describedby')).toBe('notification-count-error'));
    fireEvent.click(notificationsButton);

    expect((await screen.findByRole('alert')).textContent).toContain('Unread count unavailable');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it("opens one shell notification and sends its individual read request", async () => {
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('%2Fdocuments%2F')) return Promise.resolve(Response.json([]));
      if (url.includes('unread-count')) return Promise.resolve(Response.json({ unread: 1 }));
      if (url.includes('%2Fnotifications%2F')) return Promise.resolve(Response.json({ notifications: [{
        id: 'document-ready', title: 'Document ready', body: 'Your record is ready.', type: 'document_recorded',
        event_metadata: { document_id: 'doc-123' }, is_read: false, created_at: '2026-07-20T10:00:00Z',
      }], total: 1 }));
      return Promise.resolve(new Response(null, { status: 204 }));
    });
    await renderPortal('lawyer');

    fireEvent.click(screen.getByRole('button', { name: 'View notifications' }));
    const link = await screen.findByRole('link', { name: /Document ready/ });
    expect(link.getAttribute('href')).toBe('/portal/documents/doc-123');
    fireEvent.click(link);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent('/notifications/document-ready/read')), expect.objectContaining({ method: 'PATCH' })));
    expect(fetchMock).not.toHaveBeenCalledWith(expect.stringContaining(encodeURIComponent('/notifications/read-all')), expect.anything());
  });

  it("polls the shell list and unread count every 15 seconds for supported roles", async () => {
    const { queryClient } = await renderPortal('lawyer');

    expect(queryClient.getQueryCache().find({ queryKey: ['portal-shell-notifications'] })?.observers[0]?.options.refetchInterval).toBe(15_000);
    expect(queryClient.getQueryCache().find({ queryKey: ['portal-notif-count'] })?.observers[0]?.options.refetchInterval).toBe(15_000);
  });

  it("refreshes shared document status every 10 seconds while the portal is open", async () => {
    vi.useFakeTimers();
    const { queryClient } = await renderPortal('lawyer');
    const documentRequests = () => fetchMock.mock.calls.filter(([url]) => String(url).includes('%2Fdocuments%2F')).length;

    await act(async () => { await Promise.resolve(); });
    expect(documentRequests()).toBe(1);
    const documentQuery = queryClient.getQueryCache().find({ queryKey: ['portal-documents'] });
    expect(documentQuery?.observers[0]?.options.refetchInterval).toBe(10_000);
    expect(documentQuery?.observers[0]?.options.refetchOnWindowFocus).toBe('always');

    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });

    expect(documentRequests()).toBe(2);
  });

  it("labels portal pages as simulated when mock mode is enabled", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    await renderPortal("lawyer");

    expect(screen.getByText(/Document processing and blockchain results are simulated/).parentElement?.textContent).toContain("Prototype");
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
