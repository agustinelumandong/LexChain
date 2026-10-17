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

describe('document ownership directory', () => {
  it.each(['document_issuer', 'document_participant'])('defaults each role to its ownership tab and scopes results and summaries (%s)', async (role) => {
    const rows = [documentFixture('Owned Z', true), documentFixture('Owned A', true, 'SIGNED'), documentFixture('Shared only', false, 'PREPARING')];
    setupFetch(undefined, Response.json(rows), role);
    renderPage();
    const isLawyer = role === 'document_issuer';
    const ownedTab = await screen.findByRole('tab', { name: 'My documents (2)' });
    const sharedTab = screen.getByRole('tab', { name: 'Shared with me (1)' });
    await waitFor(() => expect((isLawyer ? ownedTab : sharedTab).getAttribute('aria-selected')).toBe('true'));
    expect(within(metric('Total Documents')).getByText(isLawyer ? '2' : '1')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Create document draft' }) !== null).toBe(isLawyer);
    fireEvent.click(ownedTab);
    expect(screen.queryByText('Shared only.pdf')).toBeNull();
    expect(within(metric('Finalized')).getByText('1')).toBeTruthy();
    const distribution = screen.getByRole('heading', { name: 'Status Distribution' }).closest('article')!;
    expect(within(distribution).getByText('Signed')).toBeTruthy();
    expect(within(distribution).queryByText('Preparing')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Newest first' }));
    fireEvent.click(screen.getByRole('button', { name: 'Name A\u2013Z' }));
    expect(within(screen.getByRole('table')).getAllByRole('row')[1].textContent).toContain('Owned A.pdf');
    const recent = screen.getByRole('heading', { name: 'Recently Created' }).closest('article')!;
    expect(within(recent).queryByText('Shared only.pdf')).toBeNull();
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('button', { name: 'All Lifecycles' }));
    expect(screen.queryByRole('button', { name: 'Preparing' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Signed' }));
    expect(within(screen.getByRole('table')).queryByText('Owned Z.pdf')).toBeNull();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search documents' }), { target: { value: 'Shared' } });
    expect(screen.getByText('No matching documents in My documents')).toBeTruthy();
    expect(within(metric('Total Documents')).getByText('2')).toBeTruthy();
    expect(ownedTab.textContent).toBe('My documents (2)');
    fireEvent.click(sharedTab);
    expect(screen.getByText('No matching documents in Shared with me')).toBeTruthy();
    expect(within(metric('Total Documents')).getByText('1')).toBeTruthy();
  });

  it('resets page on tab change and shares paginated results across layouts', async () => {
    const rows = [true, false].flatMap((isOwner) => Array.from({ length: 7 }, (_, index) => documentFixture(`${isOwner ? 'Owned' : 'Shared'} match ${index}`, isOwner)));
    setupFetch(undefined, Response.json(rows));
    renderPage();
    await screen.findByRole('tab', { name: 'My documents (7)' });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search documents' }), { target: { value: 'match' } });
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('button', { name: 'All Lifecycles' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalized' }));
    expect(screen.queryByText('Owned match 6.pdf')).toBeNull();
    expect(screen.getAllByText('Owned match 0.pdf')).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByText('Showing 6–7 of 7 documents')).toBeTruthy();
    expect(within(screen.getByRole('table')).queryByText('Owned match 0.pdf')).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Shared with me (7)' }));
    expect(screen.getByText('Showing 1–5 of 7 documents')).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'Search documents' }) as HTMLInputElement).value).toBe('match');
    fireEvent.click(screen.getByText(/More Filters/));
    expect(screen.getByRole('button', { name: 'Finalized' })).toBeTruthy();
    expect(screen.queryByText('Shared match 6.pdf')).toBeNull();
    expect(screen.getAllByText('Shared match 0.pdf')).toHaveLength(3);
  });

  it('supports keyboard tab changes and distinguishes an empty ownership partition', async () => {
    setupFetch(undefined, Response.json([documentFixture('Owned only', true)]));
    renderPage();
    const ownedTab = await screen.findByRole('tab', { name: 'My documents (1)' });
    const sharedTab = screen.getByRole('tab', { name: 'Shared with me (0)' });
    ownedTab.focus();
    fireEvent.keyDown(ownedTab, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(sharedTab);
    expect(sharedTab.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByText('No documents in Shared with me yet')).toBeTruthy();
    expect(within(metric('Total Documents')).getByText('0')).toBeTruthy();
    const distribution = screen.getByRole('heading', { name: 'Status Distribution' }).closest('article')!;
    expect(within(distribution).getByText('0')).toBeTruthy();
    fireEvent.keyDown(sharedTab, { key: 'Home' });
    expect(document.activeElement).toBe(ownedTab);
    expect(ownedTab.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(ownedTab, { key: 'End' });
    expect(document.activeElement).toBe(sharedTab);
    fireEvent.keyDown(sharedTab, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(ownedTab);
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
    expect(within(metric('Ready for Review')).getByText('1')).toBeTruthy();
    expect(within(metric('Failed')).getByText('1')).toBeTruthy();
  });
});
