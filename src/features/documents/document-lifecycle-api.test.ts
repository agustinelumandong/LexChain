import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  finalizeDocument,
  listDraftComments,
  markDocumentReady,
  reopenDocument,
  syncDraftComments,
} from '@/features/documents/document-lifecycle-api';

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
  it('lists and synchronizes comments through the same-origin proxies', async () => {
    const comments = { document_id: 'document-1', unresolved: 1, comments: [] };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(comments))
      .mockResolvedValueOnce(Response.json(comments));
    vi.stubGlobal('fetch', fetchMock);

    await expect(listDraftComments('document-1')).resolves.toEqual(comments);
    await expect(syncDraftComments('document-1')).resolves.toEqual(comments);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/portal/proxy?path=%2Fdocuments%2Fdocument-1%2Fcomments',
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fcomments%2Fsync',
    ]);
  });

  it('marks ready and reopens through permission-enforced backend mutations', async () => {
    const response = { document_id: 'document-1', lifecycle: 'READY_FOR_SIGNATURE' };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json(response))
      .mockResolvedValueOnce(Response.json(response));
    vi.stubGlobal('fetch', fetchMock);

    await expect(markDocumentReady('document-1')).resolves.toEqual(response);
    await expect(reopenDocument('document-1')).resolves.toEqual(response);

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Fready',
      '/api/portal/proxy-post?path=%2Fdocuments%2Fdocument-1%2Freopen',
    ]);
  });

  it('preserves the backend reason when readiness is rejected', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      Response.json({ detail: 'UNRESOLVED_COMMENTS: resolve all threads' }, { status: 409 }),
    ));

    await expect(markDocumentReady('document-1')).rejects.toThrow('UNRESOLVED_COMMENTS: resolve all threads');
  });

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
