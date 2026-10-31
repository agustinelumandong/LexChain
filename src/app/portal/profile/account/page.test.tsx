// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readGoogleDraftReturnContext, saveGoogleDraftReturnContext } from '@/shared/utils/google-draft-return-context';
import AccountPageRoute from '@/app/portal/profile/account/page';

const { mockReplace, mockRouter } = vi.hoisted(() => {
  const replace = vi.fn();
  return { mockReplace: replace, mockRouter: { replace } };
});
vi.mock('next/navigation', () => ({ useRouter: () => mockRouter }));

const profile = {
  email: 'lawyer@example.test',
  f_name: 'Alex',
  l_name: 'Lawyer',
  avatar: 'icon1',
  role: 'lawyer',
};

function setupFetch({
  connection = { connected: false },
  connectResponse = Response.json({ authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth?state=test-state' }),
}: {
  connection?: { connected: boolean; google_email?: string | null; connected_at?: string | null };
  connectResponse?: Response;
} = {}) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);
    const path = url.searchParams.get('path');
    if (path === '/users/') return Response.json(profile);
    if (path === '/google/connection') return Response.json(connection);
    if (path === '/google/connect' && init?.method === 'POST') return connectResponse;
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

async function renderPage(searchParams: Record<string, string> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const page = await AccountPageRoute({ searchParams: Promise.resolve(searchParams) });
  render(<QueryClientProvider client={client}>{page}</QueryClientProvider>);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  sessionStorage.clear();
});

describe('Google connection settings screen', () => {
  it('shows a disconnected state and obtains the backend authorization link', async () => {
    const fetchMock = setupFetch();
    await renderPage();

    expect(await screen.findByText('Not connected')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Connect Google' }));

    const link = await screen.findByRole('link', { name: 'Continue to Google' });
    expect(screen.getByText("On Google's screen, tick the Google Drive permission.")).toBeTruthy();
    expect(screen.getByText("On Google's screen, tick the Google Drive permission.").compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://accounts.google.com/o/oauth2/v2/auth?state=test-state');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fgoogle%2Fconnect',
      expect.objectContaining({ method: 'POST', credentials: 'same-origin' }),
    );
  });

  it('shows the connected state after the backend callback returns successfully', async () => {
    setupFetch({ connection: { connected: true, google_email: 'lawyer@gmail.com' } });
    await renderPage({ google: 'connected' });

    expect(await screen.findByText('Google connected successfully.')).toBeTruthy();
    expect(screen.getByText('Connected')).toBeTruthy();
    expect(screen.getByText('lawyer@gmail.com')).toBeTruthy();
  });

  it('shows cancellation separately and leaves the connection retryable', async () => {
    setupFetch();
    await renderPage({ google: 'error', message: 'access_denied' });

    expect(await screen.findByText('Google connection was cancelled. You can try again.')).toBeTruthy();
    expect(await screen.findByText('Not connected')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Connect Google' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('shows callback failure without claiming the account is connected', async () => {
    setupFetch();
    await renderPage({ google: 'error', message: 'server_error' });

    expect(await screen.findByText('Google connection failed. Please try again.')).toBeTruthy();
    expect(await screen.findByText('Not connected')).toBeTruthy();
  });

  it('shows a retryable error when the backend cannot start the connection', async () => {
    setupFetch({ connectResponse: Response.json({ detail: 'Google is unavailable' }, { status: 502 }) });
    await renderPage();
    await screen.findByText('Not connected');
    fireEvent.click(screen.getByRole('button', { name: 'Connect Google' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Could not start Google connection. Try again.');
    await waitFor(() => expect((screen.getByRole('button', { name: 'Connect Google' }) as HTMLButtonElement).disabled).toBe(false));
  });

  it('does not offer an authorization link returned from a non-Google host', async () => {
    setupFetch({ connectResponse: Response.json({ authorization_url: 'https://attacker.example/authorize' }) });
    await renderPage();
    await screen.findByText('Not connected');
    fireEvent.click(screen.getByRole('button', { name: 'Connect Google' }));

    expect((await screen.findByRole('alert')).textContent).toContain('invalid Google authorization URL');
    expect(screen.queryByRole('link', { name: 'Continue to Google' })).toBeNull();
    expect((screen.getByRole('button', { name: 'Connect Google' }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('keeps connection status errors distinct and lets the user retry the status check', async () => {
    let statusCalls = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input), window.location.origin);
      const path = url.searchParams.get('path');
      if (path === '/users/') return Response.json(profile);
      if (path === '/google/connection') {
        statusCalls += 1;
        return statusCalls === 1
          ? Response.json({ message: 'Unavailable' }, { status: 503 })
          : Response.json({ connected: false });
      }
      if (path === '/google/connect' && init?.method === 'POST') return Response.json({ authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth?state=test-state' });
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    renderPage();

    expect(await screen.findByText('Unable to check Google connection.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry status check' }));
    expect(await screen.findByText('Not connected')).toBeTruthy();
    expect(statusCalls).toBe(2);
  });

  it('returns a document-origin callback only after connection status is confirmed', async () => {
    saveGoogleDraftReturnContext({ documentId: 'doc-101', source: 'template', picked: { id: 'file-8', name: 'Template' } });
    setupFetch({ connection: { connected: true } });
    await renderPage({ google: 'connected' });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/portal/documents/doc-101'));
    expect(readGoogleDraftReturnContext()?.source).toBe('template');
  });

  it('keeps an unconfirmed connected callback on the account page', async () => {
    saveGoogleDraftReturnContext({ documentId: 'doc-101', source: 'blank', picked: null });
    setupFetch();
    await renderPage({ google: 'connected' });

    expect(await screen.findByText('Google returned to LexChain, but the connection could not be confirmed. Please retry.')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(readGoogleDraftReturnContext()).toBeNull();
  });

  it('keeps callback error feedback on the account page and clears document return context', async () => {
    saveGoogleDraftReturnContext({ documentId: 'doc-101', source: 'existing', picked: { id: 'file-8', name: 'Existing Doc' } });
    setupFetch();
    await renderPage({ google: 'error', message: 'access_denied' });

    expect(await screen.findByText('Google connection was cancelled. You can try again.')).toBeTruthy();
    expect(readGoogleDraftReturnContext()).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('clears obsolete document context for account-originated connection', async () => {
    saveGoogleDraftReturnContext({ documentId: 'doc-101', source: 'blank', picked: null });
    setupFetch();
    await renderPage();

    expect(await screen.findByText('Not connected')).toBeTruthy();
    await waitFor(() => expect(readGoogleDraftReturnContext()).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: 'Connect Google' }));
    expect(await screen.findByRole('link', { name: 'Continue to Google' })).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('keeps document context when the document flow opens account settings', async () => {
    const context = { documentId: 'doc-101', source: 'template' as const, picked: { id: 'file-8', name: 'Template' } };
    saveGoogleDraftReturnContext(context);
    setupFetch();
    await renderPage({ google_draft_return: '1' });

    expect(await screen.findByText('Not connected')).toBeTruthy();
    expect(readGoogleDraftReturnContext()).toEqual(context);
    fireEvent.click(screen.getByRole('button', { name: 'Connect Google' }));
    expect(await screen.findByRole('link', { name: 'Continue to Google' })).toBeTruthy();
    expect(readGoogleDraftReturnContext()).toEqual(context);
  });
});
