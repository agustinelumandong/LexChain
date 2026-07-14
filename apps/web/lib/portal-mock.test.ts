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
});
