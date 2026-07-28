// @vitest-environment jsdom
import { createElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getDocumentListActions, getVisibleDocuments } from './document-library';
import DocumentsPage from '../documents/page';

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => queryKey[0] === 'portal-documents'
    ? { data: documents, isLoading: false, isError: false }
    : { data: { role: 'document_issuer' }, isLoading: false, isError: false },
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

  it('offers review only for issuer documents awaiting OCR review', () => {
    expect(getDocumentListActions('issuer', { ...documents[0], status: 'AWAITING_REVIEW' }))
      .toEqual(['Open', 'View / Download', 'Review', 'Verify integrity']);
    expect(getDocumentListActions('issuer', { ...documents[0], status: 'ready_for_review' }))
      .toContain('Review');
    expect(getDocumentListActions('participant', { ...documents[0], status: 'AWAITING_REVIEW' }))
      .not.toContain('Review');
    expect(getDocumentListActions('issuer', { ...documents[0], status: 'processing' }))
      .not.toContain('Review');
  });

  it('offers only supported list actions', () => {
    const actions = getDocumentListActions('issuer', documents[1]);

    expect(actions).toEqual(['Open', 'View / Download', 'Verify integrity']);
    expect(actions).not.toContain('Delete');
    expect(actions).not.toContain('Finalize');
    expect(actions).not.toContain('Anchor');
    expect(actions).not.toContain('Versions');
    expect(actions).not.toContain('Participants');
  });

  it('does not offer integrity verification to participants for on-chain documents', () => {
    expect(getDocumentListActions('participant', documents[1]))
      .toEqual(['Open', 'View / Download']);
  });

  it('states the result count and keeps secondary actions in an accessible control', () => {
    render(createElement(DocumentsPage));

    expect(screen.getByText('2 documents')).toBeTruthy();
    expect(within(screen.getByRole('table')).getByRole('button', { name: 'More actions for Lease Agreement.pdf' })).toBeTruthy();
  });
});
