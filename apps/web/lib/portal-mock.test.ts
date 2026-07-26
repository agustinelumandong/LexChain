import { describe, expect, it } from 'vitest';
import { isMockPortalToken, mockPortalGet, mockPortalMutate } from './portal-mock';

describe('portal mock mutations', () => {
  it('finalizes a completed draft once and retains its snapshot audit trail', async () => {
    const first = await mockPortalMutate(
      'POST',
      '/documents/mock-document-2/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-lawyer',
    );

    expect(first.status).toBe(200);
    await expect(first.json()).resolves.toMatchObject({
      lifecycle: 'finalized',
      document_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
      finalized_by: 'mock-lawyer',
      anchor_status: 'confirmed',
      snapshots: [expect.objectContaining({ document_id: 'mock-document-2' })],
    });

    const snapshots = mockPortalGet('/documents/mock-document-2/snapshots', 'mock-token:mock-lawyer');
    await expect(snapshots.json()).resolves.toHaveLength(1);

    const second = await mockPortalMutate(
      'POST',
      '/documents/mock-document-2/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-lawyer',
    );
    expect(second.status).toBe(200);

    const audits = await mockPortalGet('/documents/mock-document-2/audit-logs', 'mock-token:mock-lawyer').json();
    expect(audits.filter((audit: { action: string }) => audit.action === 'document_finalized')).toHaveLength(1);
  });

  it('restores a mismatched finalized document from its retained snapshot with a reason', async () => {
    const integrity = mockPortalGet('/blockchain/verify/mock-document-3', 'mock-token:mock-lawyer');
    await expect(integrity.json()).resolves.toMatchObject({ is_verified: false });
    const sourceSnapshots = await mockPortalGet('/documents/mock-document-3/snapshots', 'mock-token:mock-lawyer').json();
    const blankReason = await mockPortalMutate(
      'POST',
      '/documents/mock-document-3/snapshots/mock-snapshot-3/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: '   ' }),
      }),
      'mock-token:mock-lawyer',
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
      'mock-token:mock-lawyer',
    );

    expect(restored.status).toBe(200);
    await expect(restored.json()).resolves.toMatchObject({ lifecycle: 'restored', snapshots: sourceSnapshots });
    const audits = await mockPortalGet('/documents/mock-document-3/audit-logs', 'mock-token:mock-lawyer').json();
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
      'mock-token:mock-lawyer',
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
      'mock-token:mock-user',
    );

    expect(response.status).toBe(403);
  });
});

describe('portal mock profiles', () => {
  it('rejects unknown mock token values instead of treating them as issuers', () => {
    expect(isMockPortalToken('mock-token:unknown-user')).toBe(false);
  });

  it('returns the participant profile for a user token while preserving the issuer profile for a lawyer token', async () => {
    const participant = mockPortalGet('/users/', 'mock-token:mock-user');
    const issuer = mockPortalGet('/users/', 'mock-token:mock-lawyer');

    await expect(participant.json()).resolves.toMatchObject({
      email: 'user@example.com',
      role: 'user',
    });
    await expect(issuer.json()).resolves.toMatchObject({
      role: 'lawyer',
    });
  });

  it('keeps the fixed document issuer when an issuer fetches document parties', async () => {
    const response = mockPortalGet('/documents/mock-document-1/parties', 'mock-token:mock-lawyer');

    await expect(response.json()).resolves.toMatchObject({
      issuer: {
        f_name: 'Jane',
        l_name: 'Doe',
        email: 'jane.doe@lexchain.local',
        role: 'issuer',
      },
    });
  });
});

describe('portal mock document isolation', () => {
  it('exposes only the seeded shared document to a participant before access is accepted', async () => {
    const documents = mockPortalGet('/documents/', 'mock-token:mock-user');
    const detail = mockPortalGet('/documents/mock-document-2', 'mock-token:mock-user');

    await expect(documents.json()).resolves.toMatchObject([{ id: 'mock-document-4' }]);
    expect(detail.status).toBe(403);
  });
});

