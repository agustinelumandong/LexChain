import { describe, expect, it, vi } from 'vitest';
import { isMockPortalToken, mockPortalGet, mockPortalMutate } from './portal-mock';

describe('portal mock mutations', () => {
  it('finalizes a completed draft once and retains its snapshot audit trail', async () => {
    const first = await mockPortalMutate(
      'POST',
      '/documents/mock-document-2/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-issuer',
    );

    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({
      lifecycle: 'finalized',
      on_chain: true,
      document_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      finalized_by: 'mock-document-issuer',
      anchor_status: 'confirmed',
      snapshots: [expect.objectContaining({ document_id: 'mock-document-2' })],
    });

    const snapshots = mockPortalGet('/documents/mock-document-2/snapshots', 'mock-token:mock-document-issuer');
    await expect(snapshots.json()).resolves.toHaveLength(1);
    await expect(mockPortalGet('/blockchain/verify/mock-document-2', 'mock-token:mock-document-issuer').json()).resolves.toMatchObject({
      document_id: 'mock-document-2',
      is_verified: true,
    });
    const repository = await mockPortalGet('/documents/', 'mock-token:mock-document-issuer').json() as Array<{ document_id: string; on_chain: boolean }>;
    expect(repository.filter((document) => document.on_chain)).toHaveLength(3);
    expect(repository.find((document) => document.document_id === 'mock-document-2')).toMatchObject({ on_chain: true });

    const second = await mockPortalMutate(
      'POST',
      '/documents/mock-document-2/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-issuer',
    );
    expect(second.status).toBe(200);

    const audits = await mockPortalGet('/documents/mock-document-2/audit-logs', 'mock-token:mock-document-issuer').json();
    expect(audits.filter((audit: { action: string }) => audit.action === 'document_finalized')).toHaveLength(1);
  });

  it('restores a mismatched finalized document from its retained snapshot with a reason', async () => {
    const integrity = mockPortalGet('/blockchain/verify/mock-document-3', 'mock-token:mock-document-issuer');
    await expect(integrity.json()).resolves.toMatchObject({ is_verified: false });
    const sourceSnapshots = await mockPortalGet('/documents/mock-document-3/snapshots', 'mock-token:mock-document-issuer').json();
    const blankReason = await mockPortalMutate(
      'POST',
      '/documents/mock-document-3/snapshots/mock-snapshot-3/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: '   ' }),
      }),
      'mock-token:mock-document-issuer',
    );
    expect(blankReason.status).toBe(400);

    const restored = await mockPortalMutate(
      'POST',
      '/documents/mock-document-3/snapshots/mock-snapshot-3/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'Restore the verified snapshot.' }),
      }),
      'mock-token:mock-document-issuer',
    );

    expect(restored.status).toBe(200);
    await expect(restored.json()).resolves.toMatchObject({ lifecycle: 'restored', snapshots: sourceSnapshots });
    const audits = await mockPortalGet('/documents/mock-document-3/audit-logs', 'mock-token:mock-document-issuer').json();
    expect(audits).toContainEqual(expect.objectContaining({
      action: 'document_restored',
      details: { snapshot_id: 'mock-snapshot-3', reason: 'Restore the verified snapshot.' },
    }));
  });

  it('rejects an issuer restore request when the integrity state is not a mismatch', async () => {
    const response = await mockPortalMutate(
      'POST',
      '/documents/mock-document-1/snapshots/mock-snapshot-1/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'A matching document cannot be restored.' }),
      }),
      'mock-token:mock-document-issuer',
    );

    expect(response.status).toBe(400);
  });

  it('accepts an upload path with the required book and file-name query values', async () => {
    const form = new FormData();
    form.append('file', new File(['PDF'], 'original.pdf', { type: 'application/pdf' }));
    const request = new Request('https://mock.lexchain.local/api/portal/proxy-post', {
      method: 'POST',
      body: form,
    });

    const response = await mockPortalMutate(
      'POST',
      '/documents/upload?book_id=mock-book-1&file_name=Deed%20of%20Sale',
      request,
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ status: 'completed' });
  });

  it('rejects an upload that omits the required file-name metadata', async () => {
    const form = new FormData();
    form.append('file', new File(['PDF'], 'missing-metadata.pdf', { type: 'application/pdf' }));

    const response = await mockPortalMutate(
      'POST',
      '/documents/upload?book_id=mock-book-1',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST', body: form }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects an upload with blank file-name metadata', async () => {
    const form = new FormData();
    form.append('file', new File(['PDF'], 'blank-metadata.pdf', { type: 'application/pdf' }));

    const response = await mockPortalMutate(
      'POST',
      '/documents/upload?book_id=mock-book-1&file_name=%20%20%20',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST', body: form }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects an upload with invalid file-name metadata', async () => {
    const form = new FormData();
    form.append('file', new File(['PDF'], 'invalid-metadata.pdf', { type: 'application/pdf' }));

    const response = await mockPortalMutate(
      'POST',
      '/documents/upload?book_id=mock-book-1&file_name=Invalid%00title',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST', body: form }),
    );

    expect(response.status).toBe(400);
  });

  it('persists file-name metadata instead of the multipart filename', async () => {
    const form = new FormData();
    form.append('file', new File(['PDF'], 'multipart-name.pdf', { type: 'application/pdf' }));

    const upload = await mockPortalMutate(
      'POST',
      '/documents/upload?book_id=mock-book-1&file_name=Issuer%20document%20title',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST', body: form }),
    );

    const { document_id } = await upload.json() as { document_id: string };
    await expect(mockPortalGet(`/documents/${document_id}`).json()).resolves.toMatchObject({
      file_name: 'Issuer document title',
    });
  });

  it('denies a participant document upload', async () => {
    const form = new FormData();
    form.append('file', new File(['PDF'], 'participant.pdf', { type: 'application/pdf' }));
    const response = await mockPortalMutate(
      'POST',
      '/documents/upload?book_id=mock-book-1&file_name=Participant',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST', body: form }),
      'mock-token:mock-document-participant',
    );

    expect(response.status).toBe(403);
  });
});

describe('portal mock profiles', () => {
  it('rejects unknown mock token values instead of treating them as issuers', () => {
    expect(isMockPortalToken('mock-token:unknown-user')).toBe(false);
  });

  it('recognizes only the canonical Document Issuer and Document Participant profiles', async () => {
    const participant = mockPortalGet('/users/', 'mock-token:mock-document-participant');
    const issuer = mockPortalGet('/users/', 'mock-token:mock-document-issuer');
    const participantDocuments = mockPortalGet('/documents/', 'mock-token:mock-document-participant');

    expect(isMockPortalToken('mock-token:mock-admin')).toBe(false);
    expect(isMockPortalToken('mock-token:mock-lawyer')).toBe(false);
    expect(isMockPortalToken('mock-token:mock-owner')).toBe(false);

    await expect(participant.json()).resolves.toMatchObject({
      email: 'participant@example.com',
      role: 'document_participant',
    });
    await expect(issuer.json()).resolves.toMatchObject({
      email: 'issuer@example.com',
      role: 'document_issuer',
    });
    await expect(participantDocuments.json()).resolves.toEqual([
      expect.objectContaining({ id: 'mock-document-4' }),
    ]);
  });

  it('keeps the fixed document issuer when an issuer fetches document parties', async () => {
    const response = mockPortalGet('/documents/mock-document-1/parties', 'mock-token:mock-document-issuer');

    await expect(response.json()).resolves.toMatchObject({
      issuer: {
        f_name: 'Document',
        l_name: 'Issuer',
        email: 'issuer@example.com',
        role: 'issuer',
      },
    });
  });
});

describe('portal mock document isolation', () => {
  it('exposes only the seeded shared document to a participant before access is accepted', async () => {
    const documents = mockPortalGet('/documents/', 'mock-token:mock-document-participant');
    const detail = mockPortalGet('/documents/mock-document-2', 'mock-token:mock-document-participant');

    await expect(documents.json()).resolves.toMatchObject([{ id: 'mock-document-4' }]);
    expect(detail.status).toBe(403);
  });
});

describe('portal mock books', () => {
  it('lists active issuer books and creates a book that can be used for upload', async () => {
    const initial = mockPortalGet('/books/?limit=50&offset=0', 'mock-token:mock-document-issuer');
    expect(initial.status).toBe(200);
    await expect(initial.json()).resolves.toContainEqual(expect.objectContaining({ id: 'mock-book-1', is_full: false }));

    const created = await mockPortalMutate(
      'POST',
      '/books/',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ book_number: 2, series_year: 2026 }),
      }),
      'mock-token:mock-document-issuer',
    );

    expect(created.status).toBe(201);
    const book = await created.json();
    expect(book).toMatchObject({ book_number: 2, series_year: 2026, is_full: false });

    const form = new FormData();
    form.append('file', new File(['PDF'], 'registered-book.pdf', { type: 'application/pdf' }));
    const upload = await mockPortalMutate(
      'POST',
      `/documents/upload?book_id=${book.id}&file_name=Registered%20book`,
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST', body: form }),
      'mock-token:mock-document-issuer',
    );
    expect(upload.status).toBe(201);
  });

  it('denies participant book access and book registration', async () => {
    expect(mockPortalGet('/books/', 'mock-token:mock-document-participant').status).toBe(403);
    const response = await mockPortalMutate(
      'POST',
      '/books/',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ book_number: 3, series_year: 2026 }),
      }),
      'mock-token:mock-document-participant',
    );
    expect(response.status).toBe(403);
  });
});

