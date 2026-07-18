import { describe, expect, it } from 'vitest';
import { getDocumentListActions, getVisibleDocuments } from './document-library';

const documents = [
  {
    id: 'document-1',
    document_number: 102,
    file_name: 'Lease Agreement.pdf',
    status: 'processing',
    on_chain: false,
    updated_at: '2026-07-13T13:30:00.000Z',
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

  it('offers only existing list actions and never unsupported workflow actions', () => {
    const actions = getDocumentListActions(documents[1]);

    expect(actions).toEqual(['Open', 'View / Download', 'Verify integrity']);
    expect(actions).not.toContain('Delete');
    expect(actions).not.toContain('Finalize');
    expect(actions).not.toContain('Anchor');
    expect(actions).not.toContain('Versions');
    expect(actions).not.toContain('Participants');
  });
});
