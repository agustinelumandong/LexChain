import { describe, expect, it } from 'vitest';
import { mockPortalMutate } from './portal-mock';

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
