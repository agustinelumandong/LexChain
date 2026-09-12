// @vitest-environment jsdom
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getDocumentListActions, getVisibleDocuments } from '@/features/documents/document-library';
import DocumentsPage from '@/features/documents/pages/documents-page';

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[0] === 'portal-documents'
    ? { data: documents, isLoading: false, isError: false }
    : { data: { role: 'document_issuer' }, isLoading: false, isError: false },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const documents = [
  {
    id: 'document-1',
    document_number: 102,
    file_name: 'Lease Agreement.pdf',
    status: 'processing',
    on_chain: true,
    updated_at: '2026-07-13T13:30:00.000Z',
    storage_url: '/mock-documents/lease.pdf',
  },
  {
    id: 'document-2',
    document_number: 101,
    file_name: 'Certificate of Employment.pdf',
    status: 'anchored',
    on_chain: true,
    updated_at: '2026-07-10T09:05:00.000Z',
    storage_url: '/mock-documents/certificate.pdf',
  },
];

afterEach(cleanup);

describe('document library list', () => {
  it('finds documents by title or reference and sorts the matching payload locally', () => {
    expect(getVisibleDocuments(documents, { query: '101', status: 'all', sort: 'newest' }).map((document) => document.id))
      .toEqual(['document-2']);
    expect(getVisibleDocuments(documents, { query: '', status: 'all', sort: 'title' }).map((document) => document.id))
      .toEqual(['document-2', 'document-1']);
  });

  it('filters by status only when the payload includes statuses', () => {
    expect(getVisibleDocuments(documents, { query: '', status: 'processing', sort: 'newest' }).map((document) => document.id))
      .toEqual(['document-1']);
  });

  it('includes both date boundaries and excludes missing dates when filtering', () => {
    const rows = [...documents, { id: 'undated', file_name: 'Undated.pdf' }];
    expect(getVisibleDocuments(rows, { query: '', status: 'all', sort: 'newest', updatedFrom: '2026-07-10', updatedThrough: '2026-07-13' }).map((document) => document.id))
      .toEqual(['document-1', 'document-2']);
    expect(getVisibleDocuments(rows, { query: '', status: 'all', sort: 'newest', updatedFrom: '2026-07-11' }).map((document) => document.id))
      .toEqual(['document-1']);
  });

  it('keeps filters available with no matches and resets search and sorting', () => {
    render(createElement(DocumentsPage));
    fireEvent.click(screen.getByRole('button', { name: 'Newest first' }));
    fireEvent.click(screen.getByRole('button', { name: 'Oldest first' }));
    expect(screen.getAllByRole('row')[1].textContent).toContain('Certificate of Employment.pdf');
    fireEvent.change(screen.getByPlaceholderText('Search documents...'), { target: { value: 'missing' } });
    expect(screen.getByText('No documents match the current filters.')).toBeTruthy();
    fireEvent.click(screen.getByText('More Filters'));
    fireEvent.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getByRole('button', { name: 'Newest first' })).toBeTruthy();
    expect(screen.getByText('Showing 1–2 of 2 documents')).toBeTruthy();
  });

  it('offers review only for issuer documents awaiting OCR review', () => {
    expect(getDocumentListActions('lawyer', { ...documents[0], status: 'AWAITING_REVIEW' }))
      .toEqual(['Open', 'View / Download', 'Review', 'Verify integrity']);
    expect(getDocumentListActions('lawyer', { ...documents[0], status: 'ready_for_review' }))
      .toContain('Review');
    expect(getDocumentListActions('user', { ...documents[0], status: 'AWAITING_REVIEW' }))
      .not.toContain('Review');
    expect(getDocumentListActions('lawyer', { ...documents[0], status: 'processing' }))
      .not.toContain('Review');
  });

  it('offers only supported list actions', () => {
    const actions = getDocumentListActions('lawyer', documents[1]);

    expect(actions).toEqual(['Open', 'View / Download', 'Verify integrity']);
    expect(actions).not.toContain('Delete');
    expect(actions).not.toContain('Finalize');
    expect(actions).not.toContain('Anchor');
    expect(actions).not.toContain('Versions');
    expect(actions).not.toContain('Participants');
  });

  it('does not offer integrity verification to participants for on-chain documents', () => {
    expect(getDocumentListActions('user', documents[1]))
      .toEqual(['Open', 'View / Download']);
  });

  it('states the result count and gives secondary actions accessible names', () => {
    render(createElement(DocumentsPage));

    expect(screen.getByText('Showing 1–2 of 2 documents')).toBeTruthy();
    const leaseRow = within(screen.getByRole('table')).getByRole('row', { name: /Lease Agreement\.pdf/ });
    expect(within(leaseRow).getByRole('link', { name: 'View / Download' })).toBeTruthy();
  });
});