describe('portal mock books', () => {
  it('lists active issuer books and creates a book that can be used for upload', async () => {
    const initial = mockPortalGet('/books/?limit=50&offset=0', 'mock-token:mock-lawyer');
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
      'mock-token:mock-lawyer',
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
      'mock-token:mock-lawyer',
    );
    expect(upload.status).toBe(201);
  });

  it('denies participant book access and book registration', async () => {
    expect(mockPortalGet('/books/', 'mock-token:mock-user').status).toBe(403);
    const response = await mockPortalMutate(
      'POST',
      '/books/',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ book_number: 3, series_year: 2026 }),
      }),
      'mock-token:mock-user',
    );
    expect(response.status).toBe(403);
  });
});

describe('portal mock participant invitations and requests', () => {
  it('returns pending invitations only to the mock participant', async () => {
    const participant = mockPortalGet('/documents/invitations', 'mock-token:mock-user');
    const issuer = mockPortalGet('/documents/invitations', 'mock-token:mock-lawyer');

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
      'mock-token:mock-user',
    );

    expect(response.status).toBe(204);
    await expect(mockPortalGet('/documents/invitations', 'mock-token:mock-user').json()).resolves.toEqual([]);
    await expect(mockPortalGet('/documents/mock-document-1', 'mock-token:mock-user').json()).resolves.toMatchObject({
      document_id: 'mock-document-1',
    });
  });

  it('does not let a participant finalize or restore the seeded shared document', async () => {
    const finalize = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-user',
    );
    const restore = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/snapshots/mock-snapshot-4/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'No access.' }),
      }),
      'mock-token:mock-user',
    );

    expect(finalize.status).toBe(403);
    expect(restore.status).toBe(403);
  });

  it('does not let an issuer mutate the seeded participant-shared document lifecycle', async () => {
    const finalize = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/finalize',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-lawyer',
    );
    const restore = await mockPortalMutate(
      'POST',
      '/documents/mock-document-4/snapshots/mock-snapshot-4/restore',
      new Request('https://mock.lexchain.local/api/portal/proxy-post', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reason: 'Issuer access is still read-only.' }),
      }),
      'mock-token:mock-lawyer',
    );

    expect(finalize.status).toBe(403);
    expect(restore.status).toBe(403);
  });

  it.each(['accept', 'reject'] as const)('denies an issuer attempting to %s a participant invitation', async (action) => {
    const response = await mockPortalMutate(
      'POST',
      `/documents/mock-document-1/parties/${action}`,
      new Request('https://mock.lexchain.local/api/portal/proxy-post', { method: 'POST' }),
      'mock-token:mock-lawyer',
    );

    expect(response.status).toBe(403);
  });

  it('returns request history only to the mock participant', async () => {
    const participant = mockPortalGet('/requests/my', 'mock-token:mock-user');
    const issuer = mockPortalGet('/requests/my', 'mock-token:mock-lawyer');

    const history = await participant.json();
    expect(history).toMatchObject({ total: 2 });
    expect(history.requests).toContainEqual(expect.objectContaining({ id: 'mock-request-1', requester_email: 'user@example.com' }));
    expect(issuer.status).toBe(403);
  });
});

describe('portal mock issuer request review', () => {
  it('lists and filters requests only for the mock issuer', async () => {
    const issuer = mockPortalGet('/requests?status=pending', 'mock-token:mock-lawyer');
    const participant = mockPortalGet('/requests', 'mock-token:mock-user');

    await expect(issuer.json()).resolves.toMatchObject({
      total: 1,
      requests: [{ id: 'mock-request-1', status: 'pending', lawyer_id: 'mock-lawyer' }],
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
      'mock-token:mock-user',
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
      'mock-token:mock-lawyer',
    );

    await expect(response.json()).resolves.toMatchObject({
      id: 'mock-request-1', status: 'rejected', rejection_reason: 'Please provide a signed copy.',
    });
    const history = await mockPortalGet('/requests/my', 'mock-token:mock-user').json();
    expect(history.requests).toContainEqual(expect.objectContaining({
      id: 'mock-request-1', status: 'rejected', rejection_reason: 'Please provide a signed copy.',
    }));
  });
});
