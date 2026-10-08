import { afterEach, describe, expect, it, vi } from 'vitest';
import { finalizeDocument } from '@/features/documents/document-lifecycle-api';

const record = {
  document_id: 'document-1',
  tx_hash: '0xtxhash',
  onchain_document_id: 'onchain-document-1',
  data_hash: 'datahash',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('document lifecycle client', () => {
  it('finalizes through the existing same-origin mutation proxy', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(record));
    vi.stubGlobal('fetch', fetchMock);

    await expect(finalizeDocument('document-1')).resolves.toEqual(record);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Ffinalize',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rejects a blank document ID before fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(finalizeDocument('  ')).rejects.toThrow('Document ID is required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('preserves the message returned by the mock lifecycle endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ message: 'Document cannot be finalized' }, { status: 400 }),
    ));

    await expect(finalizeDocument('document-1')).rejects.toThrow('Document cannot be finalized');
  });
});
