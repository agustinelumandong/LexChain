import { afterEach, expect, it, vi } from 'vitest';
import { verifyRepositoryDocument } from './integrity-api';

afterEach(() => {
  vi.restoreAllMocks();
});

it('gets a verification request through the same-origin portal route', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ document_id: 'document-123', data_hash: 'hash' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);

  await verifyRepositoryDocument('document-123');

  expect(fetchMock).toHaveBeenCalledWith('/api/portal/blockchain/verify/document-123', {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });
});