describe('portal mock participant invitations and requests', () => {
  it('grants document access only when the participant accepts the invitation', async () => {
    vi.resetModules();
    const rejectedMock = await import('./portal-mock');
    const rejected = await rejectedMock.mockPortalMutate(
      'POST',
      '/documents/mock-document-1/parties/reject',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-participant',
    );

    expect(rejected.status).toBe(204);
    expect(rejectedMock.mockPortalGet('/documents/mock-document-1', 'mock-token:mock-document-participant').status).toBe(403);
    expect(rejectedMock.mockPortalGet('/blockchain/verify/mock-document-1', 'mock-token:mock-document-participant').status).toBe(404);

    vi.resetModules();
    const acceptedMock = await import('./portal-mock');
    const accepted = await acceptedMock.mockPortalMutate(
      'POST',
      '/documents/mock-document-1/parties/accept',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-participant',
    );

    expect(accepted.status).toBe(204);
    expect(acceptedMock.mockPortalGet('/documents/mock-document-1', 'mock-token:mock-document-participant').status).toBe(200);
    expect(acceptedMock.mockPortalGet('/blockchain/verify/mock-document-1', 'mock-token:mock-document-participant').status).toBe(200);
  });

  it('does not reveal an unshared document integrity record to the mock participant', async () => {
    const response = mockPortalGet('/blockchain/verify/mock-document-3', 'mock-token:mock-document-participant');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ message: 'On-chain record not found' });
  });

  it('returns pending invitations only to the mock participant', async () => {
    const participant = mockPortalGet('/documents/invitations', 'mock-token:mock-document-participant');
    const issuer = mockPortalGet('/documents/invitations', 'mock-token:mock-document-issuer');

    expect(participant.status).toBe(200);
    await expect(participant.json()).resolves.toMatchObject([
      { id: 'mock-invitation-1', document_id: 'mock-document-1', status: 'pending' },
    ]);
    expect(issuer.status).toBe(403);
  });

  it('accepts a participant invitation and leaves its document available for navigation', async () => {
    const response = await mockPortalMutate(
      'POST',
      '/documents/mock-document-1/parties/accept',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-participant',
    );

    expect(response.status).toBe(204);
    await expect(mockPortalGet('/documents/invitations', 'mock-token:mock-document-participant').json()).resolves.toEqual([]);
    await expect(mockPortalGet('/documents/mock-document-1', 'mock-token:mock-document-participant').json()).resolves.toMatchObject({
      document_id: 'mock-document-1',
    });
  });

  it('does not let a participant finalize or restore the seeded shared document', async () => {
    const finalize = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-participant',
    );
    const restore = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/snapshots/mock-snapshot-4/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'No access.' }),
      }),
      'mock-token:mock-document-participant',
    );

    expect(finalize.status).toBe(403);
    expect(restore.status).toBe(403);
  });

  it('does not let an issuer mutate the seeded participant-shared document lifecycle', async () => {
    const finalize = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-issuer',
    );
    const restore = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/snapshots/mock-snapshot-4/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'Issuer access is still read-only.' }),
      }),
      'mock-token:mock-document-issuer',
    );

    expect(finalize.status).toBe(403);
    expect(restore.status).toBe(403);
  });

  it.each(['accept', 'reject'] as const)('denies an issuer attempting to %s a participant invitation', async (action) => {
    const response = await mockPortalMutate(
      'POST',
      `/documents/mock-document-1/parties/${action}`,
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-issuer',
    );

    expect(response.status).toBe(403);
  });

  it('returns request history only to the mock participant', async () => {
    const participant = mockPortalGet('/requests/my', 'mock-token:mock-document-participant');
    const issuer = mockPortalGet('/requests/my', 'mock-token:mock-document-issuer');

    const history = await participant.json();
    expect(history).toMatchObject({ total: 2 });
    expect(history.requests).toContainEqual(expect.objectContaining({ id: 'mock-request-1', requester_email: 'participant@example.com' }));
    expect(issuer.status).toBe(403);
  });
});

