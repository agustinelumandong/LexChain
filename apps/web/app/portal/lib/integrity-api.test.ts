import { afterEach, expect, it, vi } from 'vitest';
import { getBlockchainRecord } from './integrity-api';

afterEach(() => {
  vi.restoreAllMocks();
});

it('posts a record request through the same-origin portal route without a body', async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ document_id: 'document-123', transaction_hash: '0xabc' }), {
      status: 201,
      headers: { 'content-type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fetchMock);

  await getBlockchainRecord('document-123');

  expect(fetchMock).toHaveBeenCalledWith('/api/portal/blockchain/record/document-123', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
  });
});
