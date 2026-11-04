// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DocumentsPage from './documents-page';
import type { DocumentListItem } from '../document-library';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

function setupFetch(openResponse = Response.json({ document_id: 'new-document', file_name: 'Client agreement', lifecycle: 'PREPARING' }, { status: 201 }), documentsResponse: Response = Response.json([]), role = 'lawyer') {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);
    const path = url.searchParams.get('path');
    if (path === '/documents/' && init?.method === 'POST') return openResponse;
    if (path === '/documents/') return documentsResponse;
    if (path === '/users/') return Response.json({ role });
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

    fireEvent.click(await screen.findByRole('button', { name: 'New Document' }));
    fireEvent.click(screen.getByRole('button', { name: /Prepare a document/ }));
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

    fireEvent.click(await screen.findByRole('button', { name: 'New Document' }));
    fireEvent.click(screen.getByRole('button', { name: /Prepare a document/ }));
    const nameField = screen.getByRole('textbox', { name: 'Document name' });
    fireEvent.change(nameField, { target: { value: 'Client agreement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Open document record' }));

    expect(await screen.findByRole('alert')).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'Document name' }) as HTMLInputElement).value).toBe('Client agreement');
    await waitFor(() => expect((screen.getByRole('button', { name: 'Open document record' }) as HTMLButtonElement).disabled).toBe(false));
  });

  it('shows the backend message when the document list request fails', async () => {
    setupFetch(undefined, Response.json({ message: 'The repository is temporarily unavailable.' }, { status: 503 }));
    renderPage();

    expect(await screen.findByText('The repository is temporarily unavailable.')).toBeTruthy();
  });

  it('offers signed PDF filing and explains how to attach to an existing document', async () => {
    setupFetch();
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'New Document' }));
    const dialog = screen.getByRole('dialog', { name: 'New Document' });
    expect(within(dialog).getByRole('link', { name: /File a signed PDF/ }).getAttribute('href')).toBe('/portal/upload');
    expect(within(dialog).getByText(/Open it from your documents to attach its signed PDF/)).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'New Document' })).toBeNull();
  });
});

function documentFixture(id: string, isOwner: boolean, lifecycle = 'FINALIZED', status: string | null = null): DocumentListItem {
  return { id, file_name: `${id}.pdf`, is_owner: isOwner, lifecycle, status, my_role: isOwner ? 'owner' : 'viewer', on_chain: false, created_at: '2026-10-10T00:00:00Z' };
}