describe('portal mock search and document questions', () => {
  it('scopes search and Ask to documents visible to the authenticated portal user', async () => {
    vi.resetModules();
    const scopedMock = await import('./portal-mock');
    const searchRequest = (query: string) => new Request('https://mock.lexchain.local/api/portal/proxy-post', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const askRequest = () => new Request('https://mock.lexchain.local/api/portal/proxy-post', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: 'What is this document about?' }),
    });

    const issuerSearch = await scopedMock.mockPortalMutate(
      'POST',
      '/search',
      searchRequest('Restoration Review'),
      'mock-token:mock-document-issuer',
    );
    await expect(issuerSearch.json()).resolves.toMatchObject({
      results: [expect.objectContaining({ document_id: 'mock-document-3' })],
    });
    expect((await scopedMock.mockPortalMutate(
      'POST',
      '/documents/mock-document-3/ask',
      askRequest(),
      'mock-token:mock-document-issuer',
    )).status).toBe(200);

    const privateSearch = await scopedMock.mockPortalMutate(
      'POST',
      '/search',
      searchRequest('Restoration Review'),
      'mock-token:mock-document-participant',
    );
    await expect(privateSearch.json()).resolves.toMatchObject({ results: [] });
    const privateAsk = await scopedMock.mockPortalMutate(
      'POST',
      '/documents/mock-document-3/ask',
      askRequest(),
      'mock-token:mock-document-participant',
    );
    expect(privateAsk.status).toBe(404);
    await expect(privateAsk.json()).resolves.toEqual({ message: 'Document not found' });

    await scopedMock.mockPortalMutate(
      'POST',
      '/documents/mock-document-1/parties/accept',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-document-participant',
    );
    const sharedSearch = await scopedMock.mockPortalMutate(
      'POST',
      '/search',
      searchRequest('Lease Agreement'),
      'mock-token:mock-document-participant',
    );
    await expect(sharedSearch.json()).resolves.toMatchObject({
      results: [expect.objectContaining({ document_id: 'mock-document-1' })],
    });
    expect((await scopedMock.mockPortalMutate(
      'POST',
      '/documents/mock-document-1/ask',
      askRequest(),
      'mock-token:mock-document-participant',
    )).status).toBe(200);
  });
});

