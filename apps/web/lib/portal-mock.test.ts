import { describe, expect, it } from 'vitest';
import { mockPortalGet, mockPortalMutate } from './portal-mock';

describe('portal mock mutations', () => {
  it('accepts an upload path with the required book and file-name query values', async () => {
    const form = new FormData();
    form.append('file', new File(['PDF'], 'original.pdf', { type: 'application/pdf' }));
    const request = new Request('https://mock.lexchain.local/api/portal/proxy-post', {
      method: 'POST',
      body: form,
    });

    const response = await mockPortalMutate(
      'POST',
      '/documents/upload?book_id=book-1&file_name=Deed%20of%20Sale',
      request,
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ status: 'completed' });
  });
});

describe('portal mock profiles', () => {
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

  it('keeps the fixed document issuer when a participant fetches document parties', async () => {
    const response = mockPortalGet('/documents/mock-document-1/parties', 'mock-token:mock-user');

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
      requests: [{ id: 'mock-request-1', status: 'pending' }],
    });
    expect(participant.status).toBe(403);
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