describe('document ownership directory', () => {
  it('shows processing for signed records while keeping preparation separate', async () => {
    setupFetch(undefined, Response.json([
      documentFixture('Draft', true, 'PREPARING', 'FAILED'),
      documentFixture('Signature', true, 'READY_FOR_SIGNATURE', 'PROCESSING'),
      documentFixture('Signed', true, 'SIGNED', 'AWAITING_REVIEW'),
      documentFixture('Review', true, 'FINALIZED', 'AWAITING_REVIEW'),
      { ...documentFixture('Failure', true, 'FINALIZED', 'FAILED'), created_at: '2026-10-11T00:00:00Z' },
    ]));
    renderPage();
    const table = await screen.findByRole('table');
    for (const [name, lifecycle] of [['Draft', 'Preparing'], ['Signature', 'Ready for signature']]) {
      const row = within(table).getByText(`${name}.pdf`).closest('tr')!;
      expect(within(row).getByText(lifecycle)).toBeTruthy();
      expect(within(row).queryByText(/^(Failed|Processing|Ready for review)$/)).toBeNull();
    }
    const signedRow = within(table).getByText('Signed.pdf').closest('tr')!;
    expect(within(signedRow).getByText('Signed')).toBeTruthy();
    expect(within(signedRow).getByText('Ready for review')).toBeTruthy();
    expect(within(table).getAllByText('Ready for review')).toHaveLength(2);
    expect(within(table).getByText('Processing failed')).toBeTruthy();
    const distribution = screen.getByRole('heading', { name: 'Status Distribution' }).closest('article')!;
    expect(within(distribution).getByText('Preparing')).toBeTruthy();
    expect(within(distribution).getByText('Ready for review')).toBeTruthy();
    expect(within(distribution).getByText('Processing failed')).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Recently Created' })).toBeNull();
  });

  it.each(['document_issuer', 'document_participant'])('shows all accessible documents without ownership tabs for %s', async (role) => {
    const rows = [documentFixture('Owned Z', true), documentFixture('Owned A', true, 'SIGNED'), documentFixture('Shared only', false, 'PREPARING')];
    setupFetch(undefined, Response.json(rows), role);
    renderPage();
    expect(await screen.findByText('Showing 1–3 of 3 documents')).toBeTruthy();
    expect(screen.queryByRole('tablist', { name: 'Document ownership' })).toBeNull();
    const table = screen.getByRole('table');
    expect(within(table).getByText('Owned A.pdf')).toBeTruthy();
    expect(within(table).getByText('Shared only.pdf')).toBeTruthy();
    const distribution = screen.getByRole('heading', { name: 'Status Distribution' }).closest('article')!;
    expect(within(distribution).getByLabelText('Total documents: 3')).toBeTruthy();
    expect(Boolean(screen.queryByRole('button', { name: 'New Document' }))).toBe(role === 'document_issuer');
  });

  it('filters and sorts the combined client document list', async () => {
    setupFetch(undefined, Response.json([documentFixture('Owned Z', true), documentFixture('Owned A', true, 'SIGNED'), documentFixture('Shared only', false, 'PREPARING')]), 'document_participant');
    renderPage();
    await screen.findByText('Showing 1–3 of 3 documents');
    fireEvent.click(screen.getByRole('combobox', { name: 'Newest first' }));
    fireEvent.click(screen.getByRole('option', { name: 'Name A–Z' }));
    expect(within(screen.getByRole('table')).getAllByRole('row')[1].textContent).toContain('Owned A.pdf');
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('combobox', { name: 'All Lifecycles' }));
    expect(screen.getByRole('option', { name: 'Preparing' })).toBeTruthy();
    fireEvent.click(screen.getByRole('option', { name: 'Signed' }));
    expect(within(screen.getByRole('table')).getByText('Owned A.pdf')).toBeTruthy();
    expect(within(screen.getByRole('table')).queryByText('Shared only.pdf')).toBeNull();
    fireEvent.change(screen.getByRole('textbox', { name: 'Filter by filename or reference' }), { target: { value: 'Shared' } });
    expect(screen.getByText('No matching documents in your documents')).toBeTruthy();
  });

  it('paginates the combined client document list', async () => {
    const rows = [true, false].flatMap((isOwner) => Array.from({ length: 7 }, (_, index) => documentFixture(`${isOwner ? 'Owned' : 'Shared'} match ${index}`, isOwner)));
    setupFetch(undefined, Response.json(rows), 'document_participant');
    renderPage();
    expect(await screen.findByText('Showing 1–5 of 14 documents')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Showing 6–10 of 14 documents')).toBeTruthy();
    fireEvent.change(screen.getByRole('textbox', { name: 'Filter by filename or reference' }), { target: { value: 'Shared' } });
    expect(screen.getByText('Showing 6–7 of 7 documents')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(screen.getByText('Showing 1–5 of 7 documents')).toBeTruthy();
    expect(within(screen.getByRole('table')).getByText('Shared match 0.pdf')).toBeTruthy();
  });
  it('counts processing statuses across all document lifecycle states', async () => {
    setupFetch(undefined, Response.json([
      documentFixture('Review', true, 'FINALIZED', 'AWAITING_REVIEW'),
      documentFixture('Failed', true, 'FINALIZED', 'FAILED'),
      documentFixture('Draft review', true, 'PREPARING', 'AWAITING_REVIEW'),
      documentFixture('Signed failure', true, 'SIGNED', 'FAILED'),
      documentFixture('Shared review', false, 'FINALIZED', 'AWAITING_REVIEW'),
    ]));
    renderPage();
    await screen.findByRole('table');
    const distribution = screen.getByRole('heading', { name: 'Status Distribution' }).closest('article')!;
    expect(within(distribution).getByText('All documents')).toBeTruthy();
    expect(within(distribution).getByText('Ready for review')).toBeTruthy();
    expect(within(distribution).getByText('Processing failed')).toBeTruthy();
    expect(within(distribution).getByText('Failed')).toBeTruthy();
  });

  it('renders clean document directory layout without redundant Document Directory sub-heading (#173)', async () => {
    setupFetch(undefined, Response.json([documentFixture('Agreement', true)]));
    renderPage();

    // Top-level page heading is present
    expect(screen.getByRole('heading', { level: 1, name: 'Documents' })).toBeTruthy();
    // Wait for data to load and table to render
    expect(await screen.findByRole('table')).toBeTruthy();
    // Redundant inner sub-heading is removed
    expect(screen.queryByRole('heading', { name: 'Document Directory' })).toBeNull();
    // Search, filters, and directory table region remain accessible
    expect(screen.getByRole('textbox', { name: 'Filter by filename or reference' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Document directory results' })).toBeTruthy();
  });
});