describe('portal mock issuer request review', () => {
  it('lists and filters requests only for the mock issuer', async () => {
    const issuer = mockPortalGet('/requests?status=pending', 'mock-token:mock-document-issuer');
    const participant = mockPortalGet('/requests', 'mock-token:mock-document-participant');

    await expect(issuer.json()).resolves.toMatchObject({
      total: 1,
      requests: [{ id: 'mock-request-1', status: 'pending', lawyer_id: 'mock-document-issuer' }],
    });
    expect(participant.status).toBe(403);
  });

  it('denies a participant attempting to review an issuer request', async () => {
    const response = await mockPortalMutate(
      'PATCH',
      '/requests/mock-request-1/review',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      }),
      'mock-token:mock-document-participant',
    );

    expect(response.status).toBe(403);
  });

  it('records an issuer rejection and exposes its reason in participant history', async () => {
    const response = await mockPortalMutate(
      'PATCH',
      '/requests/mock-request-1/review',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejection_reason: 'Please provide a signed copy.' }),
      }),
      'mock-token:mock-document-issuer',
    );

    await expect(response.json()).resolves.toMatchObject({
      id: 'mock-request-1', status: 'rejected', rejection_reason: 'Please provide a signed copy.',
    });
    const history = await mockPortalGet('/requests/my', 'mock-token:mock-document-participant').json();
    expect(history.requests).toContainEqual(expect.objectContaining({
      id: 'mock-request-1', status: 'rejected', rejection_reason: 'Please provide a signed copy.',
    }));
  });
});
