// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getVisibleDocuments, type DocumentListItem } from '@/features/documents/document-library';
import DocumentsPage from '@/features/documents/pages/documents-page';

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[0] === 'portal-documents'
    ? { data: documents, ...documentQueryState }
    : { data: { role: 'document_issuer' }, isLoading: false, isError: false },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const documents: DocumentListItem[] = [
  {
    id: 'document-1',
    file_name: 'Lease Agreement.pdf',
    lifecycle: 'SIGNED',
    status: 'processing',
    on_chain: true,
    is_owner: true,
    my_role: 'owner',
    created_at: '2026-07-13T13:30:00.000Z',
    doc_no: 102,
    page_no: 4,
  },
  {
    id: 'document-2',
    file_name: 'Certificate of Employment.pdf',
    lifecycle: 'FINALIZED',
    status: null,
    on_chain: true,
    is_owner: true,
    my_role: 'owner',
    created_at: '2026-07-10T09:05:00.000Z',
    doc_no: 101,
    page_no: 2,
  },
];

let documentQueryState: { isLoading: boolean; isError: boolean; error?: unknown } = { isLoading: false, isError: false };

afterEach(() => {
  cleanup();
  documentQueryState = { isLoading: false, isError: false };
});

describe('document library list', () => {
  it('finds documents by title or reference and sorts the matching payload locally', () => {
    expect(getVisibleDocuments(documents, { query: '101', lifecycle: 'all', sort: 'newest' }).map((document) => document.id))
      .toEqual(['document-2']);
    expect(getVisibleDocuments(documents, { query: '', lifecycle: 'all', sort: 'title' }).map((document) => document.id))
      .toEqual(['document-2', 'document-1']);
  });

  it('filters by lifecycle from the backend list response', () => {
    expect(getVisibleDocuments(documents, { query: '', lifecycle: 'signed', sort: 'newest' }).map((document) => document.id))
      .toEqual(['document-1']);
  });

  it('includes both date boundaries and excludes missing dates when filtering', () => {
    const rows = [...documents, { ...documents[0], id: 'undated', file_name: 'Undated.pdf', created_at: '' }];
    expect(getVisibleDocuments(rows, { query: '', lifecycle: 'all', sort: 'newest', createdFrom: '2026-07-10', createdThrough: '2026-07-13' }).map((document) => document.id))
      .toEqual(['document-1', 'document-2']);
    expect(getVisibleDocuments(rows, { query: '', lifecycle: 'all', sort: 'newest', createdFrom: '2026-07-11' }).map((document) => document.id))
      .toEqual(['document-1']);
  });

  it('keeps filters available with no matches and resets search and sorting', () => {
    render(createElement(DocumentsPage));
    fireEvent.click(screen.getByRole('button', { name: 'Newest first' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oldest first' }));
    expect(screen.getAllByRole('row')[1].textContent).toContain('Certificate of Employment.pdf');
    fireEvent.change(screen.getByPlaceholderText('Search documents...'), { target: { value: 'missing' } });
    expect(screen.getByText('No matching documents')).toBeTruthy();
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByRole('button', { name: 'Newest first' })).toBeTruthy();
    expect(screen.getByText('Showing 1–2 of 2 documents')).toBeTruthy();
  });

  it('clears an unmatched search and restores documents while preserving lifecycle and sorting', () => {
    render(createElement(DocumentsPage));
    fireEvent.click(screen.getByRole('button', { name: 'Newest first' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oldest first' }));
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('button', { name: 'All Lifecycles' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finalized' }));
    const search = screen.getByPlaceholderText('Search documents...') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'missing' } });

    expect(screen.getByText('No matching documents')).toBeTruthy();
    expect(screen.getByText('Showing 0–0 of 0 documents')).toBeTruthy();
    const clear = screen.getByRole('button', { name: 'Clear search' });
    expect(clear.tagName).toBe('BUTTON');
    expect(clear.tabIndex).toBe(0);
    clear.focus();
    expect(document.activeElement).toBe(clear);
    fireEvent.click(clear);

    expect(search.value).toBe('');
    expect(screen.queryByText('No matching documents')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Oldest first' })).toBeTruthy();
    fireEvent.click(screen.getByText(/More Filters/));
    expect(screen.getByRole('button', { name: 'Finalized' })).toBeTruthy();
    const table = within(screen.getByRole('table'));
    expect(table.getByRole('row', { name: /Certificate of Employment/ })).toBeTruthy();
    expect(table.queryByRole('row', { name: /Lease Agreement/ })).toBeNull();
    expect(screen.getByText('Showing 1–1 of 1 documents')).toBeTruthy();
  });

  it('does not treat whitespace as an unmatched search', () => {
    render(createElement(DocumentsPage));
    fireEvent.change(screen.getByPlaceholderText('Search documents...'), { target: { value: '   ' } });
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    expect(screen.getByText('Showing 1–2 of 2 documents')).toBeTruthy();
  });

  it.each(['loading', 'error'] as const)('keeps an active unmatched search distinct from the request %s state', (state) => {
    const view = render(createElement(DocumentsPage));
    fireEvent.change(screen.getByPlaceholderText('Search documents...'), { target: { value: 'missing' } });
    documentQueryState = { isLoading: state === 'loading', isError: state === 'error' };
    view.rerender(createElement(DocumentsPage));

    expect(screen.queryByText('No matching documents')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    if (state === 'loading') {
      expect(screen.getByLabelText('Loading documents')).toBeTruthy();
      expect(screen.queryByRole('alert')).toBeNull();
    } else {
      expect(screen.getByRole('alert').textContent).toContain('Unable to load documents.');
      expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
    }
  });

  it('states the result count and gives secondary actions accessible names', () => {
    render(createElement(DocumentsPage));

    expect(screen.getByText('Showing 1–2 of 2 documents')).toBeTruthy();
    const leaseRow = within(screen.getByRole('table')).getByRole('row', { name: /Lease Agreement\.pdf/ });
    expect(within(leaseRow).getByRole('link', { name: 'Open' })).toBeTruthy();
  });

  it.each([
    [403, 'You do not have permission to view these documents.'],
    [503, 'Unable to load documents.'],
  ])('shows a distinct document-list read failure for HTTP %i', (status, message) => {
    const view = render(createElement(DocumentsPage));
    documentQueryState = {
      isLoading: false,
      isError: true,
      error: Object.assign(new Error('request failed'), { status }),
    };
    view.rerender(createElement(DocumentsPage));

    expect(screen.getByRole('alert').textContent).toContain(message);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('shows backend lifecycle, null processing status, register reference, and no inferred file actions', () => {
    render(createElement(DocumentsPage));

    const finalizedRow = within(screen.getByRole('table')).getByRole('row', { name: /Certificate of Employment/ });
    expect(finalizedRow.textContent).toContain('Finalized');
    expect(finalizedRow.textContent).toContain('No processing status yet');
    expect(finalizedRow.textContent).toContain('Register 101 · page 2');
    expect(within(finalizedRow).getByRole('link', { name: 'Open' })).toBeTruthy();
    expect(within(finalizedRow).queryByRole('link', { name: 'View / Download' })).toBeNull();
    expect(within(finalizedRow).queryByRole('link', { name: 'Verify integrity' })).toBeNull();
  });
});
