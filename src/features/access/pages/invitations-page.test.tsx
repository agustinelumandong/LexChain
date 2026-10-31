// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InvitationsPage from '@/features/access/pages/invitations-page';

const { portalFetch, routerReplace } = vi.hoisted(() => ({ portalFetch: vi.fn(), routerReplace: vi.fn() }));

vi.mock('@/shared/api/client', async (importOriginal) => ({ ...await importOriginal<typeof import('@/shared/api/client')>(), portalFetch }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: routerReplace }) }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}><InvitationsPage /></QueryClientProvider>);
}

beforeEach(() => {
  portalFetch.mockReset().mockImplementation((path: string) => Promise.resolve(path === '/users/'
    ? { role: 'user' }
    : { invitations: [{ invitation_id: 'invite-1', document_id: 'doc-1', file_name: 'Agreement.pdf', invited_at: '2026-10-16T00:00:00Z', role: 'viewer' }] }));
  routerReplace.mockReset();
});

describe('client document invitations', () => {
  it('keeps a pending invitation on the page after decline', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Decline' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      `/api/portal/proxy-post?path=${encodeURIComponent('/documents/invitations/invite-1/decline')}`,
      { method: 'POST', credentials: 'same-origin' },
    ));
    expect(routerReplace).not.toHaveBeenCalled();
  });

  it('opens the shared document only after accept succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Accept' }));

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith('/portal/documents/doc-1'));
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/portal/proxy-post?path=${encodeURIComponent('/documents/invitations/invite-1/accept')}`,
      { method: 'POST', credentials: 'same-origin' },
    );
  });
});


it.each(['Accept', 'Decline'])('shows backend feedback after %s fails without losing the invitation', async (action) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ message: 'This invitation has expired.' }, { status: 409 })));
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: action }));
  expect((await screen.findByRole('alert')).textContent).toContain('This invitation has expired.');
  expect(screen.getByText('Agreement.pdf')).toBeTruthy();
  expect(routerReplace).not.toHaveBeenCalled();
  await waitFor(() => expect((screen.getByRole('button', { name: action }) as HTMLButtonElement).disabled).toBe(false));
});
