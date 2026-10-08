// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DocumentsPage from './documents-page';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

function setupFetch(openResponse = Response.json({ document_id: 'new-document', file_name: 'Client agreement', lifecycle: 'PREPARING' }, { status: 201 })) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);
    const path = url.searchParams.get('path');
    if (path === '/documents/' && init?.method === 'POST') return openResponse;
    if (path === '/documents/') return Response.json([]);
    if (path === '/users/') return Response.json({ role: 'lawyer' });
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(<QueryClientProvider client={client}><DocumentsPage /></QueryClientProvider>);
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('document directory draft creation', () => {
  it('opens a named PREPARING record and navigates to its document workspace', async () => {
    const fetchMock = setupFetch();
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Create document draft' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Document name' }), { target: { value: 'Client agreement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open document record' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/portal/documents/new-document'));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2F',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        body: JSON.stringify({ file_name: 'Client agreement' }),
      }),
    );
  });

  it('keeps the entered name available when the backend rejects the new record', async () => {
    setupFetch(Response.json({ detail: 'The document name is not available.' }, { status: 503 }));
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Create document draft' }));
    const nameField = screen.getByRole('textbox', { name: 'Document name' });
    fireEvent.change(nameField, { target: { value: 'Client agreement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open document record' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'Document name' }) as HTMLInputElement).value).toBe('Client agreement');
    await waitFor(() => expect((screen.getByRole('button', { name: 'Open document record' }) as HTMLButtonElement).disabled).toBe(false));
  });
});
