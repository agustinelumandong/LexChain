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

  it('shows the backend message when the document list request fails', async () => {
    setupFetch(undefined, Response.json({ message: 'The repository is temporarily unavailable.' }, { status: 503 }));
    renderPage();

    expect(await screen.findByText('The repository is temporarily unavailable.')).toBeTruthy();
  });
});

function documentFixture(id: string, isOwner: boolean, lifecycle = 'FINALIZED', status: string | null = null): DocumentListItem {
  return { id, file_name: `${id}.pdf`, is_owner: isOwner, lifecycle, status, my_role: isOwner ? 'owner' : 'viewer', on_chain: false, created_at: '2026-10-10T00:00:00Z' };
}

function metric(label: string): HTMLElement {
  const card = screen.getAllByText(label).find((element) => element.closest('article')?.querySelector('p') === element)?.closest('article');
  if (!(card instanceof HTMLElement)) throw new Error(`Missing metric: ${label}`);
  return card;
}

describe('document directory', () => {
  it('shows lifecycle and hides processing for pre-finalized list records', async () => {
    setupFetch(undefined, Response.json([
      documentFixture('Draft', true, 'PREPARING', 'FAILED'),
      documentFixture('Signature', true, 'READY_FOR_SIGNATURE', 'PROCESSING'),
      documentFixture('Signed', true, 'SIGNED', 'AWAITING_REVIEW'),
      documentFixture('Review', true, 'FINALIZED', 'AWAITING_REVIEW'),
      { ...documentFixture('Failure', true, 'FINALIZED', 'FAILED'), created_at: '2026-10-11T00:00:00Z' },
    ]));
    renderPage();
    const table = await screen.findByRole('table');
    for (const [name, lifecycle] of [['Draft', 'Preparing'], ['Signature', 'Ready for signature'], ['Signed', 'Signed']]) {
      const row = within(table).getByText(`${name}.pdf`).closest('tr')!;
      expect(within(row).getByText(lifecycle)).toBeTruthy();
      expect(within(row).queryByText(/^(Failed|Processing|Ready for review)$/)).toBeNull();
    }
    expect(within(table).getByText('Ready for review')).toBeTruthy();
    expect(within(table).getByText('Processing failed')).toBeTruthy();
    const recent = screen.getByRole('heading', { name: 'Recently Created' }).closest('article')!;
    expect(within(recent).getByText('Preparing')).toBeTruthy();
    expect(within(recent).queryByText('Preparing · Failed')).toBeNull();
    expect(within(recent).getByText('Finalized · Processing failed')).toBeTruthy();
  });

  it.each(['document_issuer', 'document_participant'])('shows a combined directory for each role (%s)', async (role) => {
    const rows = [documentFixture('Owned Z', true), documentFixture('Owned A', true, 'SIGNED'), documentFixture('Shared only', false, 'PREPARING')];
    setupFetch(undefined, Response.json(rows), role);
    renderPage();
    const isLawyer = role === 'document_issuer';
    const table = await screen.findByRole('table');
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Create document draft' }) !== null).toBe(isLawyer));
    expect(screen.queryByRole('tab')).toBeNull();
    expect(screen.queryByText('My documents (2)')).toBeNull();
    expect(screen.queryByText('Shared with me (1)')).toBeNull();
    expect(within(metric('Total Documents')).getByText('3')).toBeTruthy();
    expect(within(table).getByText('Owned Z.pdf')).toBeTruthy();
    expect(within(table).getByText('Shared only.pdf')).toBeTruthy();
    expect(within(metric('Finalized')).getByText('1')).toBeTruthy();
    const distribution = screen.getByRole('heading', { name: 'Status Distribution' }).closest('article')!;
    expect(within(distribution).getByText('Signed')).toBeTruthy();
    expect(within(distribution).getByText('Preparing')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Newest first' }));
    fireEvent.click(screen.getByRole('button', { name: 'Name A\u2013Z' }));
    expect(within(table).getAllByRole('row')[1].textContent).toContain('Owned A.pdf');
    const recent = screen.getByRole('heading', { name: 'Recently Created' }).closest('article')!;
    expect(within(recent).getByText('Shared only.pdf')).toBeTruthy();
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('button', { name: 'All Lifecycles' }));
    expect(screen.getByRole('button', { name: 'Preparing' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Preparing' }));
    expect(within(table).getByText('Shared only.pdf')).toBeTruthy();
    expect(within(table).queryByText('Owned Z.pdf')).toBeNull();
  });

  it('shows a neutral empty-search message for the combined directory', async () => {
    setupFetch(undefined, Response.json([
      documentFixture('Owned only', true),
    ]));
    renderPage();
    await screen.findByRole('table');
    fireEvent.change(screen.getByRole('textbox', { name: 'Search documents' }), { target: { value: 'missing' } });
    expect(screen.getByText('No matching documents')).toBeTruthy();
  });

  it('paginates the combined results across layouts', async () => {
    const rows = [true, false].flatMap((isOwner) => Array.from({ length: 7 }, (_, index) => documentFixture(`${isOwner ? 'Owned' : 'Shared'} match ${index}`, isOwner)));
    setupFetch(undefined, Response.json(rows));
    renderPage();
    await screen.findByRole('table');
    fireEvent.change(screen.getByRole('textbox', { name: 'Search documents' }), { target: { value: 'match' } });
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('button', { name: 'All Lifecycles' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalized' }));
    expect(screen.queryByText('Owned match 6.pdf')).toBeNull();
    expect(screen.getAllByText('Owned match 0.pdf')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Showing 6–10 of 14 documents')).toBeTruthy();
    expect(within(screen.getByRole('table')).queryByText('Owned match 0.pdf')).toBeNull();
    expect(within(screen.getByRole('table')).getByText('Shared match 0.pdf')).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'Search documents' }) as HTMLInputElement).value).toBe('match');
    fireEvent.click(screen.getByText(/More Filters/));
    expect(screen.getByRole('button', { name: 'Finalized' })).toBeTruthy();
    expect(screen.queryByText('Shared match 6.pdf')).toBeNull();
  });

  it('counts canonical review status only for finalized documents', async () => {
    setupFetch(undefined, Response.json([
      documentFixture('Review', true, 'FINALIZED', 'AWAITING_REVIEW'),
      documentFixture('Failed', true, 'FINALIZED', 'FAILED'),
      documentFixture('Draft review', true, 'PREPARING', 'AWAITING_REVIEW'),
      documentFixture('Signed failure', true, 'SIGNED', 'FAILED'),
      documentFixture('Shared review', false, 'FINALIZED', 'AWAITING_REVIEW'),
    ]));
    renderPage();
    await screen.findByRole('table');
    expect(within(metric('Ready for Review')).getByText('2')).toBeTruthy();
    expect(within(metric('Failed')).getByText('1')).toBeTruthy();
  });
});
